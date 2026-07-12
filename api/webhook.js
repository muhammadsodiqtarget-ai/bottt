// api/webhook.js
//
// Telegram bu endpointga har bir xabar uchun POST so'rov yuboradi (siz BotFather orqali
// bot yaratib, keyin setWebhook qilganingizdan keyin). Bu yerda xabar o'qiladi va
// "kutilayotgan yozuvlar" navbatiga qo'shiladi — ilovangiz keyinroq shu navbatni tortib oladi.

const crypto = require("crypto");
const Store = require("../lib/store");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || "";

async function sendMessage(chatId, text) {
  if (!BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

function genToken() {
  return crypto.randomBytes(16).toString("hex");
}

const USAGE = `Format: <b>turi summa kategoriya [hamyon] [izoh]</b>
Masalan:
<code>xarajat 50000 Oziq-ovqat Naqd tushlik</code>
<code>daromad 2000000 Ish haqi Karta iyul oyi</code>

Turi: <b>xarajat</b> yoki <b>daromad</b> (qisqasi: x / d)`;

function parseMessage(text) {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 3) return null;

  const typeRaw = parts[0].toLowerCase();
  const type = (typeRaw === "daromad" || typeRaw === "d") ? "income"
             : (typeRaw === "xarajat" || typeRaw === "x") ? "expense"
             : null;
  if (!type) return null;

  const amount = parseFloat(parts[1].replace(/[^\d.]/g, ""));
  if (!amount || amount <= 0) return null;

  const categoryName = parts[2];
  const walletName = parts[3] || "";
  const note = parts.slice(4).join(" ");

  return { type, amount, categoryName, walletName, note, date: new Date().toISOString() };
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(200).json({ ok: true });

  if (WEBHOOK_SECRET) {
    const got = req.headers["x-telegram-bot-api-secret-token"];
    if (got !== WEBHOOK_SECRET) return res.status(401).json({ ok: false });
  }

  const update = req.body;
  const msg = update?.message;
  if (!msg || !msg.text) return res.status(200).json({ ok: true });

  const chatId = msg.chat.id;
  const text = msg.text.trim();

  if (text === "/start") {
    let token = await Store.get(`chat_token:${chatId}`);
    if (!token) {
      token = genToken();
      await Store.set(`chat_token:${chatId}`, token);
      await Store.set(`token_chat:${token}`, chatId);
    }
    await sendMessage(chatId,
      `Salom! Bu token'ni ilovangizning Sozlamalar bo'limiga kiriting:\n\n<code>${token}</code>\n\n${USAGE}`);
    return res.status(200).json({ ok: true });
  }

  const parsed = parseMessage(text);
  if (!parsed) {
    await sendMessage(chatId, `Tushunarsiz format. ${USAGE}`);
    return res.status(200).json({ ok: true });
  }

  const token = await Store.get(`chat_token:${chatId}`);
  if (!token) {
    await sendMessage(chatId, "Avval /start buyrug'ini yuboring.");
    return res.status(200).json({ ok: true });
  }

  const queueKey = `pending:${token}`;
  const queue = (await Store.get(queueKey)) || [];
  queue.push(parsed);
  await Store.set(queueKey, queue);

  await sendMessage(chatId,
    `✅ Qabul qilindi: ${parsed.type === "expense" ? "xarajat" : "daromad"} ${parsed.amount} so'm (${parsed.categoryName}). Ilovada "Tortib olish" tugmasini bosing.`);
  return res.status(200).json({ ok: true });
};
