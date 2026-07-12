// lib/store.js
//
// Vercel'ning serverless funksiyalari statesiz ishlaydi (har bir so'rov boshqa nusxada
// bajarilishi mumkin), shuning uchun oddiy JS massiv/obyekt xotirada saqlanmaydi.
// Shu sababli Vercel KV (Upstash Redis asosida, Vercel loyihangizga bepul qo'shiladi)
// ishlatiladi. Agar KV ulanmagan bo'lsa (lokal test uchun), vaqtinchalik xotiraga tushadi
// — bu holat FAQAT localhost'da ishlashga mo'ljallangan, productionda ishlamaydi.

let kv = null;
try {
  // @vercel/kv atrof-muhitda mavjud bo'lsa (KV_REST_API_URL / KV_REST_API_TOKEN o'rnatilgan bo'lsa) ishlatiladi
  if (process.env.KV_REST_API_URL) {
    kv = require("@vercel/kv").kv;
  }
} catch (e) {
  kv = null;
}

const memory = new Map(); // faqat lokal fallback

const Store = {
  async get(key) {
    if (kv) return await kv.get(key);
    return memory.has(key) ? memory.get(key) : null;
  },
  async set(key, value) {
    if (kv) return await kv.set(key, value);
    memory.set(key, value);
  },
  async del(key) {
    if (kv) return await kv.del(key);
    memory.delete(key);
  },
  isPersistent() {
    return !!kv;
  },
};

module.exports = Store;
