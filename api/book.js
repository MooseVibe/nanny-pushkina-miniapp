import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

function safeDecodeInitData(initData) {
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

  const checkString = Object.keys(data)
    .sort()
    .map((k) => `${k}=${data[k]}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const hmac = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  return { ok: hmac === hash, reason: hmac === hash ? "" : "Bad signature", data };
}

function parseAdminChatIds(raw) {
  return String(raw || "")
    .split(",")
    .map((s) => Number(String(s).trim()))
    .filter((n) => Number.isFinite(n) && n !== 0);
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
      disable_web_page_preview: true,
    }),
  });

  const json = await res.json();
  if (!json.ok) throw new Error(`TG sendMessage failed: ${json.description}`);
  return json.result; // { message_id, ... }
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const BOT_TOKEN = process.env.BOT_TOKEN;

    const adminRaw =
  process.env.ADMIN_CHAT_IDS || process.env.ADMIN_CHAT_IDS || ""; // поддержим оба варианта на всякий
    const ADMIN_CHAT_IDS = parseAdminChatIds(adminRaw);

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!BOT_TOKEN || !ADMIN_CHAT_IDS.length || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
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

    // 1) создаём запись в базе и сразу получаем id + serial_number
    const insert = {
      user_id: userId,
      lesson_title: payload.lessonTitle,
      name: payload.name,
      group_label: payload.group,
      visit_date: payload.date,
      visit_time: payload.time,
      status: "active",
    };

    const { data: rows, error } = await sb
      .from("bookings")
      .insert(insert)
      .select("id, serial_number")
      .limit(1);

    if (error) throw error;

    const bookingId = rows?.[0]?.id;
    const serialNumber = rows?.[0]?.serial_number;

    if (!bookingId) throw new Error("No bookingId");
    const serialText = serialNumber ? `#${serialNumber}` : "";

    // 2) сообщение пользователю (БЕЗ порядкового номера) + кнопка отмены
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

    // 3) кто записал (для админов)
    const username = user?.username ? String(user.username).replace(/^@/, "") : "";
    const firstName = user?.first_name || "Пользователь";

    const whoBooked = username
      ? `@${username}`
      : `<a href="tg://user?id=${userId}">${firstName}</a>`;

    const adminText =
      `🆕 <b>Новая запись</b> ${serialText}\n\n` +
      `Кого: <b>${insert.name}</b>\n` +
      `Занятие: <b>${insert.lesson_title}</b>\n` +
      `Возраст: <b>${insert.group_label}</b>\n` +
      `Дата/время: <b>${insert.visit_date} • ${insert.visit_time}</b>\n` +
      `Кто записал: ${whoBooked}`;

    // 4) шлём всем админам и сохраняем message_id каждого
    const admin_message_ids = {};

    for (const adminChatId of ADMIN_CHAT_IDS) {
      const msg = await tgSendMessage(BOT_TOKEN, adminChatId, adminText, null);
      admin_message_ids[String(adminChatId)] = msg?.message_id;
    }

    // 5) сохраняем admin_message_ids в базе (для reply при отмене)
    const { error: updErr } = await sb
      .from("bookings")
      .update({ admin_message_ids })
      .eq("id", bookingId);

    if (updErr) throw updErr;

    return res.status(200).json({
      ok: true,
      bookingId,
      serialNumber,
      userId,
      adminMessageIds: admin_message_ids,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}