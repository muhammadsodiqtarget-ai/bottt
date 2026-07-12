# Telegram Bot Ko'prigi (backend)

Bu — faqat sizning shaxsiy ilovangiz uchun kichik ko'prik. Vazifasi: Telegram xabarlarini
qabul qilib, ilova ochilganda tortib olinadigan navbatga qo'yish. Butun moliyaviy tarixingiz
BU YERDA saqlanmaydi — faqat hali o'qilmagan 1-2 kunlik yozuvlar vaqtincha turadi.

## 1-qadam: Bot yaratish
1. Telegram'da **@BotFather**ga yozing.
2. `/newbot` yuboring, nom va username bering.
3. Sizga **bot token** beradi (masalan `123456:ABC-DEF...`) — buni saqlab qo'ying.

## 2-qadam: Vercel'ga joylashtirish
1. https://vercel.com/ da hisob oching (bepul, GitHub orqali kirish qulay).
2. Ushbu `telegram-bot-backend` papkasini GitHub'ga yuklang (yangi repo yarating) yoki
   to'g'ridan-to'g'ri Vercel CLI orqali joylashtiring:
   ```
   npm i -g vercel
   cd telegram-bot-backend
   vercel deploy --prod
   ```
3. Vercel loyihasiga quyidagi Environment Variable'larni qo'shing (Project Settings > Environment Variables):
   - `TELEGRAM_BOT_TOKEN` — 1-qadamdagi token
   - `TELEGRAM_WEBHOOK_SECRET` — o'zingiz o'ylab topgan istalgan maxfiy so'z (ixtiyoriy, lekin tavsiya etiladi)

## 3-qadam: Vercel KV qo'shish (ma'lumotni saqlash uchun)
1. Vercel loyihangizda **Storage** bo'limiga o'ting > **KV** yarating (bepul tarif yetarli).
2. Loyihangizga ulang — `KV_REST_API_URL` va `KV_REST_API_TOKEN` avtomatik qo'shiladi.
3. Qayta deploy qiling (`vercel deploy --prod`).

**Agar KV qo'shmasangiz:** kod ishlaydi, lekin ma'lumot faqat vaqtinchalik xotirada turadi va
istalgan payt yo'qolib qolishi mumkin — Telegram integratsiyasi uchun KV shart.

## 4-qadam: Webhook'ni ulash
Deploy qilingandan so'ng Vercel sizga URL beradi (masalan `https://sizning-loyiha.vercel.app`).
Terminalda (yoki brauzer manzil qatorida) shuni oching:

```
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://sizning-loyiha.vercel.app/api/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>
```

`<BOT_TOKEN>` va `<TELEGRAM_WEBHOOK_SECRET>` o'rniga o'zingiznikini qo'ying. Javobda
`"ok":true` chiqsa — tayyor.

## 5-qadam: Sinash
1. Telegram'da botingizga `/start` yozing → sizga token qaytaradi.
2. Ilovada (finance-tracker) Sozlamalar > Telegram bo'limiga:
   - Backend manzili: `https://sizning-loyiha.vercel.app`
   - Token: botdan olgan token
3. Botga yozing: `xarajat 25000 Oziq-ovqat Naqd tushlik uchun`
4. Ilovada "Tortib olish" tugmasini bosing — yozuv paydo bo'lishi kerak.

## Xabar formati (botga yoziladigan)
```
turi summa kategoriya [hamyon] [izoh]
```
- turi: `xarajat`/`x` yoki `daromad`/`d`
- kategoriya nomi ilovadagi kategoriya nomiga mos kelsa o'sha kategoriyaga tushadi,
  mos kelmasa — avtomatik yangi kategoriya sifatida yaratiladi
- hamyon berilmasa — birinchi hamyoningizga tushadi

Misollar:
```
xarajat 50000 Oziq-ovqat Naqd tushlik
daromad 3000000 Ish haqi Karta iyul oyi maoshi
x 12000 Transport
```

## Xavfsizlik haqida rostini aytsam
Bu ko'prik orqali xabarlaringiz Telegram serverlaridan va Vercel'dan "o'tadi" — bu
"100% hech qayerga chiqmaydi" degani emas. Agar bu sizga muhim bo'lsa, B-variantga
(kompyuteringizda ishlaydigan lokal server, Telegram long-polling bilan) o'tish
haqida so'rang — men shuni ham yozib bera olaman.
