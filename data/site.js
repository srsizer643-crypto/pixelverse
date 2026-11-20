/* ===== ملف الإعدادات الوحيد: عدّل هنا فقط ولا حاجة لتعديل باقي الملفات ===== */
window.PV = {
  // الإحصائيات: ضع اسم حسابك في GoatCounter (الجزء قبل .goatcounter.com). اتركه فارغًا لإظهار "قريبًا".
  stats: { goatcounter: "", dashboard: "" },

  // الألعاب: لإضافة لعبة جديدة انسخ كتلة {...} وضعها في أول القائمة (الأولى = أحدث لعبة)
  // id: اسم قصير بالإنجليزي وبدون مسافات (يدخل في رابط صفحة اللعبة)
  // cover: صورة البطاقة (عرضية) | preview: صورة صفحة اللعبة (اختيارية) | embed: رابط تشغيل اللعبة داخل الموقع | url: الرابط الأصلي
  // status: "available" متاحة | "dev" قيد التطوير
  games: [
    {
      id: "dokan",
      name: "دكان السعادة",
      desc: "لعبة إدارة محل قصب بالمصري: خدّم الزباين، وظّف عمال، وطوّر محلك خطوة خطوة.",
      status: "available",
      version: "v6",
      cover: "assets/games/dokan-cover.webp",
      preview: "assets/games/dokan-preview.webp",
      page: "pages/game.html?id=dokan",
      embed: "../games/dokan/game.html",
      updated: "13 نوفمبر 2026",
      url: "../games/dokan/game.html",
      cta: "تشغيل اللعبة"
    }
  ],

  // التطوير الأسبوعي: حدّث هذه الكتلة كل أسبوع. week اتركه null لإخفاء رقم الأسبوع.
  weekly: {
    game: "دكان السعادة",
    week: null,
    title: "السندوتشات",
    description: "العمل جارٍ على إضافة السندوتشات بجانب العصير، تمهيدًا للمطعم الكبير.",
    status: "قيد التطوير",
    done: ["مشروبات الفاكهة: ليمون وبرتقال ومانجا وفراولة وكوكتيل"],
    // السجل: أضف أحدث تحديث في أول القائمة
    history: [
      { label: "v6", date: "13 نوفمبر 2026", text: "مشروبات الفاكهة بقت متاحة من قايمة اللعبة." },
      { label: "v5", date: "13 نوفمبر 2026", text: "الاسم بقى «دكان السعادة»، مع صورة معاينة للمشاركة وقائمة جانبية وعدّادات إحصائيات." }
    ]
  },

  // المنصات: غيّر status إلى "available" وضع url عند جاهزية المنصة
  platforms: [
    { name: "قناة واتساب", note: "تابع أخبار الألعاب والتحديثات", status: "available", letter: "W", color: "#25d366",
      url: "https://whatsapp.com/channel/0029Vb9zDEc9xVJmuO7GgW3I" },
    { name: "Discord", note: "قريبًا", status: "soon", letter: "D", color: "#5865f2", url: "" },
    { name: "TikTok", note: "قريبًا", status: "soon", letter: "T", color: "#111", url: "" }
  ]
};
