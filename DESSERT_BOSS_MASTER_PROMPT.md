# 🥥 Dessert Boss — ফুড ডিস্ট্রিবিউশন ও ক্যাশ মেমো ম্যানেজমেন্ট মাস্টার প্রম্পট ও সিস্টেম স্পেসিফিকেশন

> এই প্রম্পটটি আপনি যেকোনো এআই (Claude, ChatGPT, Gemini, DeepSeek ইত্যাদি) বা যেকোনো ডেভেলপারের কাছে হুবহু দিয়ে একই অ্যাপ তৈরি ও কাস্টমাইজ করতে পারবেন।

---

## ১. প্রজেক্টের পরিচয় ও উদ্দেশ্য (App Overview)
- **অ্যাপের নাম:** Dessert Boss (Food Distribution & Ledger)
- **কোর বিজনেস মডেল:** প্রতিদিন বিভিন্ন করপোরেট অফিস, সুপারশপ ও ক্যাফেটেরিয়াতে (যেমন: Grameenphone, Robi, BRAC, Shwapno, Unimart ইত্যাদি) ডাবের পুডিং ও রয়্যাল ফালুদা সরবরাহ করা, নগদ/বিকাশ/ব্যাংক বিল সংগ্রহ করা এবং কাস্টমার লেজার (বকেয়া/Due) ও দৈনিক খরচ ট্র্যাক করা।
- **ডিভাইস সাপোর্ট:** মোবাইল-ফার্স্ট PWA (Android / iPhone / PC / Tablet) সম্পূর্ণ অফলাইন ও অনলাইন রিয়েল-টাইম সেন্ট্রাল সিঙ্ক সাপোর্ট।

---

## ২. প্রযুক্তিগত আর্কিটেকচার (Tech Stack)
1. **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Lucide Icons + Motion
2. **Backend Server:** Express.js (`server.ts`) সেন্ট্রাল সিঙ্ক ইঞ্জিন + JSON ফাইল ডাটাবেস (`/data/dessertboss_db.json`)
3. **PWA Integration:** `vite-plugin-pwa` (Service Worker, Webmanifest, মাস্কেবল আইকন, অফলাইন ক্যাশিং)
4. **Thermal Printer Integration:**
   - Web Bluetooth API (BLE ESC/POS ডাইরেক্ট থার্মাল প্রিন্টিং - 58mm / 80mm)
   - Android RawBT Print Service Intent ইন্টিগ্রেশন
5. **Google Sheets Integration:** 2-Way Live Sync (Google Apps Script Webhook API + TSV/CSV Export)
6. **Hosting Configuration:** Vercel SPA Ready (`vercel.json`), Netlify, Firebase বা নিজস্ব ডোমেইন (`dessertboss.com`)

---

## ৩. সম্পূর্ণ ডেটাবেস স্কিমা (Database Schemas)

### ক. Orders (অর্ডার ও মেমো)
- `Order_ID`: স্ট্রিং (যেমন: `ORD-2026-1001`)
- `Date`: তারিখ (YYYY-MM-DD, বাংলাদেশ সময়)
- `Time`: সময় (যেমন: `09:30 AM`)
- `Company_Name`: সরবরাহকৃত দোকান বা ক্লায়েন্টের নাম
- `Item_Name`: পণ্যের নাম (যেমন: Green Coconut Pudding)
- `Quantity`: সরবরাহের পরিমাণ (সংখ্যা)
- `Unit_Price`: প্রতি পিসের দাম (৳)
- `Total_Bill`: মোট বিল (Quantity × Unit_Price)
- `Paid_Amount`: তাৎক্ষণিক প্রাপ্ত টাকা (৳)
- `Due_Amount`: অবশিষ্ট বকেয়া (Total_Bill - Paid_Amount)
- `Payment_Method`: `Cash` | `bKash` | `Nagad` | `Bank`
- `Delivery_Man`: ডেলিভারি রাইডারের নাম
- `Status`: `Pending` | `Delivered` | `Cancelled`

### খ. Companies (দোকান ও ক্লায়েন্ট লেজার)
- `Company_ID`: আইডি (যেমন: `DB-COMP-001`)
- `Company_Name`: প্রতিষ্ঠানের নাম
- `Phone_Number`: ফোন নম্বর
- `Address`: ঠিকানা
- `Current_Due`: সর্বমোট বকেয়া টাকার ব্যালেন্স (৳)
- `Contact_Person`: যোগাযোগকারীর নাম
- `Category`: `Corporate Canteen` | `Superstore` | `Executive Lounge`

### গ. Expenses (দৈনিক খরচ ও কাঁচামাল কেনাকাটা)
- `Expense_ID`: আইডি (যেমন: `EXP-2026-001`)
- `Date`: খরচের তারিখ
- `Expense_Type`: `Raw Materials` | `Packaging` | `Delivery / Fuel` | `Utility & Gas` | `Others`
- `Amount`: খরচের পরিমাণ (৳)
- `Note`: বিস্তারিত বিবরণ (যেমন: ডাব ও চিনি কেনা)
- `Recorded_By`: খরচ এন্ট্রিদাতার নাম

### ঘ. Payments (বকেয়া কালেকশন ও ট্রানজাকশন)
- `Payment_ID`: আইডি (যেমন: `PAY-1001`)
- `Date`: কালেকশনের তারিখ
- `Company_Name`: যে দোকান বিল পরিশোধ করেছে
- `Amount`: আদায়কৃত টাকা (৳)
- `Payment_Method`: `Cash` | `bKash` | `Nagad` | `Bank`
- `Reference`: মেমো নম্বর বা ট্রানজাকশন আইডি
- `Recorded_By`: আদায়কারীর নাম

### ঙ. Inventory & Production (স্টক ও উৎপাদন)
- `Item_Name`: পণ্যের নাম
- `Unit_Price`: পাইকারি বিক্রয়মূল্য
- `Stock_Qty`: বর্তমান মজুদ সংখ্যা
- `Unit`: পরিমাপ (Cup / Jar)
- `Min_Alert_Qty`: লো-স্টক সতর্কতার সর্বনিম্ন সীমা
- `Category`: `Puddings` | `Falooda`

### চ. Employees (কর্মী ও রাইডার তালিকা)
- `Employee_ID`: আইডি (যেমন: `EMP-001`)
- `Name`: কর্মীর নাম
- `Role`: `Delivery Rider` | `Production Master` | `Manager`
- `Phone_Number`: মোবাইল নম্বর
- `Assigned_Zone`: নির্ধারিত রুট/জোন
- `Status`: `Active` | `Inactive`

---

## ৪. মাল্টি-ডিভাইস রিয়েল-টাইম সিঙ্কিং লজিক (Real-Time Sync Engine)
1. **সেন্ট্রাল ট্রুথ:** `/api/db` এবং `/api/db/sync` এন্ডপয়েন্ট।
2. **অটোমেটেড পোলিং:** প্রতি ৫ সেকেন্ড পরপর ব্যাকগ্রাউন্ডে ফেচ করা হয়।
3. **স্ক্রিন ওয়েকআপ সিঙ্ক:** মোবাইল স্ক্রিন অন করা মাত্র বা ব্রাউজার ট্যাবে ফোকাস আসা মাত্রই অটোমেটিক রিফ্রেশ হয়।
4. **১০০% ব্যালেন্স সমতা:** কম্পিউটার থেকে এন্ট্রি করা ৫,৬০০ টাকার খরচ, ৬০ টাকার ডিউ এবং ৫টি অর্ডার সঙ্গে সঙ্গে মোবাইলে ভেসে ওঠে; আবার মোবাইল থেকে কিছু যোগ বা বিয়োগ করলে তা কম্পিউটারে চলে আসে। কোনো ডিভাইসের ডেটাই নষ্ট বা হারিয়ে যায় না।

---

## ৫. ব্লুটুথ থার্মাল প্রিন্টিং ও ক্যাশ মেমো (Bluetooth Thermal POS)
- সরাসরি মোবাইল থেকে Web Bluetooth (BLE) দিয়ে 58mm/80mm ESC/POS থার্মাল প্রিন্টারে ক্যাশ মেমো বের করা যায়।
- অ্যান্ড্রয়েড অ্যাপ RawBT Intent সাপোর্ট (`rawbt:data`) রয়েছে, যার মাধ্যমে ব্লুটুথ প্রিন্টার কানেক্ট না থাকলেও সরাসরি প্রিন্ট হয়ে যায়।
- মেমোতে দোকানের নাম, তারিখ-সময়, আইটেম তালিকা, মোট বিল, জমা এবং অবশিষ্ট বকেয়া বাংলায় স্পষ্ট প্রিন্ট হয়।

---

## ৬. রোল-বেসড সিকিউরিটি ও গোপন সেটিংস (Hidden PWA Options)
- **Admin vs Staff Mode:** অ্যাডমিন মোডে দৈনিক লাভ-ক্ষতি (Net P&L) ও ডেটা মুছে ফেলার কন্ট্রোল থাকে; স্টাফ মোডে কেবল অর্ডার ডেলিভারি ও কালেকশন দেখা যায়।
- **গোপন মোবাইল অপশন:** কর্মচারীদের ও সাধারণ ক্রেতাদের চোখের আড়ালে রাখার জন্য প্রধান ড্যাশবোর্ড ও হেডার থেকে "অ্যাপ নিন" বা ইনস্টল ব্যানার সরিয়ে **Sheet Database** ট্যাবের ভেতরে **🔒 অভ্যন্তরীণ ও মোবাইল কানেকশন সেটিংস** এর ভেতরে সম্পূর্ণ গোপন ও সুরক্ষিত অবস্থায় রাখা হয়েছে।

---

## ৭. নিজস্ব ডোমেইনে ফ্রি লাইফটাইম হোস্টিং গাইড (dessertboss.com / Vercel)
1. গিটহাবে এই প্রজেক্ট পুশ করুন (`git push`).
2. Vercel.com-এ গিয়ে "Add New Project" দিয়ে রিপোজিটরিটি সিলেক্ট করুন।
3. Framework: `Vite` সিলেক্ট থাকবে, `vercel.json` বিল্ট-ইন কাজ করবে।
4. Settings > Domains-এ গিয়ে আপনার কেনা ডোমেইন `dessertboss.com` যোগ করুন এবং DNS A Record নির্দেশমতো বসান।
5. সম্পূর্ণ ফ্রিতে আজীবন SSL ও গ্লোবাল CDN সহ আপনার অ্যাপ ওয়েবসাইটের মতো চলবে।
