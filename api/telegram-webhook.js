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

/**
 * ВАЖНО:
 * - Для "нативного fullscreen" нужен MAIN MINI APP, открытый по direct link:
 *   https://t.me/botusername?startapp
 * - Кнопка web_app (reply keyboard) чаще открывает WebView (не то, что тебе нужно).
 */
function buildOpenAppLink(botUsername, startParam = "") {
  const clean = String(botUsername || "").replace(/^@/, "").trim();
  if (!clean) return "";

  if (!startParam) {
    // формат из доков: https://t.me/botusername?startapp
    return `https://t.me/${clean}?startapp`;
  }

  return `https://t.me/${clean}?startapp=${encodeURIComponent(startParam)}`;
}

function buildWelcomeMarkup(openAppUrl) {
  // Делай INLINE keyboard, потому что это ссылка (direct link), которая открывает main mini app
  return {
    inline_keyboard: [[{ text: "Открыть приложение", url: openAppUrl }]],
  };
}

export default async function handler(req, res) {
  // Telegram ждёт 200 OK быстро. Всегда отвечаем.
  if (req.method !== "POST") return res.status(200).send("ok");

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // НОВОЕ: username бота (без @)
  const BOT_USERNAME = process.env.BOT_USERNAME; // например: "Nanny_pushkina_bot"
  // Опционально: что передавать в startapp (можно пусто)
  const STARTAPP_PARAM = process.env.STARTAPP_PARAM || ""; // например: "home"

  const update = req.body || {};

  if (!BOT_TOKEN) return res.status(200).send("ok");

  // -----------------------------
  // 1) /start (welcome message)
  // -----------------------------
  const msg = update?.message;
  if (msg && typeof msg.text === "string") {
    const text = msg.text.trim();
    if (text === "/start" || text.startsWith("/start ")) {
      const chatId = msg.chat?.id;

      const openAppUrl = buildOpenAppLink(BOT_USERNAME, STARTAPP_PARAM);

      if (!openAppUrl) {
        // Если ты забыл BOT_USERNAME — бот не упадёт, но и кнопку не покажет нормально.
        await tgApi(BOT_TOKEN, "sendMessage", {
          chat_id: chatId,
          text:
            `Привет! 👋\n\n` +
            `Тебя приветствует бот Няни Пушкина.\n` +
            `Сейчас не настроен BOT_USERNAME, поэтому кнопку открыть приложение показать не могу.\n\n` +
            `Напиши разработчику 😄`,
        });
        return res.status(200).send("ok");
      }

      const welcomeText =
        `Привет! 👋\n\n` +
        `Тебя приветствует бот Няни Пушкина.\n` +
        `Здесь ты можешь записаться на занятия «Выше».\n\n` +
        `Жми кнопку ниже 👇`;

      await tgApi(BOT_TOKEN, "sendMessage", {
        chat_id: chatId,
        text: welcomeText,
        reply_markup: buildWelcomeMarkup(openAppUrl),
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