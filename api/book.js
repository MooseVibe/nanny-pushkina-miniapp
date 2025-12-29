import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

function safeDecodeInitData(initData) {
  // Иногда строка уже декодирована — не ломаем
  try {
    return initData.includes("%") ? decodeURIComponent(initData) : initData;
  } catch {
    return initData;
  }
}

function parseInitData(initData) {
  const decoded = safeDecodeInitData(initData);
  const params = new URLSearchParams(decoded);
  const data = {};
  for (const [k, v] of params.entries()) data[k] = v;
  return data;
}

function validateInitData(initData, botToken) {
  const data = parseInitData(initData);

  const hash = data.hash;
  if (!hash) return { ok: false, reason: "No hash", data };

  delete data.hash;

  // Telegram: key=value, сортировка по ключу, join "\n"
  const checkString = Object.keys(data)
    .sort()
    .map((k) => `${k}=${data[k]}`)
    .join("\n");

  // ✅ Правильный секрет для WebApp initData:
  // secret = HMAC_SHA256("WebAppData", botToken)
  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  // hash = HMAC_SHA256(secretKey, checkString)
  const hmac = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  return { ok: hmac === hash, reason: hmac === hash ? "" : "Bad signature", data };
}

async function tgSendMessage(token, chatId, text, replyMarkup) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_markup: replyMarkup,
    }),
  });

  const json = await res.json();
  if (!json.ok) throw new Error(`TG sendMessage failed: ${json.description}`);
  return json.result;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST")
      return res.status(405).json({ ok: false, error: "Method not allowed" });

    const BOT_TOKEN = process.env.BOT_TOKEN;
    const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!BOT_TOKEN || !ADMIN_CHAT_ID || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ ok: false, error: "Missing env vars" });
    }

    const { payload, initData } = req.body || {};
    if (!payload || !initData) {
      return res.status(400).json({ ok: false, error: "Missing payload/initData" });
    }

    const v = validateInitData(initData, BOT_TOKEN);
    if (!v.ok) return res.status(401).json({ ok: false, error: v.reason });

    const user = JSON.parse(v.data.user || "{}");
    const userId = user?.id;
    if (!userId) return res.status(400).json({ ok: false, error: "No user id" });

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const insert = {
      user_id: userId,
      lesson_title: payload.lessonTitle,
      name: payload.name,
      group_label: payload.group,
      visit_date: payload.date,
      visit_time: payload.time,
      status: "active",
    };

    const { data: rows, error } = await sb.from("bookings").insert(insert).select("id").limit(1);
    if (error) throw error;

    const bookingId = rows?.[0]?.id;
    if (!bookingId) throw new Error("No bookingId");

    // ----- сообщение пользователю -----
    const userText =
      `✅ <b>Запись создана</b>\n\n` +
      `Занятие: <b>${insert.lesson_title}</b>\n` +
      `Кого: <b>${insert.name}</b>\n` +
      `Возраст: <b>${insert.group_label}</b>\n` +
      `Дата: <b>${insert.visit_date}</b>\n` +
      `Время: <b>${insert.visit_time}</b>\n`;

    const cancelMarkup = {
      inline_keyboard: [[{ text: "Отменить запись", callback_data: `cancel:${bookingId}` }]],
    };

    await tgSendMessage(BOT_TOKEN, userId, userText, cancelMarkup);

    // ----- сообщение админу: БЕЗ UserID/BookingID, но со ссылкой на человека -----
    const username = user?.username ? String(user.username).replace(/^@/, "") : "";
    const firstName = user?.first_name || "Пользователь";

    // если username есть — покажем @username, иначе дадим tg:// ссылку по id
    const whoBooked = username
      ? `@${username}`
      : `<a href="tg://user?id=${userId}">${firstName}</a>`;

    const adminText =
      `🆕 <b>Новая запись</b>\n\n` +
      `Кого: <b>${insert.name}</b>\n` +
      `Занятие: <b>${insert.lesson_title}</b>\n` +
      `Возраст: <b>${insert.group_label}</b>\n` +
      `Дата/время: <b>${insert.visit_date} • ${insert.visit_time}</b>\n` +
      `Кто записал: ${whoBooked}`;

    await tgSendMessage(BOT_TOKEN, ADMIN_CHAT_ID, adminText);

    return res.status(200).json({ ok: true, bookingId, userId });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}