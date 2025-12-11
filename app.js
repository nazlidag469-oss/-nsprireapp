// === LOCAL STORAGE KEYS ===
const STORAGE_KEY = "inspireapp_conversations_v1";
const CREDITS_KEY = "inspireapp_credits_v1";
const PLAN_KEY = "inspireapp_plan_v1";
const EMAIL_KEY = "inspireapp_email_v1";
const LANG_KEY = "inspireapp_lang_v1";

const AD_COUNT_KEY = "inspireapp_daily_ad_count_v1";
const AD_DATE_KEY = "inspireapp_daily_ad_date_v1";

const MAX_FREE_CREDITS = 4;
const DAILY_AD_LIMIT = 400;

// GİZLİLİK POLİTİKASI LİNKİ
const POLICY_URL =
  "https://sites.google.com/view/insprireapp-gizlilik-politikas/ana-sayfa";

// === LANGUAGE TABLES ===
const LANG_NAMES = {
  tr: "Turkish",
  en: "English",
  ar: "Arabic",
  de: "German",
  es: "Spanish",
};

const LANG_REGION = {
  tr: "TR",
  en: "US",
  ar: "SA",
  de: "DE",
  es: "ES",
};

// Dil etiketleri (select içi görünen isimler)
const LANG_LABELS = {
  tr: "Türkçe",
  en: "English",
  ar: "العربية",
  de: "Deutsch",
  es: "Español",
};

// Ses tanıma için dil kodları
const LANG_SPEECH = {
  tr: "tr-TR",
  en: "en-US",
  ar: "ar-SA",
  de: "de-DE",
  es: "es-ES",
};

// Static UI texts
const I18N = {
  tr: {
    topTitle: "INSPIREAPP",
    sidebarTitle: "Hesap & Sohbetler",
    sidebarUserTitle: "Kullanıcı",
    sidebarEmailLabel: "E-posta",
    sidebarStatusLabel: "Durum",
    sidebarChatsTitle: "Sohbetler",
    sidebarPanelsTitle: "Paneller",
    changeEmailBtnText: "E-postayı değiştir",
    newChatBtnText: "+ Yeni sohbet",
    btnPanelChatText: "Sohbet",
    btnPanelTrendsText: "Trend Akımı",
    btnPanelSeriesText: "30 Günlük Seri",
    btnPanelHookText: "Hook Laboratuvarı",
    btnPanelCopyText: "Trend Kopya Makinesi",
    btnPanelProText: "PRO Araçları",
    helpToggle2Text: "❓ Yardım",

    helpTitle: "Bilgi & Destek",
    helpAppTitle: "Uygulama",
    helpAppText1:
      "InspireApp, kısa video üreticileri için yapay zekâ destekli profesyonel fikir oluşturma + akım analiz + içerik planlama aracıdır.",
    helpAppText2:
      "YouTube Shorts, TikTok, Instagram Reels için özel fikir, hook, başlık, trend kopyalama ve içerik akışı üretir.",
    helpFreeTitle: "Ücretsiz Plan",
    helpFreeText: "Günlük 4 puan. Reklam izleyerek artırılabilir.",
    helpProTitle: "PRO Plan",
    helpProText:
      "Fiyat bilgisi ve ödeme, PRO'ya geç butonuna bastığınızda açılan ekranda gösterilir (Google Play üzerinden satın alma).",
    helpSupportTitle: "Destek",
    helpSupportText: "E-posta: insprireappdestek@gmail.com",
    closeHelpBtnText: "Kapat",

    trendsTitle: "🔥 Trendler (Bu Hafta)",
    refreshTrendsBtnText: "Trendleri Yenile",

    seriesTitle: "🗓️ 30 Günlük Seri Planı",
    seriesDesc:
      "Bir konu gir, InspireApp sana 30 günlük kısa video planı çıkarsın.",
    seriesPlaceholder: "Örn: Sağlıklı yemek, motivasyon videoları...",
    seriesGenerateText: "30 günlük planı oluştur",

    hookTitle: "⚡ Hook Laboratuvarı",
    hookDesc:
      "Konunu yaz; ilk 3 saniyede izleyiciyi çeken güçlü giriş cümleleri (hook) üretelim.",
    hookPlaceholder: "Örn: Öğrenciler için verimli ders çalışma",
    hookGenerateText: "Hook önerilerini üret",

    copyTitle: "🎬 Trend Kopya Makinesi",
    copyDesc:
      "Beğendiğin bir trend / video fikrini yaz; InspireApp bunu senin nişine göre yeniden yazar.",
    copyPlaceholder:
      "Örn: Şu videoyu kendi marka tonuma uyarlamak istiyorum...",
    copyGenerateText: "Trend kopyasını oluştur",

    chatTitle: "💬 Sohbet",
    topicPlaceholder: "Konu (örn: moda)",
    messagePlaceholder: "Mesaj yaz...",
    sendBtnText: "Gönder",
    watchAdBtnText: "Reklam izle +1 puan",
    loadingText: "Yükleniyor...",

    // PRO PANEL UI
    proPanelTitle: "⭐ PRO Araçları",
    proPanelDesc:
      "Bu bölümdeki araçlar PRO kullanıcılar için tasarlandı. Ücretsiz planda kısıtlı, PRO'da tam güç açılır.",
    proTool1Title: "1) Rakip Video Analizi",
    proTool1Desc:
      "TikTok / Reels / Shorts linki veya açıklamasını gir. InspireApp; neden tuttuğunu, daha güçlü hook'ları ve sana özel bir versiyon üretir.",
    proTool3Title: "3) Kitle İçgörü Analizi",
    proTool3Desc:
      "Hedef kitleni tek cümle ile anlat. InspireApp psikoloji, format, hook ve CTA kalıplarını çıkarır.",
    proTool5Title: "5) Sessiz Video İçerik Üreticisi",
    proTool5Desc:
      "Yüzünü göstermeden, ses kullanmadan içerik üretmek istiyorsan konunu yaz. Sessiz video akışları ve sahne önerileri üretelim.",
    proCompetitorBtnText: "Rakip videoyu analiz et (PRO)",
    proAudienceBtnText: "Kitle içgörüsü üret (PRO)",
    proSilentBtnText: "Sessiz içerik fikirleri üret (PRO)",

    planFreeLabel: "Plan: Ücretsiz",
    planProLabel: "Plan: Pro (sınırsız puan)",
    creditsLabelFree: (credits) => `Kalan puan: ${credits}/${MAX_FREE_CREDITS}`,
    creditsLabelPro: "Kalan puan: Sınırsız",

    onboardTitle: "INSPIREAPP",
    onboardLangTitle: "Dil seçin",
    onboardLangSaveBtnText: "Devam",
    onboardEmailTitle: "E-posta adresiniz",
    onboardEmailPlaceholder: "ornek@mail.com",
    onboardEmailSaveBtnText: "Sohbete başla",

    adTitle: "Reklam İzleyerek +1 Puan",
    adText:
      'Bir video reklam izle; izledikten sonra alttaki "Reklamı izledim" butonuna bas, hesabına +1 kredi eklensin.',
    adCancelBtnText: "Vazgeç",
    adWatchedBtnText: "Reklamı izledim, +1 ver",
    adConfirmTitle: "Emin misin?",
    adConfirmText: "Reklamı izlemekten vazgeçmek üzeresin.",
    adContinueBtnText: "Reklamı izlemeye devam et",
    adConfirmCloseBtnText: "Evet, kapat",
    adDailyLimit: (limit) =>
      `Günlük reklam limiti doldu. (Limit: ${limit})`,
    adPreparing: "Reklam hazırlanıyor...",

    proTitle: "InspireApp PRO",
    proDesc:
      "PRO plan; sınırsız kredi, reklamsız kullanım ve gelecekteki premium özelliklere erişim sağlar.",
    proPayBtnText: "PRO’ya geç",
    proPriceTextTr:
      "InspireApp PRO – aylık 299 TL (Google Play üzerinden ücretlendirilir).",
    proPriceTextEn:
      "InspireApp PRO – monthly subscription via Google Play.",

    emailNotSavedAlert: "Lütfen geçerli bir e-posta gir.",
    freeNoCreditsAlert:
      "Ücretsiz planda kredi bitti. Reklam izleyerek +1 alabilirsin.",
  },

  en: {
    topTitle: "INSPIREAPP",
    sidebarTitle: "Account & Chats",
    sidebarUserTitle: "User",
    sidebarEmailLabel: "Email",
    sidebarStatusLabel: "Status",
    sidebarChatsTitle: "Chats",
    sidebarPanelsTitle: "Panels",
    changeEmailBtnText: "Change email",
    newChatBtnText: "+ New chat",
    btnPanelChatText: "Chat",
    btnPanelTrendsText: "Trend Stream",
    btnPanelSeriesText: "30-Day Series",
    btnPanelHookText: "Hook Lab",
    btnPanelCopyText: "Trend Copy Machine",
    btnPanelProText: "PRO Tools",
    helpToggle2Text: "❓ Help",

    helpTitle: "Info & Support",
    helpAppTitle: "App",
    helpAppText1:
      "InspireApp is an AI-powered idea + trend + content planning assistant for short-form creators.",
    helpAppText2:
      "It generates ideas, hooks, titles, and trend-based flows for YouTube Shorts, TikTok and Instagram Reels.",
    helpFreeTitle: "Free Plan",
    helpFreeText: "4 credits per day. You can increase by watching ads.",
    helpProTitle: "PRO Plan",
    helpProText:
      "Price and billing details are shown when you tap the 'Go PRO' button (billing via Google Play).",
    helpSupportTitle: "Support",
    helpSupportText: "Email: insprireappdestek@gmail.com",
    closeHelpBtnText: "Close",

    trendsTitle: "🔥 Trends (This Week)",
    refreshTrendsBtnText: "Refresh trends",

    seriesTitle: "📅 30-Day Series Plan",
    seriesDesc:
      "Enter a topic and InspireApp will create a 30-day short video plan.",
    seriesPlaceholder: "Ex: Healthy meals, motivation videos...",
    seriesGenerateText: "Generate 30-day plan",

    hookTitle: "⚡ Hook Lab",
    hookDesc:
      "Write your topic; we generate strong hook sentences for the first 3 seconds.",
    hookPlaceholder: "Ex: Efficient studying for students",
    hookGenerateText: "Generate hook ideas",

    copyTitle: "🎬 Trend Copy Machine",
    copyDesc:
      "Paste a trend / video idea; InspireApp rewrites it for your niche.",
    copyPlaceholder:
      "Ex: I want to adapt this video idea to my brand tone...",
    copyGenerateText: "Generate trend copy",

    chatTitle: "💬 Chat",
    topicPlaceholder: "Topic (e.g. fashion)",
    messagePlaceholder: "Type a message...",
    sendBtnText: "Send",
    watchAdBtnText: "Watch Ad +1 credit",
    loadingText: "Loading...",

    // PRO PANEL UI
    proPanelTitle: "⭐ PRO Tools",
    proPanelDesc:
      "These tools are designed for PRO users. On free plan they are limited; PRO unlocks full power.",
    proTool1Title: "1) Competitor Video Analysis",
    proTool1Desc:
      "Paste a TikTok / Reels / Shorts link or description. InspireApp explains why it worked and creates stronger hooks and a version for your niche.",
    proTool3Title: "3) Audience Insight Analysis",
    proTool3Desc:
      "Describe your target audience in one sentence. InspireApp generates psychology, formats, hooks and CTA patterns.",
    proTool5Title: "5) Silent Content Generator",
    proTool5Desc:
      "If you want faceless / silent content, write your topic. We generate silent flows and scene ideas.",
    proCompetitorBtnText: "Analyze competitor video (PRO)",
    proAudienceBtnText: "Generate audience insights (PRO)",
    proSilentBtnText: "Generate silent content ideas (PRO)",

    planFreeLabel: "Plan: Free",
    planProLabel: "Plan: Pro (unlimited credits)",
    creditsLabelFree: (credits) => `Credits: ${credits}/${MAX_FREE_CREDITS}`,
    creditsLabelPro: "Credits: Unlimited",

    onboardTitle: "INSPIREAPP",
    onboardLangTitle: "Choose language",
    onboardLangSaveBtnText: "Continue",
    onboardEmailTitle: "Your email address",
    onboardEmailPlaceholder: "you@example.com",
    onboardEmailSaveBtnText: "Start chatting",

    adTitle: "Watch Ad for +1 Credit",
    adText:
      'Watch a video ad; then tap "I watched the ad" to add +1 credit to your account.',
    adCancelBtnText: "Cancel",
    adWatchedBtnText: "I watched the ad, give +1",
    adConfirmTitle: "Are you sure?",
    adConfirmText: "You are about to cancel watching the ad.",
    adContinueBtnText: "Keep watching",
    adConfirmCloseBtnText: "Yes, close",
    adDailyLimit: (limit) => `Daily ad limit reached. (Limit: ${limit})`,
    adPreparing: "Ad is loading...",

    proTitle: "InspireApp PRO",
    proDesc:
      "PRO gives unlimited credits, no ads, and access to all future premium features.",
    proPayBtnText: "Go PRO",
    proPriceTextTr: "InspireApp PRO – monthly subscription via Google Play.",
    proPriceTextEn: "InspireApp PRO – monthly subscription via Google Play.",

    emailNotSavedAlert: "Please enter a valid email.",
    freeNoCreditsAlert:
      "You ran out of credits on the free plan. Watch an ad to get +1.",
  },

  // === ARABIC ===
  ar: {
    topTitle: "INSPIREAPP",
    sidebarTitle: "الحساب والدردشات",
    sidebarUserTitle: "المستخدم",
    sidebarEmailLabel: "البريد الإلكتروني",
    sidebarStatusLabel: "الحالة",
    sidebarChatsTitle: "الدردشات",
    sidebarPanelsTitle: "اللوحات",
    changeEmailBtnText: "تغيير البريد",
    newChatBtnText: "+ محادثة جديدة",
    btnPanelChatText: "دردشة",
    btnPanelTrendsText: "الترندات",
    btnPanelSeriesText: "سلسلة 30 يومًا",
    btnPanelHookText: "معمل الهوك",
    btnPanelCopyText: "آلة نسخ الترند",
    btnPanelProText: "أدوات PRO",
    helpToggle2Text: "❓ مساعدة",

    helpTitle: "معلومات ودعم",
    helpAppTitle: "التطبيق",
    helpAppText1:
      "InspireApp هو مساعد مدعوم بالذكاء الاصطناعي لصناع المحتوى القصير.",
    helpAppText2:
      "ينتج أفكارًا، وعناوين، وهوكات، وتدفّقات محتوى لـ YouTube Shorts وTikTok وReels.",
    helpFreeTitle: "الخطة المجانية",
    helpFreeText: "٤ نقاط يوميًا. يمكنك زيادتها بمشاهدة الإعلانات.",
    helpProTitle: "خطة PRO",
    helpProText:
      "سعر الاشتراك يُعرض عند الضغط على زر الانتقال إلى PRO (يتم الدفع عبر Google Play).",
    helpSupportTitle: "الدعم",
    helpSupportText: "البريد: insprireappdestek@gmail.com",
    closeHelpBtnText: "إغلاق",

    trendsTitle: "🔥 الترندات (هذا الأسبوع)",
    refreshTrendsBtnText: "تحديث الترندات",

    seriesTitle: "📅 خطة سلسلة 30 يومًا",
    seriesDesc:
      "اكتب موضوعًا، وسيُنشئ InspireApp خطة فيديوهات قصيرة لمدة 30 يومًا.",
    seriesPlaceholder: "مثال: أكل صحي، فيديوهات تحفيز...",
    seriesGenerateText: "إنشاء خطة 30 يومًا",

    hookTitle: "⚡ معمل الهوك",
    hookDesc:
      "اكتب موضوعك؛ نُنشئ جمل افتتاحية قوية لأول 3 ثوانٍ من الفيديو.",
    hookPlaceholder: "مثال: المذاكرة الفعّالة للطلاب",
    hookGenerateText: "توليد هوكات",

    copyTitle: "🎬 آلة نسخ الترند",
    copyDesc:
      "اكتب فكرة ترند أو فيديو؛ يحوّلها InspireApp لتناسب تخصّصك.",
    copyPlaceholder:
      "مثال: أريد تعديل هذه الفكرة لتناسب أسلوب علامتي التجارية...",
    copyGenerateText: "إنشاء نسخة الترند",

    chatTitle: "💬 دردشة",
    topicPlaceholder: "الموضوع (مثال: الموضة)",
    messagePlaceholder: "اكتب رسالة...",
    sendBtnText: "إرسال",
    watchAdBtnText: "مشاهدة إعلان +1 نقطة",
    loadingText: "جاري التحميل...",

    proPanelTitle: "⭐ أدوات PRO",
    proPanelDesc:
      "هذه الأدوات مصممة لمستخدمي PRO. في الخطة المجانية تعمل بشكل محدود.",
    proTool1Title: "1) تحليل فيديو منافس",
    proTool1Desc:
      "الصق رابط TikTok / Reels / Shorts أو وصف الفيديو. نحلل لماذا نجح وننشئ هوكات أقوى وإصدارًا خاصًا لك.",
    proTool3Title: "3) تحليل جمهورك",
    proTool3Desc:
      "صف جمهورك في جملة واحدة؛ نُخرج لك دوافعهم، وصيغ الفيديو المفضلة، وهوكات وعبارات دعوة للإجراء.",
    proTool5Title: "5) مولّد محتوى صامت",
    proTool5Desc:
      "لمن يريد محتوى بدون وجه وبدون صوت. اكتب الموضوع وسنقترح تدفّقات وفيديوهات صامتة.",
    proCompetitorBtnText: "تحليل فيديو منافس (PRO)",
    proAudienceBtnText: "توليد رؤى الجمهور (PRO)",
    proSilentBtnText: "توليد أفكار محتوى صامت (PRO)",

    planFreeLabel: "الخطة: مجانية",
    planProLabel: "الخطة: PRO (نقاط غير محدودة)",
    creditsLabelFree: (credits) => `النقاط: ${credits}/${MAX_FREE_CREDITS}`,
    creditsLabelPro: "النقاط: غير محدودة",

    onboardTitle: "INSPIREAPP",
    onboardLangTitle: "اختر اللغة",
    onboardLangSaveBtnText: "متابعة",
    onboardEmailTitle: "بريدك الإلكتروني",
    onboardEmailPlaceholder: "you@example.com",
    onboardEmailSaveBtnText: "ابدأ الدردشة",

    adTitle: "مشاهدة إعلان مقابل +1 نقطة",
    adText:
      'شاهد إعلان فيديو ثم اضغط "شاهدت الإعلان" لإضافة +1 نقطة لحسابك.',
    adCancelBtnText: "إلغاء",
    adWatchedBtnText: "شاهدت الإعلان، أضف +1",
    adConfirmTitle: "هل أنت متأكد؟",
    adConfirmText: "أنت على وشك إلغاء مشاهدة الإعلان.",
    adContinueBtnText: "الاستمرار في المشاهدة",
    adConfirmCloseBtnText: "نعم، إغلاق",
    adDailyLimit: (limit) => `تم بلوغ حد الإعلانات اليومي. (الحد: ${limit})`,
    adPreparing: "جاري تجهيز الإعلان...",

    proTitle: "InspireApp PRO",
    proDesc:
      "خطة PRO تعطيك نقاطًا غير محدودة، بدون إعلانات، ووصولًا للميزات المميزة.",
    proPayBtnText: "الانتقال إلى PRO",
    proPriceTextTr:
      "InspireApp PRO – اشتراك شهري عبر Google Play.",
    proPriceTextEn:
      "InspireApp PRO – monthly subscription via Google Play.",

    emailNotSavedAlert: "يرجى إدخال بريد إلكتروني صحيح.",
    freeNoCreditsAlert:
      "انتهت نقاط الخطة المجانية. شاهد إعلانًا لتحصل على +1.",
  },

  // === GERMAN ===
  de: {
    topTitle: "INSPIREAPP",
    sidebarTitle: "Konto & Chats",
    sidebarUserTitle: "Benutzer",
    sidebarEmailLabel: "E-Mail",
    sidebarStatusLabel: "Status",
    sidebarChatsTitle: "Chats",
    sidebarPanelsTitle: "Panels",
    changeEmailBtnText: "E-Mail ändern",
    newChatBtnText: "+ Neuer Chat",
    btnPanelChatText: "Chat",
    btnPanelTrendsText: "Trends",
    btnPanelSeriesText: "30-Tage-Serie",
    btnPanelHookText: "Hook-Labor",
    btnPanelCopyText: "Trend-Kopierer",
    btnPanelProText: "PRO-Tools",
    helpToggle2Text: "❓ Hilfe",

    helpTitle: "Info & Support",
    helpAppTitle: "App",
    helpAppText1:
      "InspireApp ist ein KI-gestützter Assistent für Kurzvideo-Creator.",
    helpAppText2:
      "Er erstellt Ideen, Hooks, Titel und Trend-Flows für Shorts, TikTok und Reels.",
    helpFreeTitle: "Gratis-Plan",
    helpFreeText: "4 Credits pro Tag. Mehr durch Werbung.",
    helpProTitle: "PRO-Plan",
    helpProText:
      "Preis und Abrechnung werden beim Tippen auf „Zu PRO wechseln“ angezeigt (Google Play).",
    helpSupportTitle: "Support",
    helpSupportText: "E-Mail: insprireappdestek@gmail.com",
    closeHelpBtnText: "Schließen",

    trendsTitle: "🔥 Trends (diese Woche)",
    refreshTrendsBtnText: "Trends aktualisieren",

    seriesTitle: "📅 30-Tage-Serienplan",
    seriesDesc:
      "Gib ein Thema ein, InspireApp erstellt einen 30-Tage-Plan.",
    seriesPlaceholder: "z.B.: Gesunde Ernährung, Motivation...",
    seriesGenerateText: "30-Tage-Plan erstellen",

    hookTitle: "⚡ Hook-Labor",
    hookDesc:
      "Schreibe dein Thema; wir erzeugen starke Hooks für die ersten 3 Sekunden.",
    hookPlaceholder: "z.B.: Effizientes Lernen für Studenten",
    hookGenerateText: "Hooks erzeugen",

    copyTitle: "🎬 Trend-Kopiermaschine",
    copyDesc:
      "Schreib eine Trend-/Videoidee; InspireApp schreibt sie für deine Nische um.",
    copyPlaceholder:
      "z.B.: Diese Videoidee an meinen Brand-Ton anpassen...",
    copyGenerateText: "Trendkopie erzeugen",

    chatTitle: "💬 Chat",
    topicPlaceholder: "Thema (z.B. Mode)",
    messagePlaceholder: "Nachricht schreiben...",
    sendBtnText: "Senden",
    watchAdBtnText: "Werbung ansehen +1 Credit",
    loadingText: "Lädt...",

    proPanelTitle: "⭐ PRO-Tools",
    proPanelDesc:
      "Diese Tools sind für PRO-Nutzer. Im Gratis-Plan eingeschränkt.",
    proTool1Title: "1) Konkurrenz-Videoanalyse",
    proTool1Desc:
      "Füge einen TikTok-/Reels-/Shorts-Link oder eine Beschreibung ein. Wir erklären, warum es funktioniert, und generieren bessere Hooks.",
    proTool3Title: "3) Zielgruppen-Insights",
    proTool3Desc:
      "Beschreibe deine Zielgruppe in einem Satz. InspireApp erzeugt Psychologie, Formate, Hooks und CTAs.",
    proTool5Title: "5) Stiller Content-Generator",
    proTool5Desc:
      "Für Content ohne Gesicht und Stimme. Wir erzeugen stille Video-Flows und Szenenideen.",
    proCompetitorBtnText: "Konkurrenzvideo analysieren (PRO)",
    proAudienceBtnText: "Zielgruppen-Insights erzeugen (PRO)",
    proSilentBtnText: "Ideen für stillen Content (PRO)",

    planFreeLabel: "Plan: Gratis",
    planProLabel: "Plan: PRO (unbegrenzte Credits)",
    creditsLabelFree: (credits) => `Credits: ${credits}/${MAX_FREE_CREDITS}`,
    creditsLabelPro: "Credits: Unbegrenzt",

    onboardTitle: "INSPIREAPP",
    onboardLangTitle: "Sprache wählen",
    onboardLangSaveBtnText: "Weiter",
    onboardEmailTitle: "Deine E-Mail-Adresse",
    onboardEmailPlaceholder: "du@example.com",
    onboardEmailSaveBtnText: "Chat starten",

    adTitle: "Werbung ansehen für +1 Credit",
    adText:
      'Sieh dir ein Video an und tippe dann auf „Ich habe die Werbung gesehen“, um +1 Credit zu erhalten.',
    adCancelBtnText: "Abbrechen",
    adWatchedBtnText: "Werbung gesehen, +1 geben",
    adConfirmTitle: "Bist du sicher?",
    adConfirmText: "Du bist dabei, die Werbung abzubrechen.",
    adContinueBtnText: "Weiter ansehen",
    adConfirmCloseBtnText: "Ja, schließen",
    adDailyLimit: (limit) =>
      `Tägliches Werbelimit erreicht. (Limit: ${limit})`,
    adPreparing: "Werbung wird geladen...",

    proTitle: "InspireApp PRO",
    proDesc:
      "PRO bietet unbegrenzte Credits, keine Werbung und Zugriff auf Premium-Features.",
    proPayBtnText: "Zu PRO wechseln",
    proPriceTextTr:
      "InspireApp PRO – Monatsabo über Google Play.",
    proPriceTextEn:
      "InspireApp PRO – monthly subscription via Google Play.",

    emailNotSavedAlert: "Bitte eine gültige E-Mail eingeben.",
    freeNoCreditsAlert:
      "Deine Gratis-Credits sind aufgebraucht. Sieh dir eine Werbung an, um +1 zu erhalten.",
  },

  // === SPANISH ===
  es: {
    topTitle: "INSPIREAPP",
    sidebarTitle: "Cuenta y chats",
    sidebarUserTitle: "Usuario",
    sidebarEmailLabel: "Correo",
    sidebarStatusLabel: "Estado",
    sidebarChatsTitle: "Chats",
    sidebarPanelsTitle: "Paneles",
    changeEmailBtnText: "Cambiar correo",
    newChatBtnText: "+ Nuevo chat",
    btnPanelChatText: "Chat",
    btnPanelTrendsText: "Tendencias",
    btnPanelSeriesText: "Serie de 30 días",
    btnPanelHookText: "Laboratorio de hooks",
    btnPanelCopyText: "Copiadora de tendencias",
    btnPanelProText: "Herramientas PRO",
    helpToggle2Text: "❓ Ayuda",

    helpTitle: "Info y soporte",
    helpAppTitle: "App",
    helpAppText1:
      "InspireApp es un asistente con IA para creadores de video corto.",
    helpAppText2:
      "Genera ideas, hooks, títulos y flujos basados en tendencias para Shorts, TikTok y Reels.",
    helpFreeTitle: "Plan gratuito",
    helpFreeText: "4 créditos al día. Más viendo anuncios.",
    helpProTitle: "Plan PRO",
    helpProText:
      "El precio se muestra al pulsar el botón de ir a PRO (facturación vía Google Play).",
    helpSupportTitle: "Soporte",
    helpSupportText: "Correo: insprireappdestek@gmail.com",
    closeHelpBtnText: "Cerrar",

    trendsTitle: "🔥 Tendencias (esta semana)",
    refreshTrendsBtnText: "Actualizar tendencias",

    seriesTitle: "📅 Plan de serie de 30 días",
    seriesDesc:
      "Escribe un tema y InspireApp creará un plan de 30 días.",
    seriesPlaceholder: "Ej.: Comida saludable, videos de motivación...",
    seriesGenerateText: "Crear plan de 30 días",

    hookTitle: "⚡ Laboratorio de hooks",
    hookDesc:
      "Escribe tu tema; generamos frases de apertura fuertes para los primeros 3 segundos.",
    hookPlaceholder: "Ej.: Estudio eficiente para estudiantes",
    hookGenerateText: "Generar hooks",

    copyTitle: "🎬 Copiadora de tendencias",
    copyDesc:
      "Escribe una idea de tendencia o video; InspireApp la reescribe para tu nicho.",
    copyPlaceholder:
      "Ej.: Quiero adaptar esta idea al tono de mi marca...",
    copyGenerateText: "Generar copia de tendencia",

    chatTitle: "💬 Chat",
    topicPlaceholder: "Tema (p. ej. moda)",
    messagePlaceholder: "Escribe un mensaje...",
    sendBtnText: "Enviar",
    watchAdBtnText: "Ver anuncio +1 crédito",
    loadingText: "Cargando...",

    proPanelTitle: "⭐ Herramientas PRO",
    proPanelDesc:
      "Estas herramientas están diseñadas para usuarios PRO. En el plan gratuito son limitadas.",
    proTool1Title: "1) Análisis de video competidor",
    proTool1Desc:
      "Pega un enlace o descripción de TikTok / Reels / Shorts. Analizamos por qué funciona y generamos mejores hooks.",
    proTool3Title: "3) Análisis de audiencia",
    proTool3Desc:
      "Describe tu audiencia en una frase; generamos psicología, formatos, hooks y CTAs.",
    proTool5Title: "5) Generador de contenido silencioso",
    proTool5Desc:
      "Para contenido sin rostro ni voz. Generamos flujos y escenas de video silencioso.",
    proCompetitorBtnText: "Analizar video competidor (PRO)",
    proAudienceBtnText: "Generar insights de audiencia (PRO)",
    proSilentBtnText: "Generar ideas de contenido silencioso (PRO)",

    planFreeLabel: "Plan: Gratis",
    planProLabel: "Plan: PRO (créditos ilimitados)",
    creditsLabelFree: (credits) => `Créditos: ${credits}/${MAX_FREE_CREDITS}`,
    creditsLabelPro: "Créditos: Ilimitados",

    onboardTitle: "INSPIREAPP",
    onboardLangTitle: "Elige idioma",
    onboardLangSaveBtnText: "Continuar",
    onboardEmailTitle: "Tu correo electrónico",
    onboardEmailPlaceholder: "tú@example.com",
    onboardEmailSaveBtnText: "Empezar chat",

    adTitle: "Ver anuncio por +1 crédito",
    adText:
      'Mira un anuncio y luego pulsa "He visto el anuncio" para sumar +1 crédito.',
    adCancelBtnText: "Cancelar",
    adWatchedBtnText: "He visto el anuncio, dame +1",
    adConfirmTitle: "¿Seguro?",
    adConfirmText: "Vas a cancelar la visualización del anuncio.",
    adContinueBtnText: "Seguir viendo",
    adConfirmCloseBtnText: "Sí, cerrar",
    adDailyLimit: (limit) =>
      `Límite diario de anuncios alcanzado. (Límite: ${limit})`,
    adPreparing: "Cargando anuncio...",

    proTitle: "InspireApp PRO",
    proDesc:
      "PRO ofrece créditos ilimitados, sin anuncios y acceso a funciones premium.",
    proPayBtnText: "Ir a PRO",
    proPriceTextTr:
      "InspireApp PRO – suscripción mensual vía Google Play.",
    proPriceTextEn:
      "InspireApp PRO – monthly subscription via Google Play.",

    emailNotSavedAlert: "Por favor, introduce un correo válido.",
    freeNoCreditsAlert:
      "Se han agotado tus créditos gratuitos. Mira un anuncio para obtener +1.",
  },
};

// Small legacy UI_TEXT support
const UI_TEXT = {
  tr: {
    send: "Gönder",
    ad: "Reklam izle +1 puan",
    placeholder: "Mesaj yaz veya konu gir...",
  },
  en: {
    send: "Send",
    ad: "Watch Ad +1 credit",
    placeholder: "Type a message or topic...",
  },
  ar: {
    send: "إرسال",
    ad: "شاهد إعلانًا +1 نقطة",
    placeholder: "اكتب رسالة أو فكرة...",
  },
  de: {
    send: "Senden",
    ad: "Werbung ansehen +1 Punkt",
    placeholder: "Nachricht oder Thema eingeben...",
  },
  es: {
    send: "Enviar",
    ad: "Ver anuncio +1 crédito",
    placeholder: "Escribe un mensaje o tema...",
  },
};

// === GLOBAL STATE ===
const state = {
  conversations: [],
  currentId: null,
  plan: "free",
  credits: MAX_FREE_CREDITS,
  lang: "tr",
  email: "",
};

// === STATE LOAD / SAVE ===
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state.conversations = JSON.parse(raw);
  } catch {
    state.conversations = [];
  }
  if (!state.conversations.length) {
    const first = {
      id: Date.now().toString(),
      title: "Yeni sohbet",
      messages: [],
      createdAt: Date.now(),
    };
    state.conversations.push(first);
  }
  state.currentId = state.conversations[0].id;

  const p = localStorage.getItem(PLAN_KEY);
  if (p === "pro" || p === "free") state.plan = p;

  const cStr = localStorage.getItem(CREDITS_KEY);
  const c = parseInt(cStr || "", 10);
  state.credits = Number.isNaN(c) ? MAX_FREE_CREDITS : c;

  const l = localStorage.getItem(LANG_KEY);
  if (l && LANG_NAMES[l]) state.lang = l;

  const e = localStorage.getItem(EMAIL_KEY);
  if (e) state.email = e;
}

function saveConversations() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.conversations));
}
function saveCredits() {
  localStorage.setItem(CREDITS_KEY, String(state.credits));
}
function savePlan() {
  localStorage.setItem(PLAN_KEY, state.plan);
}
function saveEmail() {
  if (state.email) localStorage.setItem(EMAIL_KEY, state.email);
  else localStorage.removeItem(EMAIL_KEY);
}

function currentConv() {
  return state.conversations.find((c) => c.id === state.currentId);
}

function buildTitleFromText(text) {
  if (!text) return "Sohbet";
  let line = text.split("\n")[0];
  line = line.split(/[.!?]/)[0].trim();
  if (!line) line = text.trim();
  if (line.length > 40) line = line.slice(0, 40) + "…";
  return line || "Sohbet";
}

// === CONVERSATION RENDER ===
function renderConversationList() {
  const listEl = document.getElementById("conversationList");
  if (!listEl) return;
  listEl.innerHTML = "";

  // Mobilde uzun basınca sistem menüsü (kopyala/seç) çıkmasın diye
  if (!document.getElementById("mobile-press-style")) {
    const style = document.createElement("style");
    style.id = "mobile-press-style";
    style.textContent = `
      .conversation-item {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
    `;
    document.head.appendChild(style);
  }

  function handleDelete(convId) {
    const confirmText =
      state.lang === "tr"
        ? "Bu sohbeti silmek istiyor musun?"
        : state.lang === "ar"
        ? "هل تريد حذف هذه الدردشة؟"
        : state.lang === "de"
        ? "Möchtest du diesen Chat löschen?"
        : state.lang === "es"
        ? "¿Quieres eliminar este chat?"
        : "Do you want to delete this chat?";
    const ok = confirm(confirmText);
    if (!ok) return;

    state.conversations = state.conversations.filter((c) => c.id !== convId);

    if (!state.conversations.length) {
      const first = {
        id: Date.now().toString(),
        title: state.lang === "tr" ? "Yeni sohbet" : "New chat",
        messages: [],
        createdAt: Date.now(),
      };
      state.conversations.push(first);
    }

    state.currentId = state.conversations[0].id;
    saveConversations();
    renderConversationList();
    renderMessages();
  }

  state.conversations
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach((conv) => {
      const item = document.createElement("div");
      item.className =
        "conversation-item" + (conv.id === state.currentId ? " active" : "");
      item.textContent = conv.title || "Sohbet";

      // Normal tıklama → sohbete geç
      item.addEventListener("click", () => {
        state.currentId = conv.id;
        renderConversationList();
        renderMessages();
      });

      // Masaüstü: sağ tık → sil (ve sistem menüsünü engelle)
      item.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        if (!("ontouchstart" in window)) {
          handleDelete(conv.id);
        }
      });

      // Mobil: uzun bas → sil
      let pressTimer = null;
      const LONG_PRESS_DURATION = 600;

      item.addEventListener(
        "touchstart",
        () => {
          pressTimer = setTimeout(() => {
            handleDelete(conv.id);
          }, LONG_PRESS_DURATION);
        },
        { passive: true }
      );

      const cancelPress = () => {
        if (pressTimer) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
      };

      ["touchend", "touchmove", "touchcancel"].forEach((ev) => {
        item.addEventListener(ev, cancelPress);
      });

      listEl.appendChild(item);
    });
}

function renderMessages() {
  const container = document.getElementById("chatMessages");
  if (!container) return;
  const conv = currentConv();
  container.innerHTML = "";

  conv.messages.forEach((m) => {
    const row = document.createElement("div");
    row.className = "message-row " + m.role;

    const bubble = document.createElement("div");
    bubble.className = "bubble";

    const textEl = document.createElement("pre");
    textEl.className = "bubble-text";
    textEl.textContent = m.text;

    bubble.appendChild(textEl);
    row.appendChild(bubble);
    container.appendChild(row);
  });

  container.scrollTop = container.scrollHeight;
}

function addMessage(role, text) {
  const conv = currentConv();
  conv.messages.push({ role, text });
  if (!conv.title || conv.title === "Yeni sohbet" || conv.title === "New chat") {
    const firstUserMsg = conv.messages.find((m) => m.role === "user");
    if (firstUserMsg?.text) conv.title = buildTitleFromText(firstUserMsg.text);
  }
  saveConversations();
  renderConversationList();
  renderMessages();
}

// === PLAN & CREDITS UI ===
function updatePlanAndCreditsUI() {
  const t = I18N[state.lang] || I18N.tr;
  const planLabel = document.getElementById("planLabel");
  const creditsLabel = document.getElementById("creditsLabel");
  const watchAdBtn = document.getElementById("watchAdBtn");
  const planStatus = document.getElementById("planStatus");
  const subscribeBlock = document.getElementById("subscribeBlock");

  if (planLabel) {
    planLabel.textContent =
      state.plan === "pro" ? t.planProLabel : t.planFreeLabel;
  }
  if (creditsLabel) {
    creditsLabel.textContent =
      state.plan === "pro"
        ? t.creditsLabelPro
        : (t.creditsLabelFree && t.creditsLabelFree(state.credits)) || "";
  }
  if (watchAdBtn) {
    watchAdBtn.classList.toggle("hidden", state.plan !== "free");
  }
  if (planStatus) {
    planStatus.textContent =
      state.plan === "pro" ? t.planProLabel : t.planFreeLabel;
  }
  if (subscribeBlock) {
    subscribeBlock.classList.toggle("hidden", state.plan === "pro");
  }
}

function updateAccountEmailUI() {
  const el = document.getElementById("accountEmail");
  if (!el) return;
  let notSaved =
    state.lang === "tr"
      ? "Kayıtlı değil"
      : state.lang === "ar"
      ? "غير محفوظ"
      : state.lang === "de"
      ? "Nicht gespeichert"
      : state.lang === "es"
      ? "No guardado"
      : "Not set";
  el.textContent = state.email || notSaved;
}

// === APPLY LANGUAGE TO UI ===
function applyUITextForLang(code) {
  const t = I18N[code] || I18N.tr;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el && value !== undefined) el.textContent = value;
  };
  const setHTML = (id, value) => {
    const el = document.getElementById(id);
    if (el && value !== undefined) el.innerHTML = value;
  };
  const setPlaceholder = (id, value) => {
    const el = document.getElementById(id);
    if (el && value !== undefined) el.placeholder = value;
  };

  setText("topTitle", t.topTitle);

  setText("sidebarTitle", t.sidebarTitle);
  setText("sidebarUserTitle", t.sidebarUserTitle);
  setText("sidebarEmailLabel", t.sidebarEmailLabel);
  setText("sidebarStatusLabel", t.sidebarStatusLabel);
  setText("sidebarChatsTitle", t.sidebarChatsTitle);
  setText("sidebarPanelsTitle", t.sidebarPanelsTitle);
  setText("changeEmailBtnText", t.changeEmailBtnText);
  setText("newChatBtnText", t.newChatBtnText);
  setText("btnPanelChatText", t.btnPanelChatText);
  setText("btnPanelTrendsText", t.btnPanelTrendsText);
  setText("btnPanelSeriesText", t.btnPanelSeriesText);
  setText("btnPanelHookText", t.btnPanelHookText);
  setText("btnPanelCopyText", t.btnPanelCopyText);
  setText("btnPanelProText", t.btnPanelProText);
  setText("helpToggle2Text", t.helpToggle2Text);

  setText("helpTitle", t.helpTitle);
  setText("helpAppTitle", t.helpAppTitle);
  setText("helpFreeTitle", t.helpFreeTitle);
  setText("helpProTitle", t.helpProTitle);
  setText("helpSupportTitle", t.helpSupportTitle);
  setText("closeHelpBtnText", t.closeHelpBtnText);
  setHTML("helpAppText1", t.helpAppText1);
  setHTML("helpAppText2", t.helpAppText2);
  setText("helpFreeText", t.helpFreeText);
  setHTML("helpProText", t.helpProText);
  setText("helpSupportText", t.helpSupportText);

  setText("trendsTitle", t.trendsTitle);
  setText("refreshTrendsBtnText", t.refreshTrendsBtnText);

  setText("seriesTitle", t.seriesTitle);
  setText("seriesDesc", t.seriesDesc);
  setPlaceholder("seriesTopic", t.seriesPlaceholder);
  setText("seriesGenerateText", t.seriesGenerateText);

  setText("hookTitle", t.hookTitle);
  setText("hookDesc", t.hookDesc);
  setPlaceholder("hookTopic", t.hookPlaceholder);
  setText("hookGenerateText", t.hookGenerateText);

  setText("copyTitle", t.copyTitle);
  setText("copyDesc", t.copyDesc);
  setPlaceholder("copyTopic", t.copyPlaceholder);
  setText("copyGenerateText", t.copyGenerateText);

  setText("chatTitle", t.chatTitle);
  setPlaceholder("topicInput", t.topicPlaceholder);
  setPlaceholder("messageInput", t.messagePlaceholder);
  setText("sendBtnText", t.sendBtnText);
  setText("watchAdBtnText", t.watchAdBtnText);
  const loadingEl = document.getElementById("loading");
  if (loadingEl) loadingEl.textContent = t.loadingText;

  setText("onboardTitle", t.onboardTitle);
  setText("onboardLangTitle", t.onboardLangTitle);
  setText("onboardLangSaveBtnText", t.onboardLangSaveBtnText);
  setText("onboardEmailTitle", t.onboardEmailTitle);
  setPlaceholder("onboardEmailInput", t.onboardEmailPlaceholder);
  setText("onboardEmailSaveBtnText", t.onboardEmailSaveBtnText);

  setText("adTitle", t.adTitle);
  setHTML("adText", t.adText);
  setText("adCancelBtnText", t.adCancelBtnText);
  setText("adWatchedBtnText", t.adWatchedBtnText);
  setText("adConfirmTitle", t.adConfirmTitle);
  setText("adConfirmText", t.adConfirmText);
  setText("adContinueBtnText", t.adContinueBtnText);
  setText("adConfirmCloseBtnText", t.adConfirmCloseBtnText);

  setText("proTitle", t.proTitle);
  setText("proDesc", t.proDesc);
  setText("proPayBtnText", t.proPayBtnText);

  // PRO panel metinleri
  setText("proPanelTitle", t.proPanelTitle);
  setText("proPanelDesc", t.proPanelDesc);
  setText("proTool1Title", t.proTool1Title);
  setText("proTool1Desc", t.proTool1Desc);
  setText("proTool3Title", t.proTool3Title);
  setText("proTool3Desc", t.proTool3Desc);
  setText("proTool5Title", t.proTool5Title);
  setText("proTool5Desc", t.proTool5Desc);
  setText("proCompetitorBtnText", t.proCompetitorBtnText);
  setText("proAudienceBtnText", t.proAudienceBtnText);
  setText("proSilentBtnText", t.proSilentBtnText);

  // Plan & credits (dynamic) refresh
  updatePlanAndCreditsUI();
}

// Old small UI_TEXT usage
function applySmallUIText(code) {
  const t = UI_TEXT[code] || UI_TEXT.en;
  const sendBtn = document.getElementById("sendBtnText");
  const watchAdBtn = document.getElementById("watchAdBtnText");
  const messageInput = document.getElementById("messageInput");
  if (sendBtn) sendBtn.textContent = t.send;
  if (watchAdBtn) watchAdBtn.textContent = t.ad;
  if (messageInput && !messageInput.value) messageInput.placeholder = t.placeholder;
}

function fillLangSelect(selectEl) {
  if (!selectEl) return;
  selectEl.innerHTML = "";
  Object.keys(LANG_NAMES).forEach((code) => {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = LANG_LABELS[code] || code;
    selectEl.appendChild(opt);
  });
  selectEl.value = state.lang;
}

// === API FUNCTIONS ===
async function callIdeasAPI(prompt, platform, langCode) {
  const langName = LANG_NAMES[langCode] || "Turkish";
  try {
    const res = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, platform, lang: langName }),
    });
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (data?.message) return data.message;
    } catch {
      if (text) return text;
    }
    return "API'den anlamlı bir cevap alınamadı.";
  } catch {
    return "Sunucuya bağlanırken bir hata oluştu.";
  }
}

async function callSimpleAPI(route, payload) {
  try {
    const res = await fetch(`/api/${route}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    return data?.message || "Sunucudan anlamlı bir cevap alınamadı.";
  } catch {
    return "Sunucuya bağlanırken bir hata oluştu.";
  }
}

// === PRO API HELPER – email + ONLY_PRO kontrolü ===
async function callProAPI(route, inputValue, resultEl) {
  const t = I18N[state.lang] || I18N.tr;

  if (!state.email) {
    const msg =
      state.lang === "tr"
        ? "PRO araçlarını kullanmak için önce geçerli bir e-posta ile giriş yapmalısın."
        : state.lang === "ar"
        ? "لاستخدام أدوات PRO يجب أولاً حفظ بريد إلكتروني صالح."
        : state.lang === "de"
        ? "Um PRO-Tools zu nutzen, musst du zuerst eine gültige E-Mail speichern."
        : state.lang === "es"
        ? "Para usar las herramientas PRO, primero debes guardar un correo válido."
        : "To use PRO tools, please save a valid email first.";
    resultEl.textContent = msg;
    return;
  }

  try {
    const res = await fetch(`/api/${route}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: state.email,
        input: inputValue,
        lang: LANG_NAMES[state.lang] || "Turkish",
      }),
    });

    const data = await res.json().catch(() => null);

    if (res.status === 403 && data?.message === "ONLY_PRO") {
      const proMsg =
        state.lang === "tr"
          ? "Bu özellik sadece PRO üyeler için. Uygulamadaki PRO’ya geç butonunu kullanarak yükseltebilirsin."
          : state.lang === "ar"
          ? "هذه الميزة متاحة فقط لمستخدمي PRO. يمكنك الترقية عبر زر الانتقال إلى PRO في التطبيق."
          : state.lang === "de"
          ? "Dieses Feature ist nur für PRO-Nutzer. Du kannst über den „Zu PRO wechseln“-Button upgraden."
          : state.lang === "es"
          ? "Esta función solo está disponible para usuarios PRO. Puedes actualizar con el botón Ir a PRO."
          : "This feature is only available for PRO users. Please upgrade using the Go PRO button.";
      resultEl.textContent = proMsg;
      return;
    }

    if (!res.ok) {
      resultEl.textContent =
        data?.message || "Sunucudan anlamlı bir cevap alınamadı.";
      return;
    }

    resultEl.textContent =
      data?.message || "Sunucudan anlamlı bir cevap alınamadı.";
  } catch (e) {
    resultEl.textContent = "Sunucuya bağlanırken bir hata oluştu.";
  }
}

async function loadTrends() {
  const list = document.getElementById("trendsList");
  if (!list) return;
  const region = (LANG_REGION[state.lang] || "US").toUpperCase();
  list.innerHTML = "<li>Yükleniyor...</li>";
  try {
    const res = await fetch(`/api/trends?region=${region}`);
    const data = await res.json();
    if (!res.ok) {
      list.innerHTML =
        "<li>Trendler alınırken hata: " + (data.message || "") + "</li>";
      return;
    }
    if (!data.items?.length) {
      list.innerHTML = "<li>Bu hafta trend bulunamadı.</li>";
      return;
    }
    list.innerHTML = "";
    data.items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "trends-item";
      const a = document.createElement("a");
      a.href = item.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = item.title;
      li.appendChild(a);
      list.appendChild(li);
    });
  } catch {
    list.innerHTML =
      "<li>Trendler alınırken beklenmeyen bir hata oluştu.</li>";
  }
}

// === AD CREDIT FUNCTION ===
function grantAdCredit() {
  if (state.plan !== "free") return;

  const t = I18N[state.lang] || I18N.tr;
  const today = new Date().toISOString().slice(0, 10);
  const storedDate = localStorage.getItem(AD_DATE_KEY);
  let storedCount = parseInt(
    localStorage.getItem(AD_COUNT_KEY) || "0",
    10
  );

  if (storedDate !== today) storedCount = 0;
  if (storedCount >= DAILY_AD_LIMIT) {
    alert(t.adDailyLimit ? t.adDailyLimit(DAILY_AD_LIMIT) : "");
    return;
  }

  storedCount += 1;
  localStorage.setItem(AD_DATE_KEY, today);
  localStorage.setItem(AD_COUNT_KEY, String(storedCount));

  state.credits += 1;
  saveCredits();
  updatePlanAndCreditsUI();
}

// Android-side aliases
window.__onRewardedAdCompletedFromAndroid = function () {
  grantAdCredit();
};
window.__onRealAdReward = function () {
  grantAdCredit();
};

// Android PRO plan activation
window.__setProPlanFromAndroid = function () {
  state.plan = "pro";
  savePlan();
  updatePlanAndCreditsUI();
  alert("🎉 PRO üyelik Google Play üzerinden aktif edildi!");
};

// === DOM READY ===
document.addEventListener("DOMContentLoaded", () => {
  loadState();

  const sidebar = document.getElementById("sidebar");
  const helpPanel = document.getElementById("helpPanel");
  const menuToggle = document.getElementById("menuToggle");
  const helpToggle = document.getElementById("helpToggle");
  const helpToggle2 = document.getElementById("helpToggle2");
  const closeHelpBtn = document.getElementById("closeHelpBtn");

  // Yardım panelinin sonuna gizlilik politikası kutusu ekle
  if (helpPanel) {
    const policyBox = document.createElement("div");
    policyBox.className = "policy-box";
    policyBox.innerHTML =
      'Gizlilik politikası: <a href="' +
      POLICY_URL +
      '" target="_blank" rel="noopener noreferrer">buraya tıkla</a>';
    helpPanel.appendChild(policyBox);
  }

  const chatForm = document.getElementById("chatForm");
  const topicInput = document.getElementById("topicInput");
  const platformSelect = document.getElementById("platformSelect");
  const langSelect = document.getElementById("langSelect");
  const messageInput = document.getElementById("messageInput");
  const loadingEl = document.getElementById("loading");
  const newChatBtn = document.getElementById("newChatBtn");
  const watchAdBtn = document.getElementById("watchAdBtn");
  const subscribeBtn = document.getElementById("subscribeBtn");
  const changeEmailBtn = document.getElementById("changeEmailBtn");

  const voiceBtn = document.getElementById("voiceBtn");
  const cameraBtn = document.getElementById("cameraBtn");
  const cameraFileInput = document.getElementById("cameraFileInput");

  const refreshTrendsBtn = document.getElementById("refreshTrendsBtn");
  const seriesGenerate = document.getElementById("seriesGenerate");
  const seriesTopic = document.getElementById("seriesTopic");
  const seriesResult = document.getElementById("seriesResult");
  const hookGenerate = document.getElementById("hookGenerate");
  const hookTopic = document.getElementById("hookTopic");
  const hookResult = document.getElementById("hookResult");
  const copyGenerate = document.getElementById("copyGenerate");
  const copyTopic = document.getElementById("copyTopic");
  const copyResult = document.getElementById("copyResult");

  const proCompetitorInput = document.getElementById("proCompetitorInput");
  const proCompetitorBtn = document.getElementById("proCompetitorBtn");
  const proCompetitorResult = document.getElementById("proCompetitorResult");
  const proAudienceInput = document.getElementById("proAudienceInput");
  const proAudienceBtn = document.getElementById("proAudienceBtn");
  const proAudienceResult = document.getElementById("proAudienceResult");
  const proSilentInput = document.getElementById("proSilentInput");
  const proSilentBtn = document.getElementById("proSilentBtn");
  const proSilentResult = document.getElementById("proSilentResult");

  const modalBackdrop = document.getElementById("modalBackdrop");
  const adModal = document.getElementById("adModal");
  const adStepMain = document.getElementById("adStepMain");
  const adStepConfirm = document.getElementById("adStepConfirm");
  const adWatchedBtn = document.getElementById("adWatchedBtn");
  const adCancelBtn = document.getElementById("adCancelBtn");
  const adCloseIcon = document.getElementById("adCloseIcon");
  const adContinueBtn = document.getElementById("adContinueBtn");
  const adConfirmCloseBtn = document.getElementById("adConfirmCloseBtn");

  const proModal = document.getElementById("proModal");
  const proCloseBtn = document.getElementById("proCloseBtn");
  const proPriceText = document.getElementById("proPriceText");
  const proPayBtn = document.getElementById("proPayBtn");

  const onboardingOverlay = document.getElementById("onboardingOverlay");
  const onboardStepLang = document.getElementById("onboardStepLang");
  const onboardStepEmail = document.getElementById("onboardStepEmail");
  const onboardLangSelect = document.getElementById("onboardLangSelect");
  const onboardLangSaveBtn = document.getElementById("onboardLangSaveBtn");
  const onboardEmailInput = document.getElementById("onboardEmailInput");
  const onboardPasswordInput = document.getElementById("onboardPasswordInput");
  const onboardEmailSaveBtn = document.getElementById("onboardEmailSaveBtn");

  // Fill language selectors
  fillLangSelect(langSelect);
  fillLangSelect(onboardLangSelect);

  // Initial render
  renderConversationList();
  renderMessages();
  applyUITextForLang(state.lang);
  applySmallUIText(state.lang);
  updateAccountEmailUI();
  loadTrends();

  function showOnboardingIfNeeded() {
    if (!onboardingOverlay || !onboardStepLang || !onboardStepEmail) return;
    const hasLang = !!localStorage.getItem(LANG_KEY);
    const hasEmail = !!localStorage.getItem(EMAIL_KEY);
    if (hasLang && hasEmail) {
      onboardingOverlay.classList.add("hidden");
      return;
    }
    onboardingOverlay.classList.remove("hidden");
    if (!hasLang) {
      onboardStepLang.classList.remove("hidden");
      onboardStepEmail.classList.add("hidden");
    } else {
      onboardStepLang.classList.add("hidden");
      onboardStepEmail.classList.remove("hidden");
    }
  }
  showOnboardingIfNeeded();

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("hidden");
    });
  }

  // === Sidebar'ı yana kaydırarak kapatma (mobil swipe) ===
  let swipeStartX = null;

  document.addEventListener(
    "touchstart",
    (e) => {
      if (!sidebar || sidebar.classList.contains("hidden")) return;
      if (!e.touches || !e.touches.length) return;
      swipeStartX = e.touches[0].clientX;
    },
    { passive: true }
  );

  document.addEventListener(
    "touchend",
    (e) => {
      if (swipeStartX === null) return;
      if (!sidebar || sidebar.classList.contains("hidden")) {
        swipeStartX = null;
        return;
      }
      if (!e.changedTouches || !e.changedTouches.length) return;

      const endX = e.changedTouches[0].clientX;
      const diffX = endX - swipeStartX;

      if (Math.abs(diffX) > 60) {
        sidebar.classList.add("hidden");
      }
      swipeStartX = null;
    },
    { passive: true }
  );

  function openHelp() {
    if (helpPanel) helpPanel.classList.remove("hidden");
  }
  function closeHelp() {
    if (helpPanel) helpPanel.classList.add("hidden");
  }
  if (helpToggle) helpToggle.addEventListener("click", openHelp);
  if (helpToggle2) helpToggle2.addEventListener("click", openHelp);
  if (closeHelpBtn) closeHelpBtn.addEventListener("click", closeHelp);

  if (newChatBtn) {
    newChatBtn.addEventListener("click", () => {
      const conv = {
        id: Date.now().toString(),
        title: state.lang === "tr" ? "Yeni sohbet" : "New chat",
        messages: [],
        createdAt: Date.now(),
      };
      state.conversations.unshift(conv);
      state.currentId = conv.id;
      saveConversations();
      renderConversationList();
      renderMessages();
    });
  }

  // === AD MODAL OPEN / CLOSE ===
  function openAdModal() {
    if (!modalBackdrop || !adModal) return;
    if (adStepMain) adStepMain.classList.remove("hidden");
    if (adStepConfirm) adStepConfirm.classList.add("hidden");
    modalBackdrop.classList.remove("hidden");
    adModal.classList.remove("hidden");
  }
  function closeAdModal() {
    if (!modalBackdrop || !adModal) return;
    adModal.classList.add("hidden");
  }

  // === PRO MODAL OPEN / CLOSE ===
  function openProModal() {
    if (!modalBackdrop || !proModal) return;
    const t = I18N[state.lang] || I18N.tr;
    const isTr = state.lang === "tr";
    if (proPriceText) {
      proPriceText.textContent = isTr ? t.proPriceTextTr : t.proPriceTextEn;
    }
    modalBackdrop.classList.remove("hidden");
    proModal.classList.remove("hidden");
  }
  function closeProModal() {
    if (!modalBackdrop || !proModal) return;
    proModal.classList.add("hidden");
  }

  if (watchAdBtn) {
    watchAdBtn.addEventListener("click", () => {
      if (state.plan !== "free") return;
      // Android real ad
      if (
        window.AndroidAds &&
        typeof window.AndroidAds.showRewardedAd === "function"
      ) {
        window.AndroidAds.showRewardedAd();
      } else {
        // Web demo
        openAdModal();
      }
    });
  }

  if (adCancelBtn) {
    adCancelBtn.addEventListener("click", () => {
      closeAdModal();
      if (modalBackdrop) modalBackdrop.classList.add("hidden");
    });
  }

  if (adWatchedBtn) {
    adWatchedBtn.addEventListener("click", () => {
      grantAdCredit();
      closeAdModal();
      if (modalBackdrop) modalBackdrop.classList.add("hidden");
    });
  }

  if (adCloseIcon) {
    adCloseIcon.addEventListener("click", () => {
      if (adStepMain) adStepMain.classList.add("hidden");
      if (adStepConfirm) adStepConfirm.classList.remove("hidden");
    });
  }
  if (adContinueBtn) {
    adContinueBtn.addEventListener("click", () => {
      if (adStepConfirm) adStepConfirm.classList.add("hidden");
      if (adStepMain) adStepMain.classList.remove("hidden");
    });
  }
  if (adConfirmCloseBtn) {
    adConfirmCloseBtn.addEventListener("click", () => {
      closeAdModal();
      if (modalBackdrop) modalBackdrop.classList.add("hidden");
    });
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      // Close only if user clicks on the backdrop, not the modal itself
      if (e.target === modalBackdrop) {
        closeAdModal();
        closeProModal();
        modalBackdrop.classList.add("hidden");
      }
    });
  }

  if (proCloseBtn) {
    proCloseBtn.addEventListener("click", () => {
      closeProModal();
      if (modalBackdrop) modalBackdrop.classList.add("hidden");
    });
  }

  if (subscribeBtn) {
    subscribeBtn.addEventListener("click", () => {
      if (state.plan === "pro") return;
      openProModal();
    });
  }

  if (proPayBtn) {
    proPayBtn.addEventListener("click", () => {
      const t = I18N[state.lang] || I18N.tr;
      const isTr = state.lang === "tr";
      const priceShort = isTr ? "aylık 299 TL" : "monthly";
      if (window.AndroidBilling && window.AndroidBilling.startPurchase) {
        const sku = isTr ? "pro_monthly_tr" : "pro_monthly_intl";
        window.AndroidBilling.startPurchase(sku);
      } else {
        alert(
          `PRO üyelik ${priceShort} olarak Google Play üzerinden ücretlendirilecektir.\nBu web sürümünde gerçek ödeme aktif değil.`
        );
      }
    });
  }

  if (onboardLangSaveBtn && onboardLangSelect) {
    onboardLangSaveBtn.addEventListener("click", () => {
      const code = onboardLangSelect.value || "tr";
      state.lang = code;
      localStorage.setItem(LANG_KEY, code);
      if (langSelect) langSelect.value = code;
      applyUITextForLang(code);
      applySmallUIText(code);
      loadTrends();
      if (onboardStepLang) onboardStepLang.classList.add("hidden");
      if (onboardStepEmail) onboardStepEmail.classList.remove("hidden");
    });
  }

  // === GİRİŞ / KAYIT – ŞİFRE YANLIŞ MESAJI DAHİL ===
  if (onboardEmailSaveBtn && onboardEmailInput && onboardPasswordInput) {
    onboardEmailSaveBtn.addEventListener("click", async () => {
      const email = onboardEmailInput.value.trim();
      const password = onboardPasswordInput.value.trim();

      if (!email || !password) {
        const msg =
          state.lang === "tr"
            ? "Lütfen e-posta ve şifre girin."
            : state.lang === "ar"
            ? "يرجى إدخال البريد وكلمة المرور."
            : state.lang === "de"
            ? "Bitte E-Mail und Passwort eingeben."
            : state.lang === "es"
            ? "Introduce correo y contraseña."
            : "Please enter email and password.";
        alert(msg);
        return;
      }

      // Ekranda hemen email gözüksün
      state.email = email;
      saveEmail();
      updateAccountEmailUI();

      let data = null;
      try {
        const res = await fetch("/api/register-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            plan: state.plan,
            credits: state.credits,
            lang: state.lang,
          }),
        });

        data = await res.json().catch(() => null);

        // Yanlış şifre
        if (res.status === 401 && data?.code === "INVALID_PASSWORD") {
          const msg =
            state.lang === "tr"
              ? "Şifre yanlış. Lütfen tekrar deneyin."
              : state.lang === "ar"
              ? "كلمة المرور غير صحيحة."
              : state.lang === "de"
              ? "Falsches Passwort."
              : state.lang === "es"
              ? "Contraseña incorrecta."
              : "Wrong password. Please try again.";
          setTimeout(() => alert(msg), 100);
          return; // Onboarding açık kalsın
        }

        if (!res.ok || !data) {
          throw new Error(data?.error || data?.message || "Sunucu hatası");
        }
      } catch (e) {
        console.error("register-user hatası:", e);
        const msg =
          state.lang === "tr"
            ? "Giriş/kayıt sırasında hata oluştu: "
            : state.lang === "ar"
            ? "حدث خطأ أثناء تسجيل الدخول/التسجيل: "
            : state.lang === "de"
            ? "Fehler beim Login/Registrieren: "
            : state.lang === "es"
            ? "Error durante el login/registro: "
            : "Error during login/register: ";
        alert(msg + (e.message || ""));
        return; // Onboarding'i kapatma, kullanıcı tekrar denesin
      }

      // Backend cevaplarına göre kullanıcıya net mesaj
      if (data.status === "login") {
        const msg =
          state.lang === "tr"
            ? "Giriş başarılı. 👌"
            : state.lang === "ar"
            ? "تم تسجيل الدخول بنجاح. 👌"
            : state.lang === "de"
            ? "Login erfolgreich. 👌"
            : state.lang === "es"
            ? "Inicio de sesión correcto. 👌"
            : "Login successful. 👌";
        alert(msg);
      } else if (data.status === "registered") {
        const msg =
          state.lang === "tr"
            ? "Hesap oluşturuldu ve giriş yapıldı. 🎉"
            : state.lang === "ar"
            ? "تم إنشاء الحساب وتسجيل الدخول. 🎉"
            : state.lang === "de"
            ? "Konto erstellt und eingeloggt. 🎉"
            : state.lang === "es"
            ? "Cuenta creada e iniciada sesión. 🎉"
            : "Account created and logged in. 🎉";
        alert(msg);
      } else {
        const msg =
          state.lang === "tr"
            ? "Beklenmedik bir cevap alındı."
            : state.lang === "ar"
            ? "تم استلام استجابة غير متوقعة."
            : state.lang === "de"
            ? "Unerwartete Antwort vom Server."
            : state.lang === "es"
            ? "Respuesta inesperada del servidor."
            : "Unexpected response from server.";
        alert(msg);
      }

      if (onboardingOverlay) onboardingOverlay.classList.add("hidden");
    });
  }

  if (changeEmailBtn) {
    changeEmailBtn.addEventListener("click", () => {
      if (!onboardingOverlay) return;
      if (onboardStepLang) onboardStepLang.classList.add("hidden");
      if (onboardStepEmail) onboardStepEmail.classList.remove("hidden");
      onboardingOverlay.classList.remove("hidden");
    });
  }

  if (langSelect) {
    langSelect.addEventListener("change", () => {
      const code = langSelect.value;
      if (!LANG_NAMES[code]) return;
      state.lang = code;
      localStorage.setItem(LANG_KEY, code);
      applyUITextForLang(code);
      applySmallUIText(code);
      loadTrends();
    });
  }

  // === PANEL GEÇİŞLERİ + GERİ TUŞU DAVRANIŞI ===

  function showPanel(target, pushState = false) {
    document
      .querySelectorAll("main .panel")
      .forEach((sec) => sec.classList.add("hidden"));
    const active = document.getElementById(`panel-${target}`);
    if (active) active.classList.remove("hidden");
    if (sidebar) sidebar.classList.add("hidden");

    if (pushState && window.history && window.history.pushState) {
      window.history.pushState({ panel: target }, "", "#" + target);
    }
  }

  // Başlangıçta sohbet panelini state'e yaz
  if (window.history && window.history.replaceState) {
    window.history.replaceState({ panel: "chat" }, "", "#chat");
  }

  // Panel butonları (sol menü)
  document.querySelectorAll(".side-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.panel || "chat";
      const push = target !== "chat"; // sohbet dışına geçerken history'e ekle
      showPanel(target, push);
    });
  });

  // PRO ana liste → PRO detay paneller
  document.querySelectorAll(".pro-tool-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.proTarget; // örn: "pro-competitor"
      if (!target) return;
      showPanel(target, true); // panel-pro-competitor
    });
  });

  // PRO detay ekranlarının üstündeki geri butonları
  document.querySelectorAll("[data-pro-back]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const backTarget = btn.dataset.proBack || "pro";
      showPanel(backTarget, true); // tekrar panel-pro
    });
  });

  // Tarayıcı / Android geri tuşu
  window.addEventListener("popstate", (event) => {
    const panel = (event.state && event.state.panel) || "chat";
    showPanel(panel, false);
  });

  // VOICE (Web Speech API)
  let recognition = null;
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRec();
    recognition.lang = LANG_SPEECH[state.lang] || "en-US";
    recognition.interimResults = false;
  }

  if (voiceBtn) {
    voiceBtn.addEventListener("click", () => {
      if (!recognition) {
        const msg =
          state.lang === "tr"
            ? "Bu tarayıcıda ses tanıma desteklenmiyor. (Chrome önerilir)"
            : state.lang === "ar"
            ? "التعرّف على الصوت غير مدعوم في هذا المتصفح. (يُفضّل Chrome)"
            : state.lang === "de"
            ? "Spracherkennung wird in diesem Browser nicht unterstützt. (Chrome empfohlen)"
            : state.lang === "es"
            ? "El reconocimiento de voz no está disponible en este navegador. (Chrome recomendado)"
            : "Speech recognition is not supported in this browser. (Chrome recommended)";
        alert(msg);
        return;
      }
      try {
        recognition.lang = LANG_SPEECH[state.lang] || "en-US";
        recognition.start();
      } catch (e) {
        // ignore "already started" errors
      }
      voiceBtn.disabled = true;
      voiceBtn.textContent = "🎤…";

      recognition.onresult = (ev) => {
        const text = ev.results?.[0]?.[0]?.transcript || "";
        if (messageInput && text) {
          messageInput.value = (messageInput.value + " " + text).trim();
        }
      };
      recognition.onerror = () => {
        const msg =
          state.lang === "tr"
            ? "Ses tanıma sırasında bir hata oldu."
            : state.lang === "ar"
            ? "حدث خطأ أثناء التعرّف على الصوت."
            : state.lang === "de"
            ? "Fehler bei der Spracherkennung."
            : state.lang === "es"
            ? "Error durante el reconocimiento de voz."
            : "Error during speech recognition.";
        alert(msg);
      };
      recognition.onend = () => {
        voiceBtn.disabled = false;
        voiceBtn.textContent = "🎤";
      };
    });
  }

  // CAMERA
  if (cameraBtn && cameraFileInput) {
    cameraBtn.addEventListener("click", () => {
      cameraFileInput.click();
    });
    cameraFileInput.addEventListener("change", () => {
      const file = cameraFileInput.files?.[0];
      if (!file) return;
      const info = `[DOSYA: ${file.name}]`;
      if (messageInput) {
        messageInput.value = messageInput.value
          ? messageInput.value + " " + info
          : info;
      }
    });
  }

  if (refreshTrendsBtn) {
    refreshTrendsBtn.addEventListener("click", () => loadTrends());
  }

  if (seriesGenerate && seriesTopic && seriesResult) {
    seriesGenerate.addEventListener("click", async () => {
      const topic = seriesTopic.value.trim();
      if (!topic) return;
      seriesResult.textContent =
        I18N[state.lang]?.loadingText || "Yükleniyor...";
      const text = await callSimpleAPI("series", {
        topic,
        lang: LANG_NAMES[state.lang] || "Turkish",
      });
      seriesResult.textContent = text;
    });
  }

  if (hookGenerate && hookTopic && hookResult) {
    hookGenerate.addEventListener("click", async () => {
      const topic = hookTopic.value.trim();
      if (!topic) return;
      hookResult.textContent =
        I18N[state.lang]?.loadingText || "Yükleniyor...";
      const text = await callSimpleAPI("hook", {
        topic,
        lang: LANG_NAMES[state.lang] || "Turkish",
      });
      hookResult.textContent = text;
    });
  }

  if (copyGenerate && copyTopic && copyResult) {
    copyGenerate.addEventListener("click", async () => {
      const topic = copyTopic.value.trim();
      if (!topic) return;
      copyResult.textContent =
        I18N[state.lang]?.loadingText || "Yükleniyor...";
      const text = await callSimpleAPI("copy", {
        topic,
        lang: LANG_NAMES[state.lang] || "Turkish",
      });
      copyResult.textContent = text;
    });
  }

  // PRO PANEL BUTTON'LARI – yeni callProAPI kullanıyor
  if (proCompetitorBtn && proCompetitorInput && proCompetitorResult) {
    proCompetitorBtn.addEventListener("click", async () => {
      const value = proCompetitorInput.value.trim();
      if (!value) return;
      proCompetitorResult.textContent =
        I18N[state.lang]?.loadingText || "Yükleniyor...";
      await callProAPI("pro-competitor", value, proCompetitorResult);
    });
  }

  if (proAudienceBtn && proAudienceInput && proAudienceResult) {
    proAudienceBtn.addEventListener("click", async () => {
      const value = proAudienceInput.value.trim();
      if (!value) return;
      proAudienceResult.textContent =
        I18N[state.lang]?.loadingText || "Yükleniyor...";
      await callProAPI("pro-audience", value, proAudienceResult);
    });
  }

  if (proSilentBtn && proSilentInput && proSilentResult) {
    proSilentBtn.addEventListener("click", async () => {
      const value = proSilentInput.value.trim();
      if (!value) return;
      proSilentResult.textContent =
        I18N[state.lang]?.loadingText || "Yükleniyor...";
      await callProAPI("pro-silent", value, proSilentResult);
    });
  }

  // === CHAT SUBMIT (PRO kullanıcılara özel prompt) ===
  if (chatForm && topicInput && platformSelect && messageInput && loadingEl) {
    chatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const t = I18N[state.lang] || I18N.tr;
      const topic = (topicInput.value || "").trim();
      const extra = (messageInput.value || "").trim();
      const platform = platformSelect.value || "tiktok";

      const basePrompt = extra ? `${topic}\n\n${extra}` : topic;
      if (!basePrompt) return;

      const prompt =
        state.plan === "pro"
          ? "[PRO_USER] Kullanıcı PRO planda. Daha detaylı, özgün, ileri seviye kısa video fikirleri üret.\n\n" +
            basePrompt
          : basePrompt;

      if (state.plan === "free" && state.credits <= 0) {
        alert(t.freeNoCreditsAlert);
        return;
      }

      addMessage("user", prompt);
      loadingEl.classList.remove("hidden");

      const reply = await callIdeasAPI(prompt, platform, state.lang);

      addMessage("assistant", reply);
      loadingEl.classList.add("hidden");

      if (state.plan === "free") {
        state.credits = Math.max(0, state.credits - 1);
        saveCredits();
        updatePlanAndCreditsUI();
      }

      topicInput.value = "";
      messageInput.value = "";
    });
  }
});
