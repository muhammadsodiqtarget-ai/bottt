// api/pending.js
//
// Ilova bu endpointdan "hali sinxronlanmagan" yozuvlarni oladi (GET), keyin
// muvaffaqiyatli qo'shgandan so'ng navbatni tozalaydi (DELETE).

const Store = require("../lib/store");

module.exports = async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).json({ error: "token kerak" });

  const chatId = await Store.get(`token_chat:${token}`);
  if (!chatId) return res.status(404).json({ error: "token topilmadi" });

  const queueKey = `pending:${token}`;

  if (req.method === "GET") {
    const entries = (await Store.get(queueKey)) || [];
    return res.status(200).json({ entries });
  }

  if (req.method === "DELETE") {
    await Store.del(queueKey);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "usul qo'llab-quvvatlanmaydi" });
};
