# Gatherly — Changelog

تمام تغییرات پروژه به ترتیب زمانی، با توضیح کامل هر مرحله.

---

## [Day 1] — پایه‌گذاری پروژه

### ساخته شد
- **Next.js 16 + Tailwind + TypeScript** — ساختار اولیه پروژه
- **`app/page.tsx`** — صفحه اصلی با HeroPrompt و TestimonialCard
- **`components/Home/HeroPrompt.tsx`** — فرم ورودی prompt با آیکون Sparkles
- **`components/Home/TestimonialCard.tsx`** — کارت بصری سمت راست در دسکتاپ
- **`components/ui/Button.tsx`** — دکمه چندمنظوره با variant primary/ghost
- **`components/ui/Spinner.tsx`** — لودر انیمیشن‌دار
- **`lib/types.ts`** — تمام تایپ‌های اصلی: `EventData`, `Guest`, `PromptAnalysis`, `ApiResponse`
- **`lib/fixture.ts`** — داده‌های نمونه برای تست بدون AI
- **طراحی بصری** — پالت رنگی cream/olive (`#FDFBF7`, `#5A5A40`)، فونت serif

---

## [Day 2] — لایه AI و جریان ساخت رویداد

### ساخته شد
- **`lib/ai/config.ts`** — خواندن تنظیمات AI از env (provider انتخابی)
- **`lib/ai/registry.ts`** — رجیستری provider‌های text و image
- **`lib/ai/providers/gemini-text.ts`** — تولید متن با Google Gemini
- **`lib/ai/providers/gemini-image.ts`** — تولید تصویر با Gemini
- **`lib/ai/providers/openai-text.ts`** — پشتیبانی از OpenAI GPT
- **`lib/ai/providers/openai-image.ts`** — پشتیبانی از DALL·E
- **`lib/api-client.ts`** — کلاینت typed برای صدا زدن API‌های داخلی
- **`app/api/events/analyze/route.ts`** — تحلیل prompt و استخراج date/time/location
- **`app/api/events/create/route.ts`** — ساخت رویداد: AI text + image + ذخیره DB
- **`app/create/page.tsx`** — صفحه جریان ساخت: analyzing → wizard → generating → redirect
- **`components/Wizard/WizardForm.tsx`** — فرم تکمیل اطلاعات ناقص رویداد
- **`app/e/[eventId]/page.tsx`** — صفحه نمایش رویداد (server component)
- **`app/e/[eventId]/loading.tsx`** — skeleton لودینگ
- **`app/e/[eventId]/not-found.tsx`** — صفحه ۴۰۴ با طراحی cream/serif
- **`components/EventPage/EventPageView.tsx`** — نمایش کامل رویداد با تم‌بندی

### Mock mode
- متغیر `AI_MOCK=true` در `.env.local` — برگشت fixture بدون صدا زدن AI

---

## [Day 2 — ادامه] — Supabase، Storage، Email

### ساخته شد
- **`lib/supabase/server.ts`** — کلاینت Supabase SSR برای Server Components
- **`lib/supabase/client.ts`** — کلاینت Supabase برای Client Components
- **`lib/storage/supabase-storage.ts`** — آپلود base64 تصویر به bucket `events`
- **`lib/email/resend.ts`** — ارسال ایمیل با Resend
- **`lib/email/templates/RsvpConfirmation.tsx`** — قالب React Email برای تأیید RSVP
- **`app/api/events/[eventId]/rsvp/route.ts`** — ثبت RSVP مهمان + ارسال ایمیل تأیید
- **`middleware.ts`** — refresh session کوکی Supabase در هر request

### جدول‌های DB (Supabase)
```sql
events       — اطلاعات کامل رویداد
guests       — مهمان‌ها و RSVP
```

### پیکربندی
- Bucket `events` در Supabase Storage (public read)
- Resend API برای ارسال ایمیل از `noreply@gatherly.app`

---

## [Day 3] — سوالات هوشمند (Smart Questions)

### ساخته شد / تغییر کرد
- **`app/api/events/analyze/route.ts`** — تولید ۰ تا ۳ سوال شخصی‌سازی همراه تحلیل
- **`components/Wizard/WizardForm.tsx`** — نمایش سوالات smart در wizard
- **`lib/types.ts`** — اضافه شدن `SmartQuestion` به تایپ‌ها
- **`app/api/events/create/route.ts`** — پاس دادن `smartAnswers` به AI برای شخصی‌سازی بیشتر

### باگ‌فیکس
- **Suspense boundary** روی `useSearchParams` در `/create` (خطای Next.js 16)
- **sanitizeUiStyle** — نرمال‌سازی مقادیر AI قبل از insert به DB (خطای constraint)
- **Resend sender** — تغییر به `resend.dev` تا تأیید دامنه اصلی

---

## [Day 4 — بخش اول] — Auth کامل + Dashboard

### ساخته شد
- **`app/login/page.tsx`** — صفحه ورود با magic link (4 state: idle/loading/sent/error)
- **`app/auth/callback/route.ts`** — PKCE code exchange → session → redirect به dashboard
- **`app/logout/route.ts`** — server-side signOut → redirect به `/`
- **`app/dashboard/layout.tsx`** — auth guard: اگر لاگین نباشد → redirect به `/login`
- **`app/dashboard/page.tsx`** — لیست رویدادهای host با تصویر، عنوان، تاریخ، مکان

### تغییر کرد
- **`app/api/events/create/route.ts`** — `host_id` از session کوکی خوانده می‌شود (نه `null` ثابت)
  - اضافه شد `getSessionUserId()` — بررسی session با `@supabase/ssr`

### پیش‌نیاز Supabase
```
Authentication → URL Configuration → Redirect URLs:
  http://localhost:3000/auth/callback
  https://your-domain.com/auth/callback
```

---

## [Day 4 — بخش دوم] — آپلود عکس مهمانان

### ساخته شد
- **`app/e/[eventId]/photos/page.tsx`** — server wrapper: بررسی دسترسی (host یا token مهمان)
- **`app/e/[eventId]/photos/PhotoUploadClient.tsx`** — UI آپلود با XHR progress per-file
- **`app/e/[eventId]/gallery/page.tsx`** — گالری عکس‌ها (host-only)
- **`app/api/events/[eventId]/photos/upload/route.ts`** — API آپلود با validation کامل
- **`app/api/events/[eventId]/meta/route.ts`** — endpoint سبک برای عنوان و رنگ رویداد

### قوانین دسترسی
| صفحه | دسترسی |
|------|---------|
| `/photos` | Host (session) یا مهمان با `?t=upload_token` |
| `/gallery` | فقط Host |

### جدول DB جدید
```sql
event_photos (id, event_id, storage_path, url, uploaded_by, created_at)
```

### Migration اجرا شده
```sql
alter table guests add column if not exists upload_token uuid not null default gen_random_uuid();
create index if not exists guests_upload_token_idx on guests(upload_token);
```

### تغییر کرد
- **`lib/email/templates/RsvpConfirmation.tsx`** — اضافه شد لینک آپلود عکس شخصی در ایمیل تأیید RSVP
- **`app/api/events/[eventId]/rsvp/route.ts`** — تولید و ارسال `uploadPhotoUrl` در ایمیل

### Bucket جدید Supabase
```
gatherly-guest-photos  (public read)
```

---

## [Day 4 — بخش سوم] — بازطراحی صفحه اصلی

### ساخته شد
- **`components/Home/Header.tsx`** — هدر sticky: لوگو + دکمه Sign in یا Dashboard بر اساس session
- **`components/Home/HowItWorks.tsx`** — بخش "چطور کار می‌کند" با ۳ ستون
- **`components/Home/ExamplePrompts.tsx`** — پیل‌های prompt نمونه (client component)
- **`components/Home/Footer.tsx`** — فوتر minimal

### تغییر کرد
- **`app/page.tsx`** — تبدیل به server component: خواندن session + searchParams
  - تگ‌لاین جدید: *"Gather together. Keep it forever."*
  - توضیح جدید درباره دایمی بودن خاطرات
  - لینک "See a live example →" به رویداد واقعی
- **`components/Home/HeroPrompt.tsx`** — اضافه شد prop `initialValue` برای pre-fill از URL
- **`components/Home/ExamplePrompts.tsx`** — prompt‌های غنی با جزئیات: تم، غذا، تعداد، دکور

### ایمیل Magic Link (Supabase Dashboard)
- قالب HTML سفارشی با طراحی Gatherly (cream/olive/serif)
- موضوع: `Sign in to Gatherly ✦`

---

## وضعیت فعلی پروژه

### جریان کامل کاربر
```
/ (landing)
  → /create?prompt=... (analyzing → wizard → generating)
    → /e/[eventId] (صفحه رویداد)
      → RSVP (ایمیل تأیید + لینک آپلود)
      → /e/[eventId]/photos?t=TOKEN (آپلود مهمان)
      → /e/[eventId]/gallery (گالری host)

/login → magic link → /auth/callback → /dashboard
/dashboard → لیست رویدادها
/logout → /
```

### موضوع باز
- **رویداد بدون host** — کاربر لاگین‌نکرده می‌تواند رویداد بسازد اما در dashboard ذخیره نمی‌شود
  - راه‌حل پیشنهادی: Option B — ساخت آزاد، gate قبل از نمایش نتیجه، claim با لاگین

---

*آخرین به‌روزرسانی: ۲۱ اردیبهشت ۱۴۰۴*
