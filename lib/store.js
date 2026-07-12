// lib/store.js
//
// Ma'lumotlarni saqlash uchun loyihaga ulangan Supabase Postgres ishlatiladi.
// Vercel serverless funksiyalari statesiz ishlagani uchun oddiy xotira (Map)
// ishonchli emas, shu sababli Postgres'da kichik key-value jadval ishlatiladi.
// Agar ulanish satri topilmasa (masalan lokal test), vaqtinchalik xotiraga tushadi.

const { Pool } = require("pg");

const connectionString = process.env.Storage_POSTGRES_URL || process.env.POSTGRES_URL || process.env.Storage_POSTGRES_URL_NON_POOLING;

let pool = null;
if (connectionString) {
    pool = new Pool({ connectionString: connectionString, ssl: { rejectUnauthorized: false }, max: 1 });
}

let tableReady = null;
function ensureTable() {
    if (!pool) return Promise.resolve();
    if (!tableReady) {
          tableReady = pool.query("CREATE TABLE IF NOT EXISTS kv_store (key TEXT PRIMARY KEY, value JSONB, updated_at TIMESTAMPTZ DEFAULT now())");
    }
    return tableReady;
}

const memory = new Map();

const Store = {
    get: async function (key) {
          if (!pool) return memory.has(key) ? memory.get(key) : null;
          await ensureTable();
          const result = await pool.query("SELECT value FROM kv_store WHERE key = $1", [key]);
          return result.rows.length ? result.rows[0].value : null;
    },
    set: async function (key, value) {
          if (!pool) { memory.set(key, value); return; }
          await ensureTable();
          const sql = "INSERT INTO kv_store (key, value, updated_at) VALUES ($1, $2, now()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = now()";
          await pool.query(sql, [key, JSON.stringify(value)]);
    },
    del: async function (key) {
          if (!pool) { memory.delete(key); return; }
          await ensureTable();
          await pool.query("DELETE FROM kv_store WHERE key = $1", [key]);
    },
    isPersistent: function () {
          return !!pool;
    }
};

module.exports = Store;
