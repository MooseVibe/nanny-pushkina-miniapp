import { createClient } from "@supabase/supabase-js";

async function tgAnswerCallback(token, callbackQueryId, text) {
  await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text, show_alert: false }),
  });
}

async function tgSendMessage(token, chatId, text) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(200).send("ok");

    const BOT_TOKEN = process.env.BOT_TOKEN;
    const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!BOT_TOKEN || !ADMIN_CHAT_ID || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.log("[/api/telegram-webhook] Missing env vars");
      return res.status(200).send("ok");
    }

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const update = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const cq = update?.callback_query;
    if (!cq) return res.status(200).send("ok");

    const fromId = cq.from?.id;
    const data = cq.data || "";

    if (!data.startsWith("cancel:")) {
      await tgAnswerCallback(BOT_TOKEN, cq.id, "Неизвестная команда");
      return res.status(200).send("ok");
    }

    const bookingId = data.split(":")[1];
    if (!bookingId) {
      await tgAnswerCallback(BOT_TOKEN, cq.id, "Ошибка: нет id");
      return res.status(200).send("ok");
    }

    const { data: row, error } = await sb.from("bookings").select("*").eq("id", bookingId).maybeSingle();

    if (error || !row) {
      await tgAnswerCallback(BOT_TOKEN, cq.id, "Запись не найдена");
      return res.status(200).send("ok");
    }

    if (Number(row.user_id) !== Number(fromId)) {
      await tgAnswerCallback(BOT_TOKEN, cq.id, "Это не ваша запись");
      return res.status(200).send("ok");
    }

    if (row.status === "cancelled") {
      await tgAnswerCallback(BOT_TOKEN, cq.id, "Уже отменено");
      return res.status(200).send("ok");
    }

    await sb.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);

    await tgAnswerCallback(BOT_TOKEN, cq.id, "Запись отменена ✅");

    await tgSendMessage(
      BOT_TOKEN,
      fromId,
      `❌ <b>Запись отменена</b>\n\n${row.lesson_title}\n${row.visit_date} • ${row.visit_time}`
    );

    await tgSendMessage(
      BOT_TOKEN,
      ADMIN_CHAT_ID,
      `❌ <b>Отмена записи</b>\n\nКого: <b>${row.name}</b>\nЗанятие: <b>${row.lesson_title}</b>\nДата/время: <b>${row.visit_date} • ${row.visit_time}</b>\nBookingID: <code>${row.id}</code>`
    );

    return res.status(200).send("ok");
  } catch (e) {
    console.error("[/api/telegram-webhook] ERROR:", e);
    return res.status(200).send("ok");
  }
}