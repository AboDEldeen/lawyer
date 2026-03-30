# Lawyer Mai Tunsy — React + Vite

نظام إدارة قضايا لمكتب محاماة مبني بـ React + Vite مع:
- تسجيل دخول داخلي بـ username / password من ملف البيئة
- Supabase للبيانات والملفات
- QR مختلف لكل قضية
- صفحة public للملفات فقط
- عربي / English
- Dark / Light mode

## ملاحظة مهمة
التسجيل الداخلي هنا **client-side** لأنه بدون Supabase Auth أو backend خاص. ده مناسب للتجربة المحلية أو التشغيل الخاص، لكنه **ليس حماية قوية** لو هتفتحه للعامة على الإنترنت. لو هتنشره للعامة، الأفضل تضيف backend أو Auth حقيقي.

## التشغيل

```bash
npm install
cp .env.example .env
npm run dev
```

## بيانات الدخول الافتراضية
تتحدد من ملف `.env`:

```env
VITE_APP_USERNAME=ahmed
VITE_APP_PASSWORD=123456
```

## إعداد Supabase
1. اعمل مشروع Supabase.
2. نفّذ ملف `supabase/schema.sql` في SQL Editor.
3. اعمل Bucket باسم `case-files`.
4. حط مفاتيح المشروع في `.env`.

## الجداول
- clients
- cases
- payments
- case_files
- case_notes
- qr_share_links
- activity_logs

## Bucket
- `case-files`

## سياسات RLS
المشروع ده بيستخدم **anon key** مع سياسات مفتوحة نسبيًا علشان يشتغل بدون Supabase Auth. لو هتنشره Public لازم تعمل backend آمن أو Edge Functions.
