import { createClient } from "@supabase/supabase-js";

async function tgApi(token, method, body) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!json.ok) throw new Error(`TG ${method} failed: ${json.description || "unknown error"}`);
  return json.result;
}

async function safeAnswerCallback(token, callbackQueryId, text) {
  try {
    await tgApi(token, "answerCallbackQuery", {
      callback_query_id: callbackQueryId,
      text,
      show_alert: false,
    });
  } catch (e) {
    console.error("answerCallbackQuery error:", e?.message || e);
  }
}

function buildWelcomeMarkup(webAppUrl) {
  // ВАЖНО: это именно web_app (не url)
  return {
    keyboard: [[{ text: "Открыть миниапп", web_app: { url: webAppUrl } }]],
    resize_keyboard: true,
    one_time_keyboard: false,
  };
}

export default async function handler(req, res) {
  // Telegram ждёт 200 OK быстро. Всегда отвечаем.
  if (req.method !== "POST") return res.status(200).send("ok");

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const WEBAPP_URL = process.env.WEBAPP_URL;

  const update = req.body || {};

  // Если env не поднялись — не падаем.
  if (!BOT_TOKEN) return res.status(200).send("ok");

  // -----------------------------
  // 1) /start (welcome message)
  // -----------------------------
  const msg = update?.message;
  if (msg && typeof msg.text === "string") {
    const text = msg.text.trim();
    if (text === "/start" || text.startsWith("/start ")) {
      const chatId = msg.chat?.id;

      // WEBAPP_URL обязателен, иначе кнопка бессмысленна
      const webAppUrl = WEBAPP_URL || "https://nanny-pushkina-miniapp.vercel.app";

      // Можно потом заменить на картинку (sendPhoto). Сейчас — просто текст.
      const welcomeText =
        `Привет! 👋\n\n` +
        `Тебя приветствует бот Няни Пушкина.\n` +
        `Здесь ты можешь записаться на занятия «Выше».\n\n` +
        `Жми кнопку ниже 👇`;

      await tgApi(BOT_TOKEN, "sendMessage", {
        chat_id: chatId,
        text: welcomeText,
        reply_markup: buildWelcomeMarkup(webAppUrl),
      });

      return res.status(200).send("ok");
    }
  }

  // -----------------------------
  // 2) Cancel booking (callback)
  // -----------------------------
  const cq = update?.callback_query;
  if (!cq) return res.status(200).send("ok");

  const callbackQueryId = cq.id;
  const fromId = cq.from?.id;
  const data = cq.data || "";

  if (!ADMIN_CHAT_ID || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    await safeAnswerCallback(BOT_TOKEN, callbackQueryId, "Сервис временно недоступен.");
    return res.status(200).send("ok");
  }

  // мгновенно снимаем “часики”
  await safeAnswerCallback(BOT_TOKEN, callbackQueryId, "Проверяю запись…");

  try {
    if (!data.startsWith("cancel:")) {
      await safeAnswerCallback(BOT_TOKEN, callbackQueryId, "Неизвестная команда");
      return res.status(200).send("ok");
    }

    const bookingId = data.split(":")[1];
    if (!bookingId) {
      await safeAnswerCallback(BOT_TOKEN, callbackQueryId, "Ошибка: нет id");
      return res.status(200).send("ok");
    }

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: row, error } = await sb
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .maybeSingle();

    if (error) throw error;
    if (!row) {
      await safeAnswerCallback(BOT_TOKEN, callbackQueryId, "Запись не найдена");
      return res.status(200).send("ok");
    }

    if (Number(row.user_id) !== Number(fromId)) {
      await safeAnswerCallback(BOT_TOKEN, callbackQueryId, "Это не ваша запись");
      return res.status(200).send("ok");
    }

    if (row.status === "cancelled") {
      await safeAnswerCallback(BOT_TOKEN, callbackQueryId, "Уже отменено");
      return res.status(200).send("ok");
    }

    const { error: updErr } = await sb
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    if (updErr) throw updErr;

    await safeAnswerCallback(BOT_TOKEN, callbackQueryId, "Запись отменена ✅");

    await tgApi(BOT_TOKEN, "sendMessage", {
      chat_id: fromId,
      text:
        `❌ <b>Запись отменена</b>\n\n` +
        `<b>${row.lesson_title}</b>\n` +
        `${row.visit_date} • ${row.visit_time}`,
      parse_mode: "HTML",
    });

    await tgApi(BOT_TOKEN, "sendMessage", {
      chat_id: ADMIN_CHAT_ID,
      text:
        `❌ <b>Отмена записи</b>\n\n` +
        `Кого: <b>${row.name}</b>\n` +
        `Занятие: <b>${row.lesson_title}</b>\n` +
        `Возраст: <b>${row.group_label}</b>\n` +
        `Дата/время: <b>${row.visit_date} • ${row.visit_time}</b>`,
      parse_mode: "HTML",
    });

    return res.status(200).send("ok");
  } catch (e) {
    console.error("telegram.webhook error:", e?.message || e);
    await safeAnswerCallback(BOT_TOKEN, callbackQueryId, "Ошибка отмены. Попробуйте ещё раз.");
    return res.status(200).send("ok");
  }
}