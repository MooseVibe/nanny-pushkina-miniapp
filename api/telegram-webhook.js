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

function buildOpenAppLink(botUsername, startParam = "") {
  const clean = String(botUsername || "").replace(/^@/, "").trim();
  if (!clean) return "";
  if (!startParam) return `https://t.me/${clean}?startapp`;
  return `https://t.me/${clean}?startapp=${encodeURIComponent(startParam)}`;
}

function buildAdminUrl(adminUsernameOrUrl) {
  const v = String(adminUsernameOrUrl || "").trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  const clean = v.replace(/^@/, "");
  return `https://t.me/${clean}`;
}

function buildWelcomeMarkup(openAppUrl, adminUsernameOrUrl) {
  const adminUrl = buildAdminUrl(adminUsernameOrUrl);

  const inline_keyboard = [
    [{ text: "Открыть приложение", url: openAppUrl }],
  ];

  if (adminUrl) {
    inline_keyboard.push([{ text: "Написать администратору", url: adminUrl }]);
  }

  return { inline_keyboard };
}

function serialText(row) {
  return row?.serial_number ? `#${row.serial_number}` : "";
}

function adminActiveText(row, whoBookedText = "") {
  return (
    `🆕 <b>Новая запись</b> ${serialText(row)}\n\n` +
    `Кого: <b>${row.name}</b>\n` +
    `Занятие: <b>${row.lesson_title}</b>\n` +
    `Возраст: <b>${row.group_label}</b>\n` +
    `Дата/время: <b>${row.visit_date} • ${row.visit_time}</b>\n` +
    (whoBookedText ? `Кто записал: ${whoBookedText}` : "")
  );
}

function adminCancelledText(row, whoCancelledText = "") {
  // ВАЖНО: тут ТОЛЬКО "Кто отменил", без "Кто записал"
  return (
    `❌ <b>Отменено</b> ${serialText(row)}\n\n` +
    `Кого: <b>${row.name}</b>\n` +
    `Занятие: <b>${row.lesson_title}</b>\n` +
    `Возраст: <b>${row.group_label}</b>\n` +
    `Дата/время: <b>${row.visit_date} • ${row.visit_time}</b>\n` +
    (whoCancelledText ? `Кто отменил: ${whoCancelledText}` : "")
  );
}

// --------- time helpers (MSK, UTC+3) ----------
function mskNow() {
  // Москва без DST, просто UTC+3
  return new Date(Date.now() + 3 * 60 * 60 * 1000);
}

function startOfMskDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d, days) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function ddmm(d) {
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}`;
}

// visit_date у тебя строка типа "ПН, 08.01" — ищем по "08.01"
function buildVisitDateOrQuery(days) {
  // Supabase .or формат: "visit_date.ilike.%08.01%,visit_date.ilike.%09.01%"
  return days.map((d) => `visit_date.ilike.%${ddmm(d)}%`).join(",");
}

function isAdminChat(chatId, adminChatIdEnv) {
  return Number(chatId) === Number(adminChatIdEnv);
}

function formatStatusMark(status) {
  return status === "cancelled" ? "❌" : "✅";
}

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function buildDailySummaryText(title, dateLabel, rows) {
  const active = rows.filter((r) => r.status !== "cancelled").length;
  const cancelled = rows.filter((r) => r.status === "cancelled").length;

  const head =
    `📅 <b>${escapeHtml(title)}</b>\n` +
    `Дата: <b>${escapeHtml(dateLabel)}</b>\n` +
    `Всего: <b>${rows.length}</b> • Активных: <b>${active}</b> • Отмен: <b>${cancelled}</b>\n\n`;

  if (!rows.length) return head + `Пусто.`;

  // сортировка по времени (строка "16:00")
  const sorted = [...rows].sort((a, b) => String(a.visit_time).localeCompare(String(b.visit_time)));

  const lines = sorted.map((r) => {
    const num = r.serial_number ? `#${r.serial_number} ` : "";
    const status = formatStatusMark(r.status);
    return (
      `${status} ${num}<b>${escapeHtml(r.visit_time)}</b> • ` +
      `<b>${escapeHtml(r.lesson_title)}</b>\n` +
      `Кого: <b>${escapeHtml(r.name)}</b>\n` +
      `Возраст: <b>${escapeHtml(r.group_label)}</b>`
    );
  });

  return head + lines.join("\n\n");
}

function buildWeekSummaryText(title, fromLabel, toLabel, rows) {
  const active = rows.filter((r) => r.status !== "cancelled").length;
  const cancelled = rows.filter((r) => r.status === "cancelled").length;

  const head =
    `🗓️ <b>${escapeHtml(title)}</b>\n` +
    `Период: <b>${escapeHtml(fromLabel)} — ${escapeHtml(toLabel)}</b>\n` +
    `Всего: <b>${rows.length}</b> • Активных: <b>${active}</b> • Отмен: <b>${cancelled}</b>\n\n`;

  if (!rows.length) return head + `Пусто.`;

  // сгруппируем по visit_date (строка "ПН, 08.01")
  const map = new Map();
  for (const r of rows) {
    const key = String(r.visit_date || "—");
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(r);
  }

  // сортируем дни по dd.mm внутри строки (если нет — как есть)
  const keys = Array.from(map.keys()).sort((a, b) => {
    const ma = a.match(/(\d{2}\.\d{2})/);
    const mb = b.match(/(\d{2}\.\d{2})/);
    return String(ma?.[1] || a).localeCompare(String(mb?.[1] || b));
  });

  const blocks = keys.map((k) => {
    const dayRows = map.get(k).slice().sort((a, b) => String(a.visit_time).localeCompare(String(b.visit_time)));
    const lines = dayRows.map((r) => {
      const num = r.serial_number ? `#${r.serial_number} ` : "";
      const status = formatStatusMark(r.status);
      return `${status} ${num}<b>${escapeHtml(r.visit_time)}</b> • <b>${escapeHtml(r.lesson_title)}</b> — ${escapeHtml(r.name)} (${escapeHtml(r.group_label)})`;
    });
    return `📌 <b>${escapeHtml(k)}</b>\n` + lines.join("\n");
  });

  return head + blocks.join("\n\n");
}

function buildMonthAnalyticsText(rows) {
  const total = rows.length;
  const cancelled = rows.filter((r) => r.status === "cancelled").length;
  const active = total - cancelled;

  // популярность по занятиям (всего создано за 30 дней)
  const byLesson = new Map();
  const cancelledByLesson = new Map();

  for (const r of rows) {
    const key = String(r.lesson_title || "—");
    byLesson.set(key, (byLesson.get(key) || 0) + 1);
    if (r.status === "cancelled") {
      cancelledByLesson.set(key, (cancelledByLesson.get(key) || 0) + 1);
    }
  }

  const top = Array.from(byLesson.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const lines = top.map(([lessonTitle, cnt], idx) => {
    const canc = cancelledByLesson.get(lessonTitle) || 0;
    return `${idx + 1}) <b>${escapeHtml(lessonTitle)}</b> — <b>${cnt}</b> (отмен: <b>${canc}</b>)`;
  });

  const head =
    `📊 <b>Сводка за последние 30 дней</b>\n` +
    `Всего записей: <b>${total}</b>\n` +
    `Активных: <b>${active}</b>\n` +
    `Отмен: <b>${cancelled}</b>\n\n` +
    `🔥 <b>Топ занятий</b>\n`;

  return head + (lines.length ? lines.join("\n") : "Пусто.");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("ok");

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const BOT_USERNAME = process.env.BOT_USERNAME;
  const STARTAPP_PARAM = process.env.STARTAPP_PARAM || "";

  // ✅ admin contact (username or full url)
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "@nyanyaadmin";

  const update = req.body || {};
  if (!BOT_TOKEN) return res.status(200).send("ok");

  // -----------------------------
  // 1) messages: /start + admin commands
  // -----------------------------
  const msg = update?.message;
  if (msg && typeof msg.text === "string") {
    const text = msg.text.trim();
    const chatId = msg.chat?.id;

    // --- /start ---
    if (text === "/start" || text.startsWith("/start ")) {
      const openAppUrl = buildOpenAppLink(BOT_USERNAME, STARTAPP_PARAM);

      if (!openAppUrl) {
        await tgApi(BOT_TOKEN, "sendMessage", {
          chat_id: chatId,
          text:
            `Привет! 👋\n\n` +
            `Сейчас не настроен BOT_USERNAME, поэтому кнопку открыть приложение показать не могу.\n` +
            `Напиши разработчику 🙂`,
        });
        return res.status(200).send("ok");
      }

      await tgApi(BOT_TOKEN, "sendMessage", {
        chat_id: chatId,
        text:
          `Привет! 👋\n\n` +
          `Это бот Няни Пушкина.\n` +
          `Здесь ты можешь записаться на занятия «Выше».\n\n` +
          `Жми кнопку ниже 👇`,
        reply_markup: buildWelcomeMarkup(openAppUrl, ADMIN_USERNAME),
      });

      return res.status(200).send("ok");
    }

    // --- admin commands ---
    const isAdmin = ADMIN_CHAT_ID && isAdminChat(chatId, ADMIN_CHAT_ID);

    if (text === "/today" || text === "/tomorrow" || text === "/week" || text === "/month") {
      if (!isAdmin) {
        await tgApi(BOT_TOKEN, "sendMessage", {
          chat_id: chatId,
          text: `Команда недоступна.`,
        });
        return res.status(200).send("ok");
      }

      if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        await tgApi(BOT_TOKEN, "sendMessage", {
          chat_id: chatId,
          text: `Ошибка: не настроены переменные Supabase.`,
        });
        return res.status(200).send("ok");
      }

      const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const now = mskNow();
      const today = startOfMskDay(now);

      try {
        if (text === "/today") {
          const target = today;
          const orQuery = buildVisitDateOrQuery([target]);

          const { data, error } = await sb
            .from("bookings")
            .select("serial_number, lesson_title, name, group_label, visit_date, visit_time, status")
            .or(orQuery)
            .order("visit_time", { ascending: true });

          if (error) throw error;

          const out = buildDailySummaryText("Записи на сегодня", ddmm(target), data || []);
          await tgApi(BOT_TOKEN, "sendMessage", { chat_id: chatId, text: out, parse_mode: "HTML" });
          return res.status(200).send("ok");
        }

        if (text === "/tomorrow") {
          const target = addDays(today, 1);
          const orQuery = buildVisitDateOrQuery([target]);

          const { data, error } = await sb
            .from("bookings")
            .select("serial_number, lesson_title, name, group_label, visit_date, visit_time, status")
            .or(orQuery)
            .order("visit_time", { ascending: true });

          if (error) throw error;

          const out = buildDailySummaryText("Записи на завтра", ddmm(target), data || []);
          await tgApi(BOT_TOKEN, "sendMessage", { chat_id: chatId, text: out, parse_mode: "HTML" });
          return res.status(200).send("ok");
        }

        if (text === "/week") {
          const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));
          const orQuery = buildVisitDateOrQuery(days);

          const { data, error } = await sb
            .from("bookings")
            .select("serial_number, lesson_title, name, group_label, visit_date, visit_time, status")
            .or(orQuery);

          if (error) throw error;

          const out = buildWeekSummaryText(
            "Записи на 7 дней",
            ddmm(days[0]),
            ddmm(days[days.length - 1]),
            data || []
          );

          await tgApi(BOT_TOKEN, "sendMessage", { chat_id: chatId, text: out, parse_mode: "HTML" });
          return res.status(200).send("ok");
        }

        if (text === "/month") {
          // Сводка за последние 30 дней по факту создания записи.
          // Требует, чтобы в таблице bookings была колонка created_at (timestamp).
          // В Supabase часто она есть, но если нет — добавишь.
          const from = new Date(mskNow().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

          const { data, error } = await sb
            .from("bookings")
            .select("lesson_title, status, created_at")
            .gte("created_at", from);

          if (error) {
            // понятная подсказка, если created_at нет
            const msgText =
              `Не могу собрать /month: похоже, в таблице <b>bookings</b> нет колонки <b>created_at</b>.\n\n` +
              `Сделай её (timestamp, default now()) — и команда заработает.`;
            await tgApi(BOT_TOKEN, "sendMessage", { chat_id: chatId, text: msgText, parse_mode: "HTML" });
            return res.status(200).send("ok");
          }

          const out = buildMonthAnalyticsText(data || []);
          await tgApi(BOT_TOKEN, "sendMessage", { chat_id: chatId, text: out, parse_mode: "HTML" });
          return res.status(200).send("ok");
        }
      } catch (e) {
        console.error("admin command error:", e?.message || e);
        await tgApi(BOT_TOKEN, "sendMessage", {
          chat_id: chatId,
          text: `Ошибка выполнения команды. Проверь логи.`,
        });
        return res.status(200).send("ok");
      }
    }

    // если это обычное сообщение — просто ок
    return res.status(200).send("ok");
  }

  // -----------------------------
  // 2) callbacks: cancel booking
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

    // отменять может только тот, кто записал
    if (Number(row.user_id) !== Number(fromId)) {
      await safeAnswerCallback(BOT_TOKEN, callbackQueryId, "Это не ваша запись");
      return res.status(200).send("ok");
    }

    if (row.status === "cancelled") {
      await safeAnswerCallback(BOT_TOKEN, callbackQueryId, "Уже отменено");
      return res.status(200).send("ok");
    }

    // 1) обновляем статус
    const { error: updErr } = await sb
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    if (updErr) throw updErr;

    await safeAnswerCallback(BOT_TOKEN, callbackQueryId, "Запись отменена ✅");

    // 2) пользователю — короткое подтверждение (без "кто отменил", это и так он)
    await tgApi(BOT_TOKEN, "sendMessage", {
      chat_id: fromId,
      text:
        `❌ <b>Запись отменена</b>\n\n` +
        `<b>${row.lesson_title}</b>\n` +
        `${row.visit_date} • ${row.visit_time}`,
      parse_mode: "HTML",
    });

    // 3) для админа — редактируем старое сообщение
    const username = cq.from?.username ? String(cq.from.username).replace(/^@/, "") : "";
    const firstName = cq.from?.first_name || "Пользователь";
    const whoCancelled = username
      ? `@${username}`
      : `<a href="tg://user?id=${fromId}">${escapeHtml(firstName)}</a>`;

    const adminChatId = row.admin_chat_id ? Number(row.admin_chat_id) : Number(ADMIN_CHAT_ID);
    const adminMessageId = row.admin_message_id;

    if (adminChatId && adminMessageId) {
      await tgApi(BOT_TOKEN, "editMessageText", {
        chat_id: adminChatId,
        message_id: adminMessageId,
        text: adminCancelledText(row, whoCancelled),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });
    } else {
      await tgApi(BOT_TOKEN, "sendMessage", {
        chat_id: ADMIN_CHAT_ID,
        text: adminCancelledText(row, whoCancelled),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });
    }

    return res.status(200).send("ok");
  } catch (e) {
    console.error("telegram.webhook error:", e?.message || e);
    await safeAnswerCallback(BOT_TOKEN, callbackQueryId, "Ошибка отмены. Попробуйте ещё раз.");
    return res.status(200).send("ok");
  }
}