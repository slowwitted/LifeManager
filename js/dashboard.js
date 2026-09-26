/* ═══════════════════════════════════════════════════════
   dashboard.js — آنا شریفیان | مدیریت زمان شخصی
   تمام منطق تعاملی + اتصال به utils.js و localStorage
═══════════════════════════════════════════════════════ */
("use strict");

/* ─────────────────────────────────────────
   ثابت‌ها
   (JALALI_MONTHS / JALALI_DAYS_LONG / JALALI_DAYS_SHORT در utils.js
   تعریف شدن که قبل از این فایل لود می‌شه — از همونا استفاده می‌کنیم)
───────────────────────────────────────── */
const QUOTES = [
  "«هر روز یک فرصت تازه است.»",
  "«سلامتی ثروت واقعی است.»",
  "«کوچک شروع کن، بزرگ فکر کن.»",
  "«یک قدم کوچک هر روز، یک جهش بزرگ در سال.»",
  "«مراقب خودت باش، تو مهم‌ترین پروژه‌ی زندگیت هستی.»",
  "«تنها راه انجام کار بزرگ، عشق به چیزی است که انجام می‌دهی.»",
  "«هر شب که می‌خوابی یک فرصت داری: فردا بهتر باشی.»",
];

const CATEGORY_COLORS = {
  مطالعه: "#7c3aed",
  ورزش: "#10b981",
  یوگا: "#0d9488",
  غذا: "#f59e0b",
  دارو: "#3b82f6",
  قرار: "#db2777",
  خانواده: "#ea580c",
  تفریح: "#8b5cf6",
  کار: "#2563eb",
  سایر: "#94a3b8",
};

const FINANCE_COLORS = {
  باشگاه: "#7c3aed",
  یوگا: "#0d9488",
  ورزش: "#10b981",
  دکتر: "#ef4444",
  دارو: "#3b82f6",
  خوراک: "#f59e0b",
  تفریح: "#8b5cf6",
  سایر: "#94a3b8",
};

/* ─────────────────────────────────────────
   وضعیت برنامه (State)
───────────────────────────────────────── */
const State = {
  currentComp: "comp-dashboard-home",
  dailyOffset: 0, // انحراف از امروز (روز)
  dailyCalYear: null, // سال شمسیِ نمای ماهانه‌ی برنامه روزانه
  dailyCalMonth: null,
  taskCalYear: null, // سال شمسیِ تقویم کوچک داخل مودال وظیفه
  taskCalMonth: null,
  calYear: null,
  calMonth: null,
  calSelectedDate: null,
  editingId: null, // آی‌دی رکورد در حال ویرایش
  charts: {}, // نگه‌داری نمونه‌های Chart
  leisureFilter: "",
  reminderFilter: "all",
};

/* ═══════════════════════════════════════════
   شخصی‌سازی: پروفایل، دسته‌بندی‌ها، حریم خصوصی
   (همه چیز فقط روی همین دستگاه — بدون سرور)
═══════════════════════════════════════════ */

/* پیش‌فرض دسته‌بندی وظایف بر اساس شغل/سبک زندگی */
const JOB_LABELS = {
  employee: "👔 کارمند",
  student: "🎓 دانشجو",
  pupil: "🏫 محصل",
  freelancer: "💻 فریلنسر",
  homemaker: "🏠 خانه‌دار",
  athlete: "🏋️ ورزشکار / مربی",
  teacher: "🎓 استاد / معلم",
  doctor: "🩺 پزشک",
  psychologist: "🧠 روان‌شناس",
  salesperson: "🛍️ فروشنده",
  manager: "🧑‍💼 مدیر",
  merchant: "🧾 بازاری / بازرگان",
  lawyer: "⚖️ وکیل",
  judge: "👨‍⚖️ قاضی",
  engineer: "🛠️ مهندس",
  technician: "🔧 فنی‌کار",
  driver: "🚗 راننده",
  retired: "🌿 بازنشسته",
  other: "✨ سایر",
};

const JOB_DEFAULT_CATEGORIES = {
  employee: ["کار", "جلسه", "ایمیل", "ورزش", "قرار", "خانواده", "سایر"],
  student: ["درس", "تکلیف", "کلاس", "مطالعه", "ورزش", "تفریح", "سایر"],
  pupil: ["مدرسه", "تکلیف", "کلاس", "مطالعه", "ورزش", "تفریح", "سایر"],
  freelancer: [
    "پروژه",
    "مشتری",
    "یادگیری",
    "استراحت",
    "ورزش",
    "قرار",
    "سایر",
  ],
  homemaker: ["خانه", "خرید", "بچه‌ها", "آشپزی", "ورزش", "قرار", "سایر"],
  athlete: ["تمرین", "ریکاوری", "تغذیه", "برنامه‌ریزی", "قرار", "سایر"],
  teacher: [
    "تدریس",
    "تصحیح برگه",
    "آماده‌سازی درس",
    "جلسه",
    "ورزش",
    "قرار",
    "سایر",
  ],
  doctor: [
    "ویزیت",
    "عمل / درمان",
    "پرونده بیمار",
    "مطالعه علمی",
    "ورزش",
    "قرار",
    "سایر",
  ],
  psychologist: [
    "جلسه درمان",
    "یادداشت جلسه",
    "مطالعه",
    "سوپرویژن",
    "ورزش",
    "قرار",
    "سایر",
  ],
  salesperson: [
    "پیگیری مشتری",
    "فروش",
    "انبار",
    "گزارش فروش",
    "قرار",
    "سایر",
  ],
  manager: [
    "جلسه",
    "تصمیم‌گیری",
    "پیگیری تیم",
    "گزارش",
    "ورزش",
    "قرار",
    "سایر",
  ],
  merchant: ["خرید", "فروش", "بار", "حساب و کتاب", "قرار", "سایر"],
  lawyer: [
    "پرونده",
    "دادگاه",
    "مشاوره حقوقی",
    "مطالعه لایحه",
    "قرار",
    "سایر",
  ],
  judge: [
    "جلسه دادگاه",
    "بررسی پرونده",
    "صدور رای",
    "مطالعه حقوقی",
    "قرار",
    "سایر",
  ],
  engineer: [
    "پروژه",
    "طراحی",
    "بازدید",
    "گزارش فنی",
    "ورزش",
    "قرار",
    "سایر",
  ],
  driver: ["مسیر/سفر", "بار", "سرویس", "تعمیر خودرو", "قرار", "سایر"],
  technician: ["سرویس/تعمیر", "مشتری", "ابزار و قطعات", "کار", "قرار", "سایر"],
  retired: ["کارهای شخصی", "خرید", "سلامت", "ورزش", "خانواده", "قرار", "سایر"],
  other: ["مطالعه", "ورزش", "یوگا", "غذا", "دارو", "قرار", "کار", "سایر"],
};

/* رنگ ثابت برای هر دسته؛ برای دسته‌های تازه، رنگ به‌صورت خودکار تولید می‌شه */
function getCategoryColor(name) {
  if (CATEGORY_COLORS[name]) return CATEGORY_COLORS[name];
  let hash = 0;
  for (let i = 0; i < String(name).length; i++) {
    hash = String(name).charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 50%)`;
}

/* ─── پروفایل ─── */
function getProfile() {
  return DB.get("profile", null);
}

function saveProfile(profile) {
  DB.set("profile", profile);
}

/** آواتار پیش‌فرض: حرف اول اسم روی زمینه‌ی بنفش — SVG محلی، بدون نیاز به اینترنت */
function defaultAvatarUrl(name) {
  const ch = (String(name || "").trim()[0] || "؟")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;");
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'>` +
    `<rect width='120' height='120' fill='#a78bfa'/>` +
    `<text x='60' y='60' dy='.35em' text-anchor='middle' font-size='56' ` +
    `font-family='sans-serif' fill='#fff'>${ch}</text></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

/* ═══════════════════════════════════════════
   عکس پروفایل — ذخیره در پوشه‌ی avatar (نه localStorage)
   فایل همیشه با اسم ثابت avatar/avatar.png ذخیره و از همون‌جا لود می‌شه.
   ترتیب ذخیره‌سازی:
     ۱) سرور Node همراه پروژه (server.js) → POST /api/avatar
     ۲) File System Access API (کروم/اج): یه بار پوشه‌ی پروژه رو انتخاب می‌کنی
        و اجازه‌ش یادش می‌مونه
     ۳) مرورگرهای بدون این API: فایل دانلود می‌شه تا خودت بذاریش توی پوشه‌ی avatar
═══════════════════════════════════════════ */
const AvatarStore = {
  DIR: "avatar",
  FILE: "avatar.png",
  /* آدرس آنی عکسِ همین نشست (وقتی نوشتن مستقیم توی پوشه ممکن نبود) */
  sessionUrl: null,

  url(version) {
    return `${this.DIR}/${this.FILE}?v=${version || 0}`;
  },

  /** عکس آپلودی رو مربع‌بُر و کوچیک می‌کنه و Blob (PNG) برمی‌گردونه */
  prepare(file, size = 512) {
    return new Promise((resolve, reject) => {
      const src = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const side = Math.min(img.width, img.height);
        const out = Math.min(size, side);
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = out;
        canvas
          .getContext("2d")
          .drawImage(
            img,
            (img.width - side) / 2,
            (img.height - side) / 2,
            side,
            side,
            0,
            0,
            out,
            out,
          );
        URL.revokeObjectURL(src);
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
          "image/png",
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(src);
        reject(new Error("bad image"));
      };
      img.src = src;
    });
  },

  async _viaServer(blob) {
    if (!/^https?:$/.test(location.protocol)) return false;
    try {
      const res = await fetch("api/avatar", {
        method: "POST",
        headers: { "Content-Type": "image/png" },
        body: blob,
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /** پوشه‌ی avatar رو از روی handle ذخیره‌شده (یا با پرسیدن از کاربر) برمی‌گردونه */
  async _dirHandle(interactive) {
    if (typeof window.showDirectoryPicker !== "function") return null;
    let root = null;
    try {
      root = (await window.Utils.mediaGet("handles", "avatarRoot"))?.handle;
    } catch {
      /* IndexedDB نبود → می‌ریم سراغ انتخاب دستی */
    }
    if (root) {
      let perm = await root.queryPermission({ mode: "readwrite" });
      if (perm !== "granted" && interactive) {
        perm = await root.requestPermission({ mode: "readwrite" });
      }
      if (perm !== "granted") root = null;
    }
    if (!root) {
      if (!interactive) return null;
      root = await window.showDirectoryPicker({
        id: "lifemanager-root",
        mode: "readwrite",
      });
      try {
        await window.Utils.mediaPut("handles", { key: "avatarRoot", handle: root });
      } catch {
        /* handle ذخیره نشد؛ دفعه‌ی بعد دوباره می‌پرسه */
      }
    }
    /* اگه خود پوشه‌ی avatar انتخاب شده، همون؛ وگرنه زیرپوشه‌اش رو بساز */
    return root.name === this.DIR
      ? root
      : root.getDirectoryHandle(this.DIR, { create: true });
  },

  /**
   * پاک‌کردن فایل آواتار (برای «پاک‌کردن همه‌ی داده‌ها»). کاملاً best-effort و
   * بی‌صداست: هیچ‌وقت پنجره‌ی اجازه‌ی جدید باز نمی‌کنه (interactive=false) —
   * فقط وقتی از قبل اجازه‌ی نوشتن داشته باشیم فایل واقعاً حذف می‌شه؛
   * وگرنه (حالت دانلود، یا اجازه از دست‌رفته) فقط وضعیت همین نشست پاک می‌شه.
   */
  async clearFile() {
    try {
      const dir = await this._dirHandle(false);
      if (dir) await dir.removeEntry(this.FILE);
    } catch {
      /* فایلی نبود یا اجازه نداشتیم؛ چیز مهمی از دست نرفته */
    }
    if (this.sessionUrl) {
      URL.revokeObjectURL(this.sessionUrl);
      this.sessionUrl = null;
    }
  },

  /**
   * ذخیره‌ی عکس. خروجی: { mode: "server" | "folder" | "download" | "cancelled" | "error" }
   * باید از داخل یه کلیک کاربر صدا زده بشه (برای پنجره‌ی انتخاب پوشه).
   */
  async save(blob) {
    if (await this._viaServer(blob)) return { mode: "server" };
    try {
      const dir = await this._dirHandle(true);
      if (dir) {
        const fh = await dir.getFileHandle(this.FILE, { create: true });
        const w = await fh.createWritable();
        await w.write(blob);
        await w.close();
        return { mode: "folder" };
      }
    } catch (err) {
      if (err?.name === "AbortError") return { mode: "cancelled" };
      console.warn("ذخیره‌ی مستقیم توی پوشه‌ی avatar نشد:", err);
    }
    /* مرورگر پشتیبانی نمی‌کنه (یا خطا داد) → دانلود */
    try {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = this.FILE;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      return { mode: "download" };
    } catch {
      return { mode: "error" };
    }
  },
};

/** آدرسی که برای نمایش عکس پروفایل استفاده می‌شه */
function resolveAvatarSrc(profile, name) {
  if (AvatarStore.sessionUrl) return AvatarStore.sessionUrl;
  if (profile?.hasAvatar) return AvatarStore.url(profile.avatarVersion);
  /* پروفایل‌های قدیمی: عکس هنوز به‌صورت dataURL توی localStorage مونده؛
     تا وقتی به پوشه‌ی avatar منتقل نشده همین نشون داده می‌شه */
  if (profile?.avatar) return profile.avatar;
  return defaultAvatarUrl(name);
}

/** بعد از ذخیره‌ی عکس: پروفایل رو آپدیت و عکس رو توی UI عوض می‌کنه */
function finishAvatarSave(blob, result, { toast = true } = {}) {
  if (!blob || !result) return;
  if (result.mode === "cancelled") {
    if (toast) showToast("عکس ذخیره نشد (انتخاب پوشه لغو شد)", "warning");
    return;
  }
  if (result.mode === "error") {
    if (toast) showToast("ذخیره‌ی عکس با خطا مواجه شد", "error");
    return;
  }
  const profile = getProfile() || {};
  profile.hasAvatar = true;
  profile.avatarVersion = Date.now();
  delete profile.avatar; /* دیگه هیچ عکسی توی localStorage نمی‌مونه */
  saveProfile(profile);
  if (result.mode === "download") {
    if (AvatarStore.sessionUrl) URL.revokeObjectURL(AvatarStore.sessionUrl);
    AvatarStore.sessionUrl = URL.createObjectURL(blob);
    if (toast)
      showToast(
        "مرورگرت اجازه‌ی نوشتن توی پوشه رو نمیده؛ avatar.png دانلود شد — بذارش توی پوشه‌ی avatar کنار dashboard.html",
        "warning",
      );
  } else {
    if (AvatarStore.sessionUrl) URL.revokeObjectURL(AvatarStore.sessionUrl);
    AvatarStore.sessionUrl = null;
    if (toast) showToast("عکس توی پوشه‌ی avatar ذخیره شد 📁");
  }
  applyProfileToUI();
}

/** انتقال عکس قدیمیِ localStorage به پوشه‌ی avatar (بی‌صدا، فقط با سرور Node) */
async function migrateLegacyAvatar() {
  const profile = getProfile();
  if (!profile?.avatar || profile.hasAvatar) return;
  if (!String(profile.avatar).startsWith("data:image/")) return;
  try {
    const blob = await (await fetch(profile.avatar)).blob();
    if (await AvatarStore._viaServer(blob)) {
      finishAvatarSave(blob, { mode: "server" }, { toast: false });
    }
  } catch {
    /* بی‌سروصدا؛ عکس قدیمی همچنان نشون داده می‌شه */
  }
}

/** تغییر سایز عکس آپلودی به یک تصویر کوچیک (برای اینکه localStorage پر نشه) */
function resizeImageFile(file, maxSize = 200) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** نمایش پروفایل در همه‌ی جاهای برنامه */
function applyProfileToUI() {
  const profile = getProfile();
  const name = profile?.name || "کاربر مهمان";
  const appName = profile?.appName || "زندگی‌یار";
  const jobLabel = profile?.job ? JOB_LABELS[profile.job] || "" : "مدیریت زمان شخصی";
  const avatar = resolveAvatarSrc(profile, name);
  const fallbackAvatar = defaultAvatarUrl(name);

  setEl("sidebarProfileName", name);
  setEl("sidebarProfileRole", jobLabel);
  setEl("sidebarBrandName", appName);

  /* اگه فایل توی پوشه‌ی avatar پیدا نشد، آواتار پیش‌فرض نشون بده */
  ["sidebarAvatarImg", "topbarAvatarImg", "settingsAvatar"].forEach((id) => {
    const img = document.getElementById(id);
    if (!img) return;
    img.onerror = () => {
      img.onerror = null;
      img.src = fallbackAvatar;
    };
    if (img.getAttribute("src") !== avatar) img.src = avatar;
  });

  const nameInput = document.getElementById("setProfileName");
  if (nameInput && document.activeElement !== nameInput)
    nameInput.value = profile?.name || "";
  const jobSelect = document.getElementById("setProfileJob");
  if (jobSelect && profile?.job) jobSelect.value = profile.job;
  const appNameInput = document.getElementById("setAppName");
  if (appNameInput && document.activeElement !== appNameInput)
    appNameInput.value = appName;
  const cityInput = document.getElementById("setProfileCity");
  if (cityInput && document.activeElement !== cityInput)
    cityInput.value = profile?.city || "";

  const pageTitle = document.getElementById("pageTitle");
  if (pageTitle) pageTitle.textContent = `${appName} | ${name}`;
  document.title = pageTitle ? pageTitle.textContent : document.title;
}

/* ─── راه‌اندازی اولیه (Onboarding) ─── */
function initOnboarding() {
  const overlay = document.getElementById("onboardingOverlay");
  if (!overlay) return;

  const profile = getProfile();
  if (profile) {
    overlay.classList.add("hidden");
    return;
  }
  overlay.classList.remove("hidden");

  let pendingAvatarBlob = null;
  let pendingPreviewUrl = null;

  const obPreview = document.getElementById("obAvatarPreview");
  if (obPreview) obPreview.src = defaultAvatarUrl("?");

  document.getElementById("obAvatarInput")?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      pendingAvatarBlob = await AvatarStore.prepare(file);
      if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
      pendingPreviewUrl = URL.createObjectURL(pendingAvatarBlob);
      if (obPreview) obPreview.src = pendingPreviewUrl;
    } catch {
      showToast("عکس قابل خوندن نبود", "error");
    }
  });

  document.getElementById("btn-onboarding-save")?.addEventListener("click", async () => {
    const name = document.getElementById("obName")?.value.trim();
    const job = document.getElementById("obJob")?.value || "other";
    const city = document.getElementById("obCity")?.value.trim() || "";
    if (!name) {
      showToast("اسمت رو وارد کن", "error");
      return;
    }
    const newProfile = {
      name,
      job,
      city,
      createdAt: new Date().toISOString(),
    };
    saveProfile(newProfile);

    /* عکس (اگه انتخاب شده) توی پوشه‌ی avatar ذخیره می‌شه؛ شکست خوردنش
       نباید جلوی ادامه‌ی راه‌اندازی رو بگیره */
    if (pendingAvatarBlob) {
      const blob = pendingAvatarBlob;
      const result = await AvatarStore.save(blob);
      finishAvatarSave(blob, result);
    }

    /* فقط اگر دسته‌بندی‌ای قبلاً ذخیره نشده، دسته‌های پیش‌فرض همون شغل رو بذار */
    if (!DB.get("categories_task", null)) {
      DB.set(
        "categories_task",
        JOB_DEFAULT_CATEGORIES[job] || JOB_DEFAULT_CATEGORIES.other,
      );
    }

    overlay.classList.add("hidden");
    applyProfileToUI();
    renderCategoryChips();
    populateTaskCategorySelect();
    renderHiddenSectionsList();
    applyHiddenSections();
    showToast(`خوش اومدی ${name} 🎉`);
    navigateTo(State.currentComp || "comp-dashboard-home");
  });
}

/* ─── دسته‌بندی‌های سفارشی وظایف ─── */
function getTaskCategories() {
  return DB.get("categories_task", JOB_DEFAULT_CATEGORIES.other);
}

function saveTaskCategories(list) {
  DB.set("categories_task", list);
}

function renderCategoryChips() {
  const wrap = document.getElementById("categoryChipsWrap");
  if (!wrap) return;
  const cats = getTaskCategories();
  wrap.innerHTML = cats
    .map(
      (c) => `
      <span class="category-chip" style="border-color:${getCategoryColor(c)}66">
        <span style="color:${getCategoryColor(c)}">●</span> ${c}
        <button class="chip-remove" data-cat="${c}" title="حذف">✕</button>
      </span>
    `,
    )
    .join("");
}

function populateTaskCategorySelect() {
  const select = document.getElementById("taskCategory");
  if (!select) return;
  const current = select.value;
  const cats = getTaskCategories();
  select.innerHTML = cats
    .map((c) => `<option value="${c}">${c}</option>`)
    .join("");
  if (cats.includes(current)) select.value = current;
}

function initCategorySettings() {
  document.getElementById("btn-add-category")?.addEventListener("click", () => {
    const input = document.getElementById("newCategoryInput");
    const val = input?.value.trim();
    if (!val) return;
    const cats = getTaskCategories();
    if (cats.includes(val)) {
      showToast("این دسته از قبل هست", "warning");
      return;
    }
    cats.push(val);
    saveTaskCategories(cats);
    input.value = "";
    renderCategoryChips();
    populateTaskCategorySelect();
    showToast("دسته اضافه شد ✅");
  });

  document.getElementById("categoryChipsWrap")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip-remove");
    if (!btn) return;
    const cat = btn.dataset.cat;
    let cats = getTaskCategories();
    if (cats.length <= 1) {
      showToast("حداقل باید یک دسته بمونه", "warning");
      return;
    }
    cats = cats.filter((c) => c !== cat);
    saveTaskCategories(cats);
    renderCategoryChips();
    populateTaskCategorySelect();
  });
}

/* ─── حریم خصوصی: قفل برنامه با پین ─── */
function getPrivacySettings() {
  return DB.get("privacy", { lockEnabled: false, pinHash: null, hiddenSections: [] });
}

function savePrivacySettings(settings) {
  DB.set("privacy", settings);
}

async function hashPin(pin) {
  const salted = "lm_salt_" + pin;
  /* اولویت با Web Crypto؛ اگه در دسترس نبود (مثلاً باز کردن مستقیم فایل
     در بعضی مرورگرهای قدیمی)، یه هش ساده‌ی محلی جایگزینش می‌شه.
     در هر دو حالت هیچی به سروری فرستاده نمی‌شه. */
  if (window.crypto?.subtle) {
    try {
      const enc = new TextEncoder().encode(salted);
      const buf = await crypto.subtle.digest("SHA-256", enc);
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    } catch {
      /* ادامه به fallback */
    }
  }
  let hash = 0;
  for (let i = 0; i < salted.length; i++) {
    hash = (hash << 5) - hash + salted.charCodeAt(i);
    hash |= 0;
  }
  return "fb" + Math.abs(hash).toString(16);
}

const NAV_SECTIONS = [
  { comp: "comp-daily", label: "برنامه روزانه" },
  { comp: "comp-activities", label: "فعالیت‌ها" },
  { comp: "comp-health", label: "سلامت" },
  { comp: "comp-sport", label: "ورزش و یوگا" },
  { comp: "comp-food", label: "تغذیه" },
  { comp: "comp-medicine", label: "دارو و دکتر" },
  { comp: "comp-reminders", label: "یادآوری‌ها" },
  { comp: "comp-calendar", label: "دفتر زندگی و خاطرات" },
  { comp: "comp-family", label: "خانواده" },
  { comp: "comp-leisure", label: "تفریح" },
  { comp: "comp-finance", label: "هزینه‌ها" },
  { comp: "comp-events", label: "رویدادها و بازخورد" },
];

function renderHiddenSectionsList() {
  const wrap = document.getElementById("hiddenSectionsList");
  if (!wrap) return;
  const privacy = getPrivacySettings();
  wrap.innerHTML = NAV_SECTIONS.map(
    (s) => `
      <label>
        <input type="checkbox" data-hide-comp="${s.comp}" ${
          privacy.hiddenSections.includes(s.comp) ? "checked" : ""
        } />
        <span>${s.label}</span>
      </label>
    `,
  ).join("");
}

function applyHiddenSections() {
  const privacy = getPrivacySettings();
  document.querySelectorAll(".nav-item[data-comp]").forEach((item) => {
    const comp = item.dataset.comp;
    item.style.display = privacy.hiddenSections.includes(comp) ? "none" : "";
  });
  /* اگه صفحه‌ی فعلی مخفی شد، برو خونه */
  if (privacy.hiddenSections.includes(State.currentComp)) {
    navigateTo("comp-dashboard-home");
  }
}

function initPrivacySettings() {
  const lockToggle = document.getElementById("setLockEnabled");
  const pinBox = document.getElementById("pinSetupBox");

  const privacy = getPrivacySettings();
  if (lockToggle) lockToggle.checked = privacy.lockEnabled;
  if (pinBox) pinBox.classList.toggle("hidden", !privacy.lockEnabled || privacy.pinHash);

  lockToggle?.addEventListener("change", () => {
    const p = getPrivacySettings();
    if (lockToggle.checked) {
      pinBox?.classList.remove("hidden");
    } else {
      p.lockEnabled = false;
      p.pinHash = null;
      savePrivacySettings(p);
      pinBox?.classList.add("hidden");
      showToast("قفل برنامه غیرفعال شد");
    }
  });

  document.getElementById("btn-save-pin")?.addEventListener("click", async () => {
    const pin1 = document.getElementById("pinInput1")?.value.trim();
    const pin2 = document.getElementById("pinInput2")?.value.trim();
    if (!pin1 || pin1.length < 4 || pin1.length > 6 || !/^\d+$/.test(pin1)) {
      showToast("رمز باید ۴ تا ۶ رقم باشه", "error");
      return;
    }
    if (pin1 !== pin2) {
      showToast("دو رمز یکی نیستن", "error");
      return;
    }
    const p = getPrivacySettings();
    p.lockEnabled = true;
    p.pinHash = await hashPin(pin1);
    savePrivacySettings(p);
    document.getElementById("pinInput1").value = "";
    document.getElementById("pinInput2").value = "";
    pinBox?.classList.add("hidden");
    showToast("رمز ذخیره شد 🔒");
  });

  document.getElementById("hiddenSectionsList")?.addEventListener("change", (e) => {
    const box = e.target.closest("[data-hide-comp]");
    if (!box) return;
    const p = getPrivacySettings();
    const comp = box.dataset.hideComp;
    if (box.checked) {
      if (!p.hiddenSections.includes(comp)) p.hiddenSections.push(comp);
    } else {
      p.hiddenSections = p.hiddenSections.filter((c) => c !== comp);
    }
    savePrivacySettings(p);
    applyHiddenSections();
  });
}

/* ─── صفحه‌ی قفل ─── */
function checkLockScreen() {
  return new Promise((resolve) => {
    const privacy = getPrivacySettings();
    const overlay = document.getElementById("lockScreen");
    const alreadyUnlocked = sessionStorage.getItem("lm_unlocked") === "1";

    if (!privacy.lockEnabled || !privacy.pinHash || alreadyUnlocked) {
      overlay?.classList.add("hidden");
      resolve();
      return;
    }

    overlay?.classList.remove("hidden");
    const profile = getProfile();
    const greeting = document.getElementById("lockGreeting");
    if (greeting) greeting.textContent = `سلام ${profile?.name || ""} 🔒`;

    const input = document.getElementById("lockPinInput");
    const errorEl = document.getElementById("lockError");

    const tryUnlock = async () => {
      const val = input?.value.trim();
      if (!val) return;
      const hash = await hashPin(val);
      if (hash === privacy.pinHash) {
        sessionStorage.setItem("lm_unlocked", "1");
        overlay?.classList.add("hidden");
        resolve();
      } else {
        if (errorEl) errorEl.textContent = "رمز اشتباهه";
        if (input) {
          input.value = "";
          input.focus();
        }
      }
    };

    document.getElementById("btn-unlock")?.addEventListener("click", tryUnlock);
    input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") tryUnlock();
    });

    document.getElementById("btn-forgot-pin")?.addEventListener("click", async () => {
      const first = await confirmDialog({
        title: "رمز رو فراموش کردی؟",
        message:
          "چون هیچ سروری برای ریست رمز وجود نداره، تنها راه، پاک‌کردن کامل داده‌های این دستگاهه. مطمئنی؟",
        confirmText: "بله، ادامه بده",
        icon: "fa-key",
      });
      if (!first) return;
      const second = await confirmDialog({
        title: "آخرین تأیید",
        message: "این کار همه‌ی داده‌ها رو برای همیشه پاک می‌کنه و برگشتی نداره.",
        confirmText: "پاک کن",
        icon: "fa-triangle-exclamation",
      });
      if (!second) return;
      localStorage.clear();
      sessionStorage.clear();
      await MusicStore.wipe();
      location.reload();
    });
  });
}

/* ─────────────────────────────────────────
   کمک‌کننده‌های عمومی
───────────────────────────────────────── */

/** تاریخ امروز به فرمت YYYY-MM-DD */
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** تاریخ + offset روز به فرمت YYYY-MM-DD (بر اساس تاریخ محلی، نه UTC) */
function dateByOffset(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* نمایش تاریخ شمسی (از utils.js) */
// function toJalali(dateStr) {
//   if (window.Utils?.toJalali) return window.Utils.toJalali(dateStr);
//   return dateStr;
// }
function toJalaliText(gDate) {
  const j = toJalali(gDate);
  return `${j.dayName} - ${j.day} ${j.monthName} ${j.year}`;
}

/** فرمت مبلغ (از utils.js) */
function fmtMoney(n) {
  if (window.Utils?.formatCurrency) return window.Utils.formatCurrency(n);
  return Number(n).toLocaleString("fa") + " تومان";
}

/** تبدیل اعداد لاتین به فارسی */
function toPersianNum(str) {
  return String(str).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
}

/** شناسه یکتا */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/** ساخت toast اعلان */
function showToast(msg, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${
      type === "success"
        ? "fa-circle-check"
        : type === "error"
          ? "fa-circle-xmark"
          : type === "warning"
            ? "fa-triangle-exclamation"
            : "fa-circle-info"
    }"></i>
    <span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/** نمایش / پنهان کردن مودال */
function openModal(id) {
  document.getElementById(id)?.classList.remove("hidden");
}
function closeModal(id) {
  document.getElementById(id)?.classList.add("hidden");
}

/* ═══════════════════════════════════════════
   دیالوگ تأیید — جایگزین confirm() پیش‌فرض مرورگر
   استفاده:
     if (!(await confirmDialog({ title, message, confirmText }))) return;
   یه Promise<boolean> برمی‌گردونه (Esc / کلیک بیرون / انصراف = false)
═══════════════════════════════════════════ */
let _dialogSeq = 0;
function confirmDialog(opts = {}) {
  const o = typeof opts === "string" ? { message: opts } : opts;
  const danger = o.danger !== false;
  const title = o.title || "مطمئنی؟";
  const message = o.message || "";
  const confirmText = o.confirmText || (danger ? "حذف" : "تأیید");
  const cancelText = o.cancelText || "انصراف";
  const icon = o.icon || (danger ? "fa-trash-can" : "fa-circle-question");
  const uid_ = ++_dialogSeq;

  return new Promise((resolve) => {
    const previouslyFocused = document.activeElement;
    const overlay = document.createElement("div");
    overlay.className = "app-dialog-overlay";
    overlay.innerHTML = `
      <div class="app-dialog ${danger ? "danger" : ""}" role="alertdialog"
           aria-modal="true" aria-labelledby="appDlgT${uid_}" aria-describedby="appDlgM${uid_}">
        <div class="app-dialog-icon"><i class="fa-solid ${icon}"></i></div>
        <h3 class="app-dialog-title" id="appDlgT${uid_}"></h3>
        <p class="app-dialog-msg" id="appDlgM${uid_}"></p>
        <div class="app-dialog-actions">
          <button type="button" class="btn-secondary" data-act="cancel"></button>
          <button type="button" class="${danger ? "btn-danger" : "btn-primary"}" data-act="ok"></button>
        </div>
      </div>`;
    /* متن‌ها با textContent — تا هر چی توی پیام بود، به‌عنوان HTML اجرا نشه */
    overlay.querySelector(".app-dialog-title").textContent = title;
    const msgEl = overlay.querySelector(".app-dialog-msg");
    msgEl.textContent = message;
    if (!message) {
      msgEl.remove();
      overlay.querySelector(".app-dialog-title").classList.add("no-msg");
    }
    const cancelBtn = overlay.querySelector('[data-act="cancel"]');
    const okBtn = overlay.querySelector('[data-act="ok"]');
    cancelBtn.textContent = cancelText;
    okBtn.textContent = confirmText;

    let finished = false;
    const finish = (result) => {
      if (finished) return;
      finished = true;
      document.removeEventListener("keydown", onKey, true);
      overlay.classList.add("closing");
      setTimeout(() => overlay.remove(), 160);
      try {
        previouslyFocused?.focus?.();
      } catch {
        /* فوکوس برگشتی مهم نیست */
      }
      resolve(result);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        finish(false);
      } else if (e.key === "Tab") {
        /* فوکوس بین دو دکمه بمونه */
        e.preventDefault();
        (document.activeElement === cancelBtn ? okBtn : cancelBtn).focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    overlay.addEventListener("mousedown", (e) => {
      if (e.target === overlay) finish(false);
    });
    cancelBtn.addEventListener("click", () => finish(false));
    okBtn.addEventListener("click", () => finish(true));

    document.body.appendChild(overlay);
    /* برای کارهای مخرب، فوکوس اولیه روی «انصراف» که Enter اتفاقی چیزی پاک نکنه */
    (danger ? cancelBtn : okBtn).focus();
  });
}

/** پاک‌کردن نمودار قبلی و ساخت جدید */
function makeChart(id, config) {
  if (State.charts[id]) {
    State.charts[id].destroy();
    delete State.charts[id];
  }
  const canvas = document.getElementById(id);
  if (!canvas) return null;
  const chart = new Chart(canvas.getContext("2d"), config);
  State.charts[id] = chart;
  return chart;
}

// *** توابع کمکی برای تقویم شمسی ***

function getJalaliMonthDays(jy, jm) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  const g1 = fromJalali(jy, 12, 1);
  const g30 = fromJalali(jy, 12, 30);
  return g1.getMonth() === g30.getMonth() ? 30 : 29;
}

function getJalaliMonthOffset(jy, jm) {
  const gDate = fromJalali(jy, jm, 1);
  return (gDate.getDay() + 1) % 7; // شنبه = 0
}

// *** پایان توابع کمکی ***

/* ─────────────────────────────────────────
   ذخیره / بارگذاری داده
───────────────────────────────────────── */
const DB = {
  get(key, def = []) {
    if (window.Utils?.loadData) return window.Utils.loadData(key) ?? def;
    try {
      return JSON.parse(localStorage.getItem("ana_dashboard_" + key)) ?? def;
    } catch {
      return def;
    }
  },
  set(key, val) {
    if (window.Utils?.saveData) {
      window.Utils.saveData(key, val);
      return;
    }
    localStorage.setItem("ana_dashboard_" + key, JSON.stringify(val));
  },
  push(key, item, def = []) {
    const arr = this.get(key, def);
    arr.push(item);
    this.set(key, arr);
    return arr;
  },
  remove(key, id) {
    const arr = this.get(key, []).filter((x) => x.id !== id);
    this.set(key, arr);
    return arr;
  },
  update(key, id, changes) {
    const arr = this.get(key, []).map((x) =>
      x.id === id ? { ...x, ...changes } : x,
    );
    this.set(key, arr);
    return arr;
  },
};

/* ═══════════════════════════════════════════
   اعلان‌های مهم (زنگوله‌ی نوار بالا)
   فقط یادآوری‌های سررسیدشده/نشده + وظایف با اولویت «فوری»
═══════════════════════════════════════════ */
function getImportantNotifications() {
  const today = todayISO();
  const readSet = new Set(DB.get("notif_read", []));

  const reminders = DB.get("reminders", [])
    .filter((r) => !r.done && r.date <= today)
    .map((r) => ({
      key: `reminder:${r.id}`,
      title: r.title,
      date: r.date,
      icon: "fa-bell",
      comp: "comp-reminders",
    }));

  const tasks = DB.get("tasks", [])
    .filter((t) => !t.done && t.priority === "urgent" && t.date <= today)
    .map((t) => ({
      key: `task:${t.id}`,
      title: t.title,
      date: t.date,
      icon: "fa-triangle-exclamation",
      comp: "comp-daily",
    }));

  return [...reminders, ...tasks]
    .map((n) => ({ ...n, read: readSet.has(n.key) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function toggleNotifRead(key) {
  const readSet = new Set(DB.get("notif_read", []));
  if (readSet.has(key)) readSet.delete(key);
  else readSet.add(key);
  DB.set("notif_read", [...readSet]);
}

function renderNotifDropdown() {
  const items = getImportantNotifications();
  const countEl = document.getElementById("notifCount");
  const unread = items.filter((n) => !n.read).length;
  if (countEl) {
    countEl.textContent = toPersianNum(unread);
    countEl.style.display = unread ? "grid" : "none";
  }

  const listEl = document.getElementById("notifList");
  if (!listEl) return;
  if (!items.length) {
    listEl.innerHTML =
      '<div class="notif-empty">چیز مهمی برای نشون دادن نیست 🎉</div>';
    return;
  }
  const today = todayISO();
  listEl.innerHTML = items
    .map(
      (n) => `
      <div class="notif-item ${n.read ? "read" : ""}" data-comp="${n.comp}">
        <div class="notif-icon"><i class="fa-solid ${n.icon}"></i></div>
        <div class="notif-body">
          <div class="notif-title">${n.title}</div>
          <div class="notif-sub">${n.date === today ? "امروز" : toJalaliText(n.date)}</div>
        </div>
        <button class="notif-mark-read" data-mark="${n.key}"
          title="${n.read ? "برگردوندن به نشده" : "علامت به‌عنوان خونده‌شده"}">
          <i class="fa-solid ${n.read ? "fa-rotate-left" : "fa-check"}"></i>
        </button>
      </div>`,
    )
    .join("");
}

/* ═══════════════════════════════════════════
   دراپ‌داون‌های نوار بالا + رمز عبور + خروج
═══════════════════════════════════════════ */
function closeTopbarDropdowns() {
  document.getElementById("notifDropdown")?.classList.add("hidden");
  document.getElementById("profileDropdown")?.classList.add("hidden");
}

function initTopbarMenus() {
  document
    .getElementById("sidebarProfileBtn")
    ?.addEventListener("click", () => {
      if (avatarZoomShouldSuppressClick()) return;
      navigateTo("comp-settings");
    });

  document.getElementById("notifBtn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    const dd = document.getElementById("notifDropdown");
    document.getElementById("profileDropdown")?.classList.add("hidden");
    if (!dd) return;
    dd.classList.toggle("hidden");
    if (!dd.classList.contains("hidden")) renderNotifDropdown();
  });

  document.getElementById("notifList")?.addEventListener("click", (e) => {
    const markBtn = e.target.closest("[data-mark]");
    if (markBtn) {
      e.stopPropagation();
      toggleNotifRead(markBtn.dataset.mark);
      renderNotifDropdown();
      return;
    }
    const item = e.target.closest(".notif-item[data-comp]");
    if (item) {
      navigateTo(item.dataset.comp);
      closeTopbarDropdowns();
    }
  });

  document.getElementById("topbarAvatar")?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (avatarZoomShouldSuppressClick()) return;
    const dd = document.getElementById("profileDropdown");
    document.getElementById("notifDropdown")?.classList.add("hidden");
    if (!dd) return;
    const willOpen = dd.classList.contains("hidden");
    dd.classList.toggle("hidden");
    if (willOpen) {
      const hasPin = !!getPrivacySettings().pinHash;
      const label = document.getElementById("ddPasswordLabel");
      if (label) label.textContent = hasPin ? "تغییر رمز عبور" : "تنظیم رمز عبور";
    }
  });

  document.getElementById("ddProfile")?.addEventListener("click", () => {
    closeTopbarDropdowns();
    navigateTo("comp-settings");
  });

  document.getElementById("ddPassword")?.addEventListener("click", () => {
    closeTopbarDropdowns();
    openPasswordModal();
  });

  document.getElementById("ddLogout")?.addEventListener("click", () => {
    closeTopbarDropdowns();
    const privacy = getPrivacySettings();
    if (!privacy.lockEnabled || !privacy.pinHash) {
      showToast("برای خروج، اول باید یه رمز عبور تنظیم کنی", "warning");
      return;
    }
    sessionStorage.removeItem("lm_unlocked");
    location.reload();
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest("#notifDropdown, #notifBtn, #profileDropdown, #topbarAvatar"))
      return;
    closeTopbarDropdowns();
  });

  /* مودال تنظیم/تغییر رمز */
  document
    .getElementById("modalPasswordClose")
    ?.addEventListener("click", () => closeModal("modalPassword"));
  document
    .getElementById("modalPasswordCancel")
    ?.addEventListener("click", () => closeModal("modalPassword"));
  document
    .getElementById("modalPasswordSave")
    ?.addEventListener("click", savePasswordFromModal);
}

function openPasswordModal() {
  const hasPin = !!getPrivacySettings().pinHash;
  setEl("modalPasswordTitle", hasPin ? "تغییر رمز عبور" : "تنظیم رمز عبور");
  document
    .getElementById("pwCurrentGroup")
    ?.style.setProperty("display", hasPin ? "block" : "none");
  setValue("pwCurrent", "");
  setValue("pwNew1", "");
  setValue("pwNew2", "");
  openModal("modalPassword");
}

async function savePasswordFromModal() {
  const privacy = getPrivacySettings();
  const hasPin = !!privacy.pinHash;

  if (hasPin) {
    const current = getValue("pwCurrent").trim();
    const currentHash = await hashPin(current);
    if (!current || currentHash !== privacy.pinHash) {
      showToast("رمز فعلی درست نیست", "error");
      return;
    }
  }

  const p1 = getValue("pwNew1").trim();
  const p2 = getValue("pwNew2").trim();
  if (!p1 || p1.length < 4 || p1.length > 6 || !/^\d+$/.test(p1)) {
    showToast("رمز باید ۴ تا ۶ رقم باشه", "error");
    return;
  }
  if (p1 !== p2) {
    showToast("دو رمز یکی نیستن", "error");
    return;
  }

  privacy.lockEnabled = true;
  privacy.pinHash = await hashPin(p1);
  savePrivacySettings(privacy);
  closeModal("modalPassword");
  showToast(hasPin ? "رمز عوض شد 🔒" : "رمز تنظیم شد 🔒");

  /* اگه صفحه‌ی تنظیمات بازه، سوییچ و باکس پین رو هم هماهنگ کن */
  const lockToggle = document.getElementById("setLockEnabled");
  if (lockToggle) lockToggle.checked = true;
  document.getElementById("pinSetupBox")?.classList.add("hidden");
}

/* ═══════════════════════════════════════════
   ۱. SIDEBAR & NAVIGATION
═══════════════════════════════════════════ */
function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("sidebarToggle");
  const mobileBtn = document.getElementById("mobileMenuBtn");

  /* ظاهر آیکن رو CSS از روی کلاس is-collapsed عوض می‌کنه. قبلاً اینجا
     کلاس تگ <i> عوض می‌شد، ولی فونت‌اوسام (js/all.min.js) اون <i> رو به
     <svg> تبدیل می‌کنه؛ پس querySelector("i") همیشه null بود و آیکن
     هیچ‌وقت عوض نمی‌شد. */
  const applyToggleIcon = () => {
    if (!toggle) return;
    const collapsed = sidebar.classList.contains("collapsed");
    const label = collapsed ? "باز کردن منو" : "جمع کردن منو";
    toggle.classList.toggle("is-collapsed", collapsed);
    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.setAttribute("aria-label", label);
    toggle.title = label;
  };

  /* تاگل سایدبار */
  toggle?.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    localStorage.setItem(
      "sidebar_collapsed",
      sidebar.classList.contains("collapsed") ? "1" : "0",
    );
    applyToggleIcon();
  });

  /* منوی موبایل */
  mobileBtn?.addEventListener("click", () => {
    sidebar.classList.toggle("mobile-open");
  });

  /* بازگرداندن حالت ذخیره‌شده */
  if (localStorage.getItem("sidebar_collapsed") === "1")
    sidebar.classList.add("collapsed");
  applyToggleIcon();

  /* ناوبری آیتم‌های منو */
  document.querySelectorAll(".nav-item[data-comp]").forEach((item) => {
    item.addEventListener("click", () => {
      const comp = item.dataset.comp;
      navigateTo(comp);
      /* بستن منو در موبایل */
      sidebar.classList.remove("mobile-open");
    });
  });

  /* دکمه‌های اکسپورت / ایمپورت در سایدبار */
  document.getElementById("btn-export")?.addEventListener("click", exportData);
  document.getElementById("btn-import-wrap")?.addEventListener("click", () => {
    document.getElementById("btn-import")?.click();
  });
  document
    .getElementById("btn-import")
    ?.addEventListener("change", (e) => importData(e));
}

function navigateTo(compId) {
  /* پنهان کردن همه */
  document
    .querySelectorAll(".comp-page")
    .forEach((p) => p.classList.remove("active"));
  /* نمایش کامپوننت انتخابی */
  const target = document.getElementById(compId);
  if (!target) return;
  target.classList.add("active");
  State.currentComp = compId;

  /* آپدیت منو */
  document
    .querySelectorAll(".nav-item[data-comp]")
    .forEach((i) => i.classList.toggle("active", i.dataset.comp === compId));

  /* آپدیت عنوان topbar */
  const activeItem = document.querySelector(
    `.nav-item[data-comp="${compId}"] span`,
  );
  const title = activeItem?.textContent || "داشبورد";
  const topbarTitle = document.getElementById("topbarTitle");
  if (topbarTitle) topbarTitle.textContent = title;

  /* رندر محتوای کامپوننت */
  renderComp(compId);
}

function renderComp(compId) {
  switch (compId) {
    case "comp-dashboard-home":
      renderHome();
      break;
    case "comp-daily":
      renderDaily();
      break;
    case "comp-activities":
      renderActivities();
      break;
    case "comp-health":
      renderHealth();
      break;
    case "comp-sport":
      renderSport();
      break;
    case "comp-food":
      renderFood();
      break;
    case "comp-medicine":
      renderMedicine();
      break;
    case "comp-reminders":
      renderReminders();
      break;
    case "comp-calendar":
      renderCalendar();
      checkCalendarLock();
      break;
    case "comp-family":
      renderFamily();
      break;
    case "comp-leisure":
      renderLeisure();
      break;
    case "comp-finance":
      renderFinance();
      break;
    case "comp-events":
      renderEvents();
      break;
    case "comp-gallery":
      renderGallery();
      break;
    case "comp-documents":
      renderDocuments();
      break;
  }
}

/* ═══════════════════════════════════════════
   ۲. ساعت و تاریخ (Topbar + Sidebar)
═══════════════════════════════════════════ */
/* ═══════════════════════════════════════════
   بزرگ‌نمایی عکس پروفایل — نگه‌داشتن ماوس/لمس روی آواتار به مدت ۳ ثانیه
═══════════════════════════════════════════ */
const AVATAR_ZOOM_HOLD_MS = 3000;
let avatarZoomTimer = null;
let avatarZoomSuppressClickUntil = 0;

function openAvatarZoom(src) {
  const overlay = document.getElementById("avatarZoomOverlay");
  const img = document.getElementById("avatarZoomImg");
  if (!overlay || !img) return;
  img.src = src;
  overlay.classList.remove("hidden");
  /* تا نیم‌ثانیه بعد از بستن، کلیک روی خودِ آواتار نادیده گرفته بشه تا
     باز شدن ناخواسته‌ی تنظیمات/منو بلافاصله بعد از یه نگه‌داشتن طولانی رخ نده */
  avatarZoomSuppressClickUntil = Date.now() + 500;
}

function closeAvatarZoom() {
  document.getElementById("avatarZoomOverlay")?.classList.add("hidden");
  avatarZoomSuppressClickUntil = Date.now() + 500;
}

function cancelAvatarZoomHold() {
  if (avatarZoomTimer) {
    clearTimeout(avatarZoomTimer);
    avatarZoomTimer = null;
  }
}

function startAvatarZoomHold(img) {
  cancelAvatarZoomHold();
  avatarZoomTimer = setTimeout(() => {
    avatarZoomTimer = null;
    if (img.src) openAvatarZoom(img.src);
  }, AVATAR_ZOOM_HOLD_MS);
}

function initAvatarZoomPreview() {
  document.querySelectorAll(".zoomable-avatar").forEach((img) => {
    img.addEventListener("mouseenter", () => startAvatarZoomHold(img));
    img.addEventListener("mouseleave", cancelAvatarZoomHold);
    img.addEventListener(
      "touchstart",
      () => startAvatarZoomHold(img),
      { passive: true },
    );
    ["touchend", "touchmove", "touchcancel"].forEach((ev) =>
      img.addEventListener(ev, cancelAvatarZoomHold, { passive: true }),
    );
    /* اگه در حین نگه‌داشتن، خود کلیک (mouseup) هم زده بشه و مودال باز نشده
       باشه، مشکلی نیست — همون رفتار عادی (رفتن به تنظیمات) اجرا می‌شه */
  });

  document.getElementById("avatarZoomOverlay")?.addEventListener("click", closeAvatarZoom);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAvatarZoom();
  });
}

/* برای جلوگیری از بازشدن ناخواسته‌ی تنظیمات/منوی پروفایل بلافاصله بعد از
   یه نگه‌داشتن طولانی روی آواتار */
function avatarZoomShouldSuppressClick() {
  return Date.now() < avatarZoomSuppressClickUntil;
}

function initClock() {
  const clockEl = document.getElementById("sidebar-clock");
  const dateEl = document.getElementById("sidebar-date");

  function tick() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    if (clockEl) clockEl.textContent = `${hh}:${mm}:${ss}`;

    /* تاریخ شمسی همراه با نام روز هفته، مثل «جمعه - ۳ مهر ۱۴۰۵» */
    if (dateEl) dateEl.textContent = toJalaliText(todayISO());
  }
  tick();
  setInterval(tick, 1000);
}

/* ═══════════════════════════════════════════
   ۳. صفحه اصلی (Home)
═══════════════════════════════════════════ */
/* بازه‌ی فعلیِ نمودار «فعالیت‌های هفته/ماه جاری» — تا با رفتن به صفحه‌ی
   دیگه و برگشتن به خانه، هم چارت هم عنوانش با هم هماهنگ بمونن */
let homeChartRange = "week";

function setHomeChartRange(range) {
  homeChartRange = range === "month" ? "month" : "week";
  renderWeeklyChart(homeChartRange);
  setEl(
    "chartWeeklyTitle",
    homeChartRange === "month" ? "فعالیت‌های ماه جاری" : "فعالیت‌های هفته جاری",
  );
  document.getElementById("chartWeeklyTabs")
    ?.querySelectorAll(".chart-tab")
    .forEach((b) => b.classList.toggle("active", (b.dataset.range || "week") === homeChartRange));
}

function renderHome() {
  const steps = [
    renderWelcome,
    renderHomeStats,
    () => setHomeChartRange(homeChartRange),
    renderDonutChart,
    renderHomeReminders,
    renderHomeActivity,
    renderHomeFinance,
    refreshWeatherCard,
    refreshRatesCard,
  ];
  steps.forEach((fn) => {
    try {
      fn();
    } catch (err) {
      /* یه ویجت خراب نباید بقیه‌ی صفحه‌ی خونه رو هم خالی بذاره */
      console.error(`خطا توی ${fn.name}:`, err);
    }
  });
}

/* ─── خوش‌آمد ─── */
function renderWelcome() {
  const now = new Date();
  const hour = now.getHours();
  const name = getProfile()?.name || "";
  const namePart = name ? ` ${name}` : "";
  const greeting =
    hour < 5
      ? `شب بخیر${namePart} 🌙`
      : hour < 12
        ? `صبح بخیر${namePart} ☀️`
        : hour < 17
          ? `عصر بخیر${namePart} 🌤️`
          : hour < 21
            ? `عصر بخیر${namePart} 🌅`
            : `شب بخیر${namePart} 🌙`;

  const msgEl = document.getElementById("welcomeMsg");
  const dateEl = document.getElementById("welcomeDate");
  const qEl = document.getElementById("dailyQuote");

  if (msgEl) msgEl.textContent = greeting;
  if (dateEl) dateEl.textContent = toJalaliText(todayISO());
  if (qEl) qEl.textContent = QUOTES[now.getDay() % QUOTES.length];
}

/* ─── کارت‌های آماری ─── */
function renderHomeStats() {
  const today = todayISO();

  /* وظایف */
  const tasks = DB.get("tasks", []).filter((t) => t.date === today);
  const done = tasks.filter((t) => t.done).length;
  setEl("stat-tasks-done", toPersianNum(done));
  setEl("stat-tasks-total", toPersianNum(tasks.length));

  /* ورزش */
  const sports = DB.get("sport", []).filter((s) => s.date === today);
  const totalMins = sports.reduce((a, s) => a + calcMins(s.start, s.end), 0);
  setEl("stat-exercise", toPersianNum(totalMins) + " دقیقه");
  setEl(
    "stat-exercise-type",
    sports.length ? sports.map((s) => s.type).join("، ") : "—",
  );

  /* آب */
  const water = DB.get("water_" + today, []);
  setEl("stat-water", toPersianNum(water.length));

  /* هزینه هفته */
  const weekAgo = dateByOffset(-7);
  const expenses = DB.get("finance", []).filter(
    (f) => f.date >= weekAgo && f.date <= today,
  );
  const total = expenses.reduce((a, f) => a + (Number(f.amount) || 0), 0);
  setEl("stat-expense", toPersianNum(total.toLocaleString()));

  /* دارو */
  const meds = DB.get("medicine", []).filter((m) => m.active);
  const medsDone = DB.get("meds_taken_" + today, []);
  setEl(
    "stat-medicine",
    toPersianNum(medsDone.length) + " / " + toPersianNum(meds.length),
  );

  /* خواب */
  const sleepRec = DB.get("sleep", []).find((s) => s.date === today);
  if (sleepRec) {
    const hrs = calcHours(sleepRec.start, sleepRec.end);
    setEl("stat-sleep", toPersianNum(hrs) + " ساعت");
  } else {
    setEl("stat-sleep", "—");
  }

  /* خانواده — رویدادهای همین ماه شمسی */
  const jNow = toJalali(today);
  const familyThisMonth = DB.get("family", []).filter((f) => {
    const j = toJalali(f.date);
    return j.year === jNow.year && j.month === jNow.month;
  });
  setEl("stat-family", toPersianNum(familyThisMonth.length));
  const nearestFamily = familyThisMonth
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .find((f) => f.date >= today);
  setEl(
    "stat-family-next",
    nearestFamily
      ? `${nearestFamily.title} — ${toJalaliText(nearestFamily.date).split(" - ")[1]}`
      : familyThisMonth.length
        ? "این ماه ثبت شده"
        : "—",
  );
}

/** فرمت خودکار مبلغ با کاما هنگام تایپ (تومان ممیز شناور نداره) */
function attachAmountFormatting(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("input", () => {
    const fromEnd = el.value.length - (el.selectionStart ?? el.value.length);
    const raw = el.value.replace(/[^\d]/g, "");
    el.value = raw ? Number(raw).toLocaleString("en-US") : "";
    const pos = Math.max(0, el.value.length - fromEnd);
    try {
      el.setSelectionRange(pos, pos);
    } catch {
      /* بعضی مرورگرها/شرایط اجازه نمی‌دن، اشکالی نداره */
    }
  });
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function calcMins(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = eh * 60 + em - (sh * 60 + sm);
  return diff > 0 ? diff : 0;
}

function calcHours(start, end) {
  return (calcMins(start, end) / 60).toFixed(1);
}

/* ─── نمودار هفتگی/ماهانه ─── */
function renderWeeklyChart(range = "week") {
  const labels = [];
  const taskData = [];
  const sportData = [];
  const finData = [];

  const dayCount = range === "month" ? 30 : 7;

  for (let i = dayCount - 1; i >= 0; i--) {
    const iso = dateByOffset(-i);
    const d = new Date(iso + "T00:00:00");

    if (range === "month") {
      labels.push(toPersianNum(d.getDate()));
    } else {
      const dayIdx = (d.getDay() + 1) % 7; // شنبه=0
      labels.push(JALALI_DAYS_LONG[dayIdx]);
    }

    taskData.push(
      DB.get("tasks", []).filter((t) => t.date === iso).length,
    );
    sportData.push(
      DB.get("sport", [])
        .filter((s) => s.date === iso)
        .reduce((a, s) => a + calcMins(s.start, s.end), 0),
    );
    finData.push(
      DB.get("finance", [])
        .filter((f) => f.date === iso)
        .reduce((a, f) => a + (Number(f.amount) || 0), 0) / 1000,
    );
  }

  /* Chart.js همیشه چپ‌به‌راست رسم می‌کنه؛ برعکسشون می‌کنیم تا امروز
     سمت چپ و روزهای قدیمی‌تر سمت راست بیفتن (خوانش راست‌به‌چپ) */
  labels.reverse();
  taskData.reverse();
  sportData.reverse();
  finData.reverse();

  makeChart("chartWeekly", {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "وظایف ثبت‌شده",
          data: taskData,
          backgroundColor: "rgba(124,58,237,.7)",
          borderRadius: 6,
          yAxisID: "y",
        },
        {
          label: "مدت ورزش (دقیقه)",
          data: sportData,
          backgroundColor: "rgba(16,185,129,.7)",
          borderRadius: 6,
          yAxisID: "y",
        },
        {
          label: "هزینه (هزار تومان)",
          data: finData,
          type: "line",
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245,158,11,.15)",
          tension: 0.4,
          fill: true,
          yAxisID: "y1",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: { font: { family: "Vazirmatn" }, boxWidth: 12 },
        },
      },
      scales: {
        y: {
          type: "linear",
          position: "right",
          beginAtZero: true,
          grid: { color: "#f1f5f9" },
          ticks: { font: { family: "Vazirmatn" } },
        },
        y1: {
          type: "linear",
          beginAtZero: true,
          position: "left",
          grid: { display: false },
          ticks: { font: { family: "Vazirmatn" } },
        },
        x: {
          grid: { display: false },
          ticks: {
            font: { family: "Vazirmatn" },
            maxRotation: 0,
            autoSkip: true,
            autoSkipPadding: 8,
          },
        },
      },
    },
  });
}

/* ─── نمودار دایره‌ای ─── */
function renderDonutChart() {
  const today = todayISO();
  const weekAgo = dateByOffset(-7);
  const tasks = DB.get("tasks", []).filter(
    (t) => t.date >= weekAgo && t.date <= today,
  );

  const counts = {};
  tasks.forEach((t) => {
    counts[t.category] = (counts[t.category] || 0) + 1;
  });

  const labels = Object.keys(counts);
  const data = Object.values(counts);
  const colors = labels.map((l) => getCategoryColor(l));

  if (!labels.length) {
    labels.push("بدون داده");
    data.push(1);
    colors.push("#e2e8f0");
  }

  makeChart("chartDonut", {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        { data, backgroundColor: colors, borderWidth: 2, borderColor: "#fff" },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${ctx.parsed}`,
          },
        },
      },
    },
  });

  /* legend دستی */
  const legendEl = document.getElementById("donutLegend");
  if (legendEl) {
    legendEl.innerHTML = labels
      .map(
        (l, i) =>
          `<div class="legend-item">
        <span class="legend-dot" style="background:${colors[i]}"></span>
        <span>${l}</span>
      </div>`,
      )
      .join("");
  }
}

/* ─── ویجت‌های پایین ─── */
function renderHomeReminders() {
  const today = todayISO();
  const list = DB.get("reminders", [])
    .filter((r) => !r.done)
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
    .slice(0, 3);
  const el = document.getElementById("homeReminderList");
  if (!el) return;
  if (!list.length) {
    el.innerHTML = '<li class="empty-state">یادآوری‌ای ثبت نشده</li>';
    return;
  }
  el.innerHTML = list
    .map(
      (r) =>
        `<li>
      <i class="fa-regular fa-bell" style="color:var(--color-warning)"></i>
      <span>${r.title}</span>
      <span style="margin-right:auto;font-size:.75rem;color:var(--text-secondary)">${r.date === today ? "امروز" : toJalaliText(r.date).split(" - ")[1]}</span>
    </li>`,
    )
    .join("");
}

function renderHomeActivity() {
  /* آخرین ۳ فعالیت ثبت‌شده (از همه منابع) */
  const items = [
    ...DB.get("tasks", []).map((t) => ({
      ...t,
      _type: "task",
      _time: t.updatedAt || t.date,
    })),
    ...DB.get("sport", []).map((s) => ({
      ...s,
      _type: "sport",
      _time: s.date,
    })),
    ...DB.get("finance", []).map((f) => ({
      ...f,
      _type: "finance",
      _time: f.date,
    })),
  ]
    .sort((a, b) => (b._time || "").localeCompare(a._time || ""))
    .slice(0, 3);

  const el = document.getElementById("homeActivityFeed");
  if (!el) return;
  if (!items.length) {
    el.innerHTML = '<li class="empty-state">فعالیتی ثبت نشده</li>';
    return;
  }
  el.innerHTML = items
    .map((item) => {
      const icon =
        item._type === "task"
          ? "fa-list-check"
          : item._type === "sport"
            ? "fa-dumbbell"
            : "fa-wallet";
      const color =
        item._type === "task"
          ? "var(--color-purple)"
          : item._type === "sport"
            ? "var(--color-success)"
            : "var(--color-warning)";
      const label =
        item._type === "task"
          ? item.title
          : item._type === "sport"
            ? item.type
            : item.title;
      return `<li>
      <i class="fa-solid ${icon}" style="color:${color}"></i>
      <span>${label}</span>
      <span style="margin-right:auto;font-size:.75rem;color:var(--text-secondary)">
        ${toJalaliText(item._time)}
      </span>
    </li>`;
    })
    .join("");
}

function renderHomeFinance() {
  const list = DB.get("finance", []).slice(-5).reverse();
  const el = document.getElementById("homeFinanceList");
  if (!el) return;
  if (!list.length) {
    el.innerHTML = '<li class="empty-state">هزینه‌ای ثبت نشده</li>';
    return;
  }
  el.innerHTML = list
    .map(
      (f) =>
        `<li>
      <i class="fa-solid fa-receipt" style="color:var(--color-orange)"></i>
      <span>${f.title}</span>
      <span style="margin-right:auto;font-weight:600;font-size:.8rem">
        ${Number(f.amount).toLocaleString()}
      </span>
    </li>`,
    )
    .join("");
}

/* ─── دکمه‌های chart-tab و btn-sm در home ─── */
function initHomeEvents() {
  /* تب هفتگی/ماهانه — فقط دکمه‌های خودِ این کارت (نه چارت‌تب‌های صفحات دیگه) */
  document.getElementById("chartWeeklyTabs")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".chart-tab");
    if (!btn) return;
    setHomeChartRange(btn.dataset.range || "week");
  });

  /* دکمه‌های "همه" در ویجت‌ها */
  document.querySelectorAll("[data-comp]").forEach((btn) => {
    if (btn.classList.contains("nav-item")) return;
    btn.addEventListener("click", () => navigateTo(btn.dataset.comp));
  });
}

/* ═══════════════════════════════════════════
   ۴. برنامه روزانه
═══════════════════════════════════════════ */
function initDaily() {
  document
    .getElementById("btn-add-task")
    ?.addEventListener("click", () => openTaskModal());
  document
    .getElementById("modalTaskClose")
    ?.addEventListener("click", () => closeModal("modalTask"));
  document
    .getElementById("modalTaskCancel")
    ?.addEventListener("click", () => closeModal("modalTask"));
  document.getElementById("modalTaskSave")?.addEventListener("click", saveTask);
  document.getElementById("dailyPrev")?.addEventListener("click", () => {
    State.dailyOffset--;
    renderDaily();
  });
  document.getElementById("dailyNext")?.addEventListener("click", () => {
    State.dailyOffset++;
    renderDaily();
  });
  document.getElementById("dailyToday")?.addEventListener("click", () => {
    State.dailyOffset = 0;
    renderDaily();
  });

  initDailyCalendarPanel();
  initTaskDatePicker();
}

/* ─── شبکه‌ی روزهای ماه — مشترک بین نمای ماهانه‌ی برنامه‌ی روزانه
   و تقویم کوچکِ انتخاب تاریخ داخل مودال وظیفه.
   مستقل از صفحه‌ی «تقویم» تا وقتی اون صفحه با نسخه‌ی جدید عوض بشه. */
function buildMonthGridHTML(jy, jm, selectedISO, tasksByDate, opts = {}) {
  const big = !!opts.big;
  const daysInMonth = getJalaliMonthDays(jy, jm);
  const offset = getJalaliMonthOffset(jy, jm);
  const todayGreg = todayISO();

  let html = "";
  for (let i = 0; i < offset; i++) {
    html += `<div class="cal-day empty"></div>`;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const gISO = fromJalali(jy, jm, d).toISOString().slice(0, 10);
    const isToday = gISO === todayGreg;
    const isSel = gISO === selectedISO;
    const isFriday = (offset + d - 1) % 7 === 6;
    const dayTasks = tasksByDate.get(gISO) || [];

    if (!big) {
      html += `
        <div class="cal-day ${isToday ? "today" : ""} ${isSel ? "selected" : ""} ${isFriday ? "friday" : ""}"
             data-date="${gISO}">
          <span>${toPersianNum(d)}</span>
          <div class="cal-dots">${dayTasks.length ? '<span class="cal-dot purple"></span>' : ""}</div>
        </div>`;
      continue;
    }

    const maxShown = 2;
    const chips = dayTasks
      .slice(0, maxShown)
      .map(
        (t) =>
          `<span class="mmc-chip" style="background:${getCategoryColor(t.category)}20;color:${getCategoryColor(t.category)}">${t.icon ? `<i class="fa-solid ${t.icon}"></i> ` : ""}${t.title}</span>`,
      )
      .join("");
    const more =
      dayTasks.length > maxShown
        ? `<span class="mmc-more">+${toPersianNum(dayTasks.length - maxShown)} مورد دیگه</span>`
        : "";

    html += `
      <div class="cal-day big ${isToday ? "today" : ""} ${isSel ? "selected" : ""} ${isFriday ? "friday" : ""}"
           data-date="${gISO}">
        <div class="mmc-day-top">
          <span class="mmc-day-num-wrap">
            <span class="mmc-day-num">${toPersianNum(d)}</span>
            ${dayTasks.length ? '<span class="mmc-has-dot" title="این روز برنامه داره"></span>' : ""}
          </span>
          <button class="mmc-add-btn" data-add-date="${gISO}" title="افزودن وظیفه برای این روز">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
        <div class="mmc-day-events">${chips}${more}</div>
      </div>`;
  }
  return html;
}

/* ─── نمای ماهانه‌ی صفحه‌ی «برنامه روزانه» ─── */
function initDailyCalendarPanel() {
  const t = toJalali(new Date());
  State.dailyCalYear = t.year;
  State.dailyCalMonth = t.month;

  document.getElementById("dailyCalPrev")?.addEventListener("click", () => {
    State.dailyCalMonth--;
    if (State.dailyCalMonth < 1) {
      State.dailyCalMonth = 12;
      State.dailyCalYear--;
    }
    renderDailyCalPanel();
  });

  document.getElementById("dailyCalNext")?.addEventListener("click", () => {
    State.dailyCalMonth++;
    if (State.dailyCalMonth > 12) {
      State.dailyCalMonth = 1;
      State.dailyCalYear++;
    }
    renderDailyCalPanel();
  });

  document.getElementById("dailyCalDays")?.addEventListener("click", (e) => {
    /* دکمه‌ی + روی هر روز: مستقیم برو سراغ افزودن وظیفه برای همون روز */
    const addBtn = e.target.closest(".mmc-add-btn[data-add-date]");
    if (addBtn) {
      e.stopPropagation();
      const iso = addBtn.dataset.addDate;
      State.dailyOffset = Math.round(
        (new Date(iso) - new Date(todayISO())) / 86400000,
      );
      renderDaily();
      openTaskModal();
      return;
    }
    /* کلیک روی خود روز: فقط انتخابش کن و برنامه‌ی همون روز رو پایین نشون بده */
    const cell = e.target.closest(".cal-day[data-date]");
    if (!cell) return;
    const iso = cell.dataset.date;
    const diffDays = Math.round(
      (new Date(iso) - new Date(todayISO())) / 86400000,
    );
    State.dailyOffset = diffDays;
    renderDaily();
  });
}

function renderDailyCalPanel() {
  const jy = State.dailyCalYear;
  const jm = State.dailyCalMonth;
  const labelEl = document.getElementById("dailyCalLabel");
  if (labelEl) labelEl.textContent = `${JALALI_MONTHS[jm - 1]} ${toPersianNum(jy)}`;

  const tasksByDate = new Map();
  DB.get("tasks", []).forEach((t) => {
    if (!tasksByDate.has(t.date)) tasksByDate.set(t.date, []);
    tasksByDate.get(t.date).push(t);
  });

  const selectedISO = dateByOffset(State.dailyOffset);
  const daysEl = document.getElementById("dailyCalDays");
  if (daysEl)
    daysEl.innerHTML = buildMonthGridHTML(jy, jm, selectedISO, tasksByDate, {
      big: true,
    });
}

/* ─── تقویم کوچکِ انتخاب تاریخ داخل مودال وظیفه ─── */
function initTaskDatePicker() {
  document.getElementById("taskDateToggle")?.addEventListener("click", (e) => {
    e.stopPropagation();
    const panel = document.getElementById("taskDateCalPanel");
    if (!panel) return;
    panel.classList.toggle("hidden");
    if (!panel.classList.contains("hidden")) renderTaskDateCal();
  });

  document
    .getElementById("taskDateCalPrev")
    ?.addEventListener("click", (e) => {
      e.stopPropagation();
      State.taskCalMonth--;
      if (State.taskCalMonth < 1) {
        State.taskCalMonth = 12;
        State.taskCalYear--;
      }
      renderTaskDateCal();
    });

  document
    .getElementById("taskDateCalNext")
    ?.addEventListener("click", (e) => {
      e.stopPropagation();
      State.taskCalMonth++;
      if (State.taskCalMonth > 12) {
        State.taskCalMonth = 1;
        State.taskCalYear++;
      }
      renderTaskDateCal();
    });

  document.getElementById("taskDateCalDays")?.addEventListener("click", (e) => {
    const cell = e.target.closest(".cal-day[data-date]");
    if (!cell) return;
    setTaskDate(cell.dataset.date);
    document.getElementById("taskDateCalPanel")?.classList.add("hidden");
  });

  /* با کلیک بیرون از تقویم کوچک، بسته بشه */
  document.addEventListener("click", (e) => {
    const panel = document.getElementById("taskDateCalPanel");
    const toggle = document.getElementById("taskDateToggle");
    if (!panel || panel.classList.contains("hidden")) return;
    if (panel.contains(e.target) || e.target === toggle) return;
    panel.classList.add("hidden");
  });
}

function setTaskDate(iso) {
  setValue("taskDate", iso);
  const displayEl = document.getElementById("taskDateDisplay");
  if (displayEl) displayEl.value = toJalaliText(iso);
  const j = toJalali(iso);
  State.taskCalYear = j.year;
  State.taskCalMonth = j.month;
  renderTaskDateCal();
}

/* ═══════════════════════════════════════════
   تقویم کوچیکِ عمومیِ قابل‌استفاده برای هر فیلد تاریخ
   (به‌جای ساختن یه popover جدا برای هر مودال)
═══════════════════════════════════════════ */
const GenericDatePickers = {};

function initGenericDatePicker(cfg) {
  GenericDatePickers[cfg.hiddenId] = { y: null, m: null };

  document.getElementById(cfg.toggleId)?.addEventListener("click", (e) => {
    e.stopPropagation();
    const panel = document.getElementById(cfg.panelId);
    if (!panel) return;
    document
      .querySelectorAll(".mmc-panel.compact")
      .forEach((p) => p !== panel && p.classList.add("hidden"));
    panel.classList.toggle("hidden");
    if (!panel.classList.contains("hidden")) renderGenericCal(cfg);
  });

  document.getElementById(cfg.prevId)?.addEventListener("click", (e) => {
    e.stopPropagation();
    const st = GenericDatePickers[cfg.hiddenId];
    st.m--;
    if (st.m < 1) {
      st.m = 12;
      st.y--;
    }
    renderGenericCal(cfg);
  });

  document.getElementById(cfg.nextId)?.addEventListener("click", (e) => {
    e.stopPropagation();
    const st = GenericDatePickers[cfg.hiddenId];
    st.m++;
    if (st.m > 12) {
      st.m = 1;
      st.y++;
    }
    renderGenericCal(cfg);
  });

  document.getElementById(cfg.daysId)?.addEventListener("click", (e) => {
    const cell = e.target.closest(".cal-day[data-date]");
    if (!cell) return;
    setGenericDate(cfg, cell.dataset.date);
    document.getElementById(cfg.panelId)?.classList.add("hidden");
  });

  document.addEventListener("click", (e) => {
    const panel = document.getElementById(cfg.panelId);
    const toggle = document.getElementById(cfg.toggleId);
    if (!panel || panel.classList.contains("hidden")) return;
    if (panel.contains(e.target) || e.target === toggle || toggle?.contains(e.target))
      return;
    panel.classList.add("hidden");
  });
}

function setGenericDate(cfg, iso) {
  setValue(cfg.hiddenId, iso);
  const displayEl = document.getElementById(cfg.displayId);
  if (displayEl) displayEl.value = toJalaliText(iso);
  const j = toJalali(iso);
  GenericDatePickers[cfg.hiddenId].y = j.year;
  GenericDatePickers[cfg.hiddenId].m = j.month;
  renderGenericCal(cfg);
}

function renderGenericCal(cfg) {
  const st = GenericDatePickers[cfg.hiddenId];
  if (!st.y) {
    const j = toJalali(getValue(cfg.hiddenId) || todayISO());
    st.y = j.year;
    st.m = j.month;
  }
  const labelEl = document.getElementById(cfg.labelId);
  if (labelEl)
    labelEl.textContent = `${JALALI_MONTHS[st.m - 1]} ${toPersianNum(st.y)}`;
  const daysEl = document.getElementById(cfg.daysId);
  const selectedISO = getValue(cfg.hiddenId);
  if (daysEl)
    daysEl.innerHTML = buildMonthGridHTML(st.y, st.m, selectedISO, new Map());
}

function renderTaskDateCal() {
  const jy = State.taskCalYear;
  const jm = State.taskCalMonth;
  const labelEl = document.getElementById("taskDateCalLabel");
  if (labelEl) labelEl.textContent = `${JALALI_MONTHS[jm - 1]} ${toPersianNum(jy)}`;

  const tasksByDate = new Map();
  DB.get("tasks", []).forEach((t) => {
    if (!tasksByDate.has(t.date)) tasksByDate.set(t.date, []);
    tasksByDate.get(t.date).push(t);
  });
  const selectedISO = getValue("taskDate");
  const daysEl = document.getElementById("taskDateCalDays");
  if (daysEl)
    daysEl.innerHTML = buildMonthGridHTML(jy, jm, selectedISO, tasksByDate);
}

function openTaskModal(item = null) {
  State.editingId = item?.id || null;
  const title = document.getElementById("modalTaskTitle");
  if (title) title.textContent = item ? "ویرایش وظیفه" : "افزودن وظیفه";

  populateTaskCategorySelect();
  setValue("taskTitle", item?.title || "");
  setTaskDate(item?.date || dateByOffset(State.dailyOffset));
  document.getElementById("taskDateCalPanel")?.classList.add("hidden");
  setValue("taskCategory", item?.category || getTaskCategories()[0] || "سایر");
  setValue("taskPriority", item?.priority || "normal");
  setValue("taskStart", item?.start || "");
  setValue("taskEnd", item?.end || "");
  setValue("taskRepeat", item?.repeat || "none");
  setValue("taskNote", item?.note || "");
  openModal("modalTask");
}

function saveTask() {
  const title = getValue("taskTitle").trim();
  if (!title) {
    showToast("عنوان وظیفه را وارد کنید", "error");
    return;
  }
  const dateStr = getValue("taskDate") || dateByOffset(State.dailyOffset);
  const item = {
    id: State.editingId || uid(),
    title,
    category: getValue("taskCategory"),
    priority: getValue("taskPriority"),
    start: getValue("taskStart"),
    end: getValue("taskEnd"),
    repeat: getValue("taskRepeat"),
    note: getValue("taskNote"),
    date: dateStr,
    done: false,
    createdAt: new Date().toISOString(),
  };

  if (State.editingId) {
    DB.update("tasks", State.editingId, item);
    showToast("وظیفه ویرایش شد");
  } else {
    DB.push("tasks", item);
    showToast("وظیفه اضافه شد");
  }
  closeModal("modalTask");
  /* اگه وظیفه برای روز دیگه‌ای غیر از روزی که الان نشون داده می‌شه ثبت شد،
     نمای برنامه‌ی روزانه رو هم به همون روز ببر تا فوراً نتیجه رو ببینه */
  State.dailyOffset = Math.round(
    (new Date(dateStr) - new Date(todayISO())) / 86400000,
  );
  renderDaily();
  updateBadges();
}

function renderDaily() {
  const dateStr = dateByOffset(State.dailyOffset);

  /* نمای ماهانه (که همیشه بازه) رو با روز فعلی هماهنگ نگه دار */
  const jNow = toJalali(dateStr);
  State.dailyCalYear = jNow.year;
  State.dailyCalMonth = jNow.month;
  renderDailyCalPanel();

  const labelEl = document.getElementById("dailyDateLabel");
  if (labelEl) {
    const label =
      State.dailyOffset === 0
        ? "امروز — " + toJalaliText(dateStr)
        : State.dailyOffset === -1
          ? "دیروز — " + toJalaliText(dateStr)
          : State.dailyOffset === 1
            ? "فردا — " + toJalaliText(dateStr)
            : toJalaliText(dateStr);
    labelEl.textContent = label;
  }

  const tasks = DB.get("tasks", [])
    .filter((t) => t.date === dateStr)
    .sort((a, b) => (a.start || "99:99").localeCompare(b.start || "99:99"));

  const timeline = document.getElementById("dailyTimeline");
  if (!timeline) return;

  if (!tasks.length) {
    timeline.innerHTML =
      '<div class="timeline-empty">هنوز فعالیتی برای این روز ثبت نشده.</div>';
    return;
  }

  const feedbackMap = getFeedbackMap();
  timeline.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>زمان</th>
          <th>عنوان</th>
          <th>دسته</th>
          <th>وضعیت</th>
          <th>گزارش</th>
          <th>عملیات</th>
        </tr>
      </thead>
      <tbody>
        ${tasks
          .map((t) => {
            const hasFeedback = !!feedbackMap[`task:${t.id}`];
            return `
          <tr class="${t.done ? "row-done" : ""}">
            <td class="ltr-cell">
              ${t.start ? toPersianNum(t.start) : "—"}${t.end ? " - " + toPersianNum(t.end) : ""}
            </td>
            <td>
              ${t.title}
              ${t.priority === "urgent" ? '<span class="cat-badge" style="background:#fee2e2;color:#dc2626">فوری</span>' : ""}
              ${t.note ? `<div class="row-subnote">${t.note}</div>` : ""}
            </td>
            <td>
              <span class="cat-badge" style="background:${getCategoryColor(t.category)}20;
                    color:${getCategoryColor(t.category)}">${t.category}</span>
            </td>
            <td>
              <span class="events-status ${t.done ? "done" : "pending"}">${t.done ? "انجام‌شده" : "انجام‌نشده"}</span>
            </td>
            <td>
              <button class="icon-btn task-feedback" data-id="${t.id}" data-title="${t.title}"
                      title="${hasFeedback ? "دیدن/ویرایش گزارش" : "نوشتن گزارش — چی شد؟ چرا نشد؟"}"
                      style="${hasFeedback ? "color:var(--color-primary)" : ""}">
                <i class="fa-solid ${hasFeedback ? "fa-comment-dots" : "fa-comment"}"></i>
              </button>
            </td>
            <td>
              <div class="actions-cell">
              <button class="icon-btn task-toggle" data-id="${t.id}" title="${t.done ? "برگرداندن" : "انجام‌شده"}">
                <i class="fa-solid ${t.done ? "fa-rotate-left" : "fa-check"}"></i>
              </button>
              <button class="icon-btn task-edit" data-id="${t.id}" title="ویرایش">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button class="icon-btn task-del" data-id="${t.id}" title="حذف"
                      style="color:var(--color-danger)">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
            </td>
          </tr>`;
          })
          .join("")}
      </tbody>
    </table>`;

  /* رویدادها */
  timeline.querySelectorAll(".task-toggle").forEach((btn) => {
    btn.addEventListener("click", () => toggleTask(btn.dataset.id));
  });
  timeline.querySelectorAll(".task-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      const task = DB.get("tasks", []).find((t) => t.id === btn.dataset.id);
      if (task) openTaskModal(task);
    });
  });
  timeline.querySelectorAll(".task-feedback").forEach((btn) => {
    btn.addEventListener("click", () => {
      openFeedbackModal(`task:${btn.dataset.id}`, btn.dataset.title, renderDaily);
    });
  });
  timeline.querySelectorAll(".task-del").forEach((btn) => {
    btn.addEventListener("click", () =>
      deleteRecord("tasks", btn.dataset.id, renderDaily),
    );
  });
}

function toggleTask(id) {
  const tasks = DB.get("tasks", []);
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  DB.update("tasks", id, {
    done: !task.done,
    updatedAt: new Date().toISOString(),
  });
  renderDaily();
  updateBadges();
}

/* ═══════════════════════════════════════════
   ۵. فعالیت‌ها
═══════════════════════════════════════════ */
State.activitiesMode = "calendar"; // یا "rolling"

/** بازه‌ی هفته‌ی فعال: شنبه‌تاجمعه‌ی همین هفته، یا ۷ روز از امروز */
function getActivityWeekRange(mode) {
  const today = todayISO();
  if (mode === "rolling") {
    return { start: today, end: dateByOffset(6) };
  }
  const d = new Date(today + "T00:00:00");
  const daysSinceSaturday = (d.getDay() + 1) % 7; // شنبه=0
  const start = dateByOffset(-daysSinceSaturday);
  const end = dateByOffset(6 - daysSinceSaturday);
  return { start, end };
}

function isoRangeDates(start, end) {
  const dates = [];
  const d = new Date(start + "T00:00:00");
  let guard = 0;
  while (guard++ < 40) {
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (iso > end) break;
    dates.push(iso);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function initActivities() {
  document.getElementById("btn-add-activity")?.addEventListener("click", () => {
    openActivityModal();
  });

  document
    .getElementById("modalActivityClose")
    ?.addEventListener("click", () => closeModal("modalActivity"));

  document
    .getElementById("modalActivityCancel")
    ?.addEventListener("click", () => closeModal("modalActivity"));

  document
    .getElementById("modalActivitySave")
    ?.addEventListener("click", saveActivity);

  document
    .getElementById("activitySearch")
    ?.addEventListener("input", renderActivities);

  document
    .getElementById("activityFilter")
    ?.addEventListener("change", renderActivities);

  document
    .getElementById("activitiesRangeTabs")
    ?.addEventListener("click", (e) => {
      const btn = e.target.closest(".chart-tab");
      if (!btn) return;
      document
        .querySelectorAll("#activitiesRangeTabs .chart-tab")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      State.activitiesMode = btn.dataset.mode;
      renderActivities();
    });

  document.getElementById("activityDayChips")?.addEventListener("click", (e) => {
    const chip = e.target.closest(".day-chip[data-date]");
    if (!chip) return;
    document
      .querySelectorAll("#activityDayChips .day-chip")
      .forEach((c) => c.classList.remove("selected"));
    chip.classList.add("selected");
    setValue("activityDate", chip.dataset.date);
  });

  document.getElementById("activitiesGrid")?.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".act-edit");
    if (editBtn) {
      const item = DB.get("activities", []).find(
        (a) => a.id === editBtn.dataset.id,
      );
      if (item) openActivityModal(item);
      return;
    }
    const delBtn = e.target.closest(".act-del");
    if (delBtn) {
      deleteRecord("activities", delBtn.dataset.id, renderActivities);
    }
  });
}

/** تراشه‌های روز رو برای بازه‌ی فعال بساز (فقط از امروز تا پایان بازه) */
function renderActivityDayChips(selectedDate) {
  const wrap = document.getElementById("activityDayChips");
  if (!wrap) return;
  const { end } = getActivityWeekRange(State.activitiesMode);
  const today = todayISO();
  const days = isoRangeDates(today, end);

  wrap.innerHTML = days
    .map((iso) => {
      const j = toJalali(iso);
      const isSel = iso === selectedDate;
      return `
        <div class="day-chip ${isSel ? "selected" : ""}" data-date="${iso}">
          <span class="dc-name">${JALALI_DAYS_LONG[(new Date(iso + "T00:00:00").getDay() + 1) % 7]}</span>
          <span class="dc-num">${toPersianNum(j.day)}</span>
        </div>`;
    })
    .join("");
}

function openActivityModal(item = null) {
  State.editingId = item?.id || null;
  setEl("modalActivityTitle", item ? "ویرایش فعالیت" : "افزودن فعالیت");
  setValue("activityTitle", item?.title || "");
  setValue("activityCategory", item?.category || "تعامل");
  setValue("activityDuration", item?.duration || "");
  setValue("activityNote", item?.note || "");

  const defaultDate = item?.date || todayISO();
  setValue("activityDate", defaultDate);
  renderActivityDayChips(defaultDate);
  openModal("modalActivity");
}

function saveActivity() {
  const title = getValue("activityTitle").trim();
  const category = getValue("activityCategory");
  const duration = Number(getValue("activityDuration"));
  const note = getValue("activityNote").trim();
  const date = getValue("activityDate") || todayISO();

  if (!title) {
    showToast("عنوان فعالیت را وارد کنید", "error");
    return;
  }
  if (!duration || duration <= 0) {
    showToast("مدت فعالیت را وارد کنید", "error");
    return;
  }

  const item = {
    id: State.editingId || uid(),
    title,
    category,
    duration,
    note,
    date,
    createdAt: new Date().toISOString(),
  };

  if (State.editingId) {
    DB.update("activities", State.editingId, item);
    showToast("فعالیت ویرایش شد ✅");
  } else {
    DB.push("activities", item);
    showToast("فعالیت ثبت شد ✅");
  }

  closeModal("modalActivity");
  renderActivities();
}

/* نمایش فعالیت‌ها به‌صورت کارت‌گرید + نمودار بازه‌ی انتخابی */
function renderActivities() {
  const search = getValue("activitySearch").trim().toLowerCase();
  const filter = getValue("activityFilter");
  const { start, end } = getActivityWeekRange(State.activitiesMode);
  const rangeDates = isoRangeDates(start, end);

  const all = DB.get("activities", [])
    .filter(
      (x) =>
        x.date >= start &&
        x.date <= end &&
        (!search || (x.title || "").toLowerCase().includes(search)) &&
        (!filter || x.category === filter),
    )
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  const titleEl = document.getElementById("activitiesChartTitle");
  if (titleEl) {
    titleEl.textContent = `مدت فعالیت‌ها — ${toJalaliText(start).split(" - ")[1]} تا ${toJalaliText(end).split(" - ")[1]}`;
  }

  const grid = document.getElementById("activitiesGrid");
  if (grid) {
    if (!all.length) {
      grid.innerHTML = '<div class="empty-state">فعالیتی توی این بازه یافت نشد</div>';
    } else {
      grid.innerHTML = `
        <table class="data-table">
          <thead>
            <tr>
              <th>عنوان</th>
              <th>دسته</th>
              <th>روز</th>
              <th>مدت</th>
              <th>یادداشت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            ${all
              .map(
                (x) => `
              <tr>
                <td>${x.title}</td>
                <td>
                  <span class="cat-badge" style="background:${getCategoryColor(x.category)}20;
                        color:${getCategoryColor(x.category)}">${x.category}</span>
                </td>
                <td>${toJalaliText(x.date).split(" - ")[1]}</td>
                <td class="ltr-cell">${toPersianNum(x.duration)} دقیقه</td>
                <td>${x.note ? `<span class="row-subnote">${x.note}</span>` : "—"}</td>
                <td>
              <div class="actions-cell">
                  <button class="icon-btn act-edit" data-id="${x.id}" title="ویرایش">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button class="icon-btn act-del" data-id="${x.id}" title="حذف" style="color:var(--color-danger)">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
            </td>
              </tr>`,
              )
              .join("")}
          </tbody>
        </table>`;
    }
  }

  /* نمودار بازه‌ی فعال — از شنبه تا جمعه، یا ۷ روز از امروز، با اسم کامل روزها.
     Chart.js همیشه از چپ به راست رسم می‌کنه (صرف‌نظر از RTL صفحه)، برای
     همین آرایه رو برعکس می‌کنیم تا شروع هفته (شنبه) توی نمایش سمت راست بیفته. */
  const chartDates = [...rangeDates].reverse();
  const labels = chartDates.map(
    (iso) => JALALI_DAYS_LONG[(new Date(iso + "T00:00:00").getDay() + 1) % 7],
  );
  const dataArr = chartDates.map((iso) =>
    DB.get("activities", [])
      .filter((a) => a.date === iso)
      .reduce((sum, a) => sum + (a.duration || 0), 0),
  );

  makeChart("chartActivities", {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "دقیقه فعالیت",
          data: dataArr,
          backgroundColor: "rgba(124,58,237,.7)",
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: "#f1f5f9" } },
        x: { grid: { display: false } },
      },
    },
  });
}

/* ═══════════════════════════════════════════
   ۶. سلامت
═══════════════════════════════════════════ */
function initHealth() {
  /* ─ آب ─ */
  document.getElementById("btn-add-water")?.addEventListener("click", addWater);
  document.getElementById("btn-reset-water")?.addEventListener("click", () => {
    DB.set("water_" + todayISO(), []);
    renderHealth();
    showToast("مصرف آب ریست شد", "info");
  });

  /* ─ خواب ─ */
  document
    .getElementById("btn-save-sleep")
    ?.addEventListener("click", saveSleep);

  /* ─ وزن ─ */
  document
    .getElementById("btn-save-weight")
    ?.addEventListener("click", saveWeight);

  /* ─ حال ─ */
  document.querySelectorAll(".mood-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".mood-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
  document.getElementById("btn-save-mood")?.addEventListener("click", saveMood);
}

function renderHealth() {
  renderWaterTracker();
  renderSleepChart();
  renderWeightChart();
  renderCurrentMood();
  renderMoodHistory();
}

function renderWaterTracker() {
  const today = todayISO();
  const glasses = DB.get("water_" + today, []);
  const count = glasses.length;
  setEl("waterCount", toPersianNum(count));

  const wrap = document.getElementById("waterGlasses");
  if (!wrap) return;
  wrap.innerHTML = Array.from(
    { length: 8 },
    (_, i) => `
    <button class="water-glass ${i < count ? "filled" : ""}"
            onclick="addWaterAt(${i})" title="لیوان ${i + 1}">
      <i class="fa-solid fa-droplet"></i>
    </button>
  `,
  ).join("");
}

function addWater() {
  const today = todayISO();
  const arr = DB.get("water_" + today, []);
  if (arr.length >= 8) {
    showToast("به هدف ۸ لیوان رسیدی! 🎉", "info");
    return;
  }
  arr.push({ time: new Date().toLocaleTimeString("fa") });
  DB.set("water_" + today, arr);
  renderWaterTracker();
  setEl("stat-water", toPersianNum(arr.length));
  if (arr.length === 8) showToast("آفرین! هدف آب امروز تکمیل شد 💧", "success");
}

window.addWaterAt = function (idx) {
  const today = todayISO();
  const arr = DB.get("water_" + today, []);
  if (idx < arr.length) {
    arr.splice(idx, 1);
  } else {
    arr.push({ time: new Date().toLocaleTimeString("fa") });
  }
  DB.set("water_" + today, arr);
  renderWaterTracker();
};

function saveSleep() {
  const start = getValue("sleepStart");
  const end = getValue("sleepEnd");
  if (!start || !end) {
    showToast("ساعت خواب و بیداری را وارد کنید", "error");
    return;
  }
  const hrs = calcHours(start, end);
  const today = todayISO();
  const rec = { id: uid(), date: today, start, end, hours: hrs };
  const arr = DB.get("sleep", []).filter((s) => s.date !== today);
  arr.push(rec);
  DB.set("sleep", arr);
  const resEl = document.getElementById("sleepResult");
  if (resEl) resEl.textContent = `مدت خواب: ${toPersianNum(hrs)} ساعت`;
  showToast("خواب ذخیره شد");
  renderSleepChart();
  setEl("stat-sleep", toPersianNum(hrs) + " ساعت");
}

function renderSleepChart() {
  const labels = [];
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const iso = dateByOffset(-i);
    const d = new Date(iso + "T00:00:00");
    labels.push(JALALI_DAYS_LONG[(d.getDay() + 1) % 7]);
    const rec = DB.get("sleep", []).find((s) => s.date === iso);
    data.push(rec ? Number(rec.hours) : 0);
  }
  labels.reverse();
  data.reverse();
  makeChart("chartSleep", {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "ساعت خواب",
          data,
          borderColor: "#7c3aed",
          backgroundColor: "rgba(124,58,237,.1)",
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#7c3aed",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          max: 12,
          ticks: { font: { family: "Vazirmatn" } },
        },
        x: {
          grid: { display: false },
          ticks: { font: { family: "Vazirmatn" } },
        },
      },
    },
  });
}

function saveWeight() {
  const val = parseFloat(getValue("weightInput"));
  if (!val) {
    showToast("وزن را وارد کنید", "error");
    return;
  }
  const today = todayISO();
  const arr = DB.get("weight", []).filter((w) => w.date !== today);
  arr.push({ date: today, value: val });
  DB.set("weight", arr);
  showToast("وزن ذخیره شد");
  renderWeightChart();
}

function renderWeightChart() {
  const recs = DB.get("weight", []).slice(-14).reverse();
  const labels = recs.map((r) => toJalaliText(r.date));
  const data = recs.map((r) => r.value);
  makeChart("chartWeight", {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "وزن (کیلوگرم)",
          data,
          borderColor: "#10b981",
          backgroundColor: "rgba(16,185,129,.1)",
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#10b981",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { font: { family: "Vazirmatn" } } },
        x: {
          grid: { display: false },
          ticks: { font: { family: "Vazirmatn" }, maxRotation: 0 },
        },
      },
    },
  });
}

function saveMood() {
  const active = document.querySelector(".mood-btn.active");
  const mood = active?.dataset.mood || "3";
  const note = getValue("moodNote");
  const today = todayISO();
  const arr = DB.get("mood", []).filter((m) => m.date !== today);
  arr.push({ date: today, mood: Number(mood), note });
  DB.set("mood", arr);
  showToast("حال امروز ذخیره شد 😊");
  renderMoodHistory();
}

const MOOD_EMOJIS = { 5: "😄", 4: "🙂", 3: "😐", 2: "😕", 1: "😞" };

function renderMoodHistory() {
  const wrap = document.getElementById("moodHistory");
  if (!wrap) return;
  const days = [];
  for (let i = 6; i >= 0; i--) days.push(dateByOffset(-i));

  wrap.innerHTML = days
    .map((iso) => {
      const rec = DB.get("mood", []).find((m) => m.date === iso);
      const d = new Date(iso + "T00:00:00");
      const dayName = JALALI_DAYS_LONG[(d.getDay() + 1) % 7];
      return `
        <div class="mood-history-day ${rec ? "" : "empty"}" title="${rec ? MOOD_EMOJIS[rec.mood] : "ثبت نشده"}">
          <span class="mhd-emoji">${rec ? MOOD_EMOJIS[rec.mood] : "○"}</span>
          <span class="mhd-name">${dayName}</span>
        </div>`;
    })
    .join("");
}

function renderCurrentMood() {
  const today = todayISO();
  const rec = DB.get("mood", []).find((m) => m.date === today);
  if (!rec) return;
  document.querySelectorAll(".mood-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.mood === String(rec.mood));
  });
  setValue("moodNote", rec.note || "");
}

/* ═══════════════════════════════════════════
   ۷. ورزش و یوگا
═══════════════════════════════════════════ */
function initSport() {
  document.getElementById("btn-add-sport")?.addEventListener("click", () => {
    State.editingId = null;
    setGenericDate(sportDatePickerCfg, todayISO());
    openModal("modalSport");
  });
  document
    .getElementById("modalSportClose")
    ?.addEventListener("click", () => closeModal("modalSport"));
  document
    .getElementById("modalSportCancel")
    ?.addEventListener("click", () => closeModal("modalSport"));
  document
    .getElementById("modalSportSave")
    ?.addEventListener("click", saveSport);

  initGenericDatePicker(sportDatePickerCfg);
  attachAmountFormatting("sportCost");
}

const sportDatePickerCfg = {
  toggleId: "sportDateToggle",
  panelId: "sportDateCalPanel",
  labelId: "sportDateCalLabel",
  prevId: "sportDateCalPrev",
  nextId: "sportDateCalNext",
  daysId: "sportDateCalDays",
  hiddenId: "sportDate",
  displayId: "sportDateDisplay",
};

function saveSport() {
  const type = getValue("sportType");
  const date = getValue("sportDate") || todayISO();
  const start = getValue("sportStart");
  const end = getValue("sportEnd");
  if (!start || !end) {
    showToast("ساعت شروع و پایان را وارد کنید", "error");
    return;
  }

  const costRaw = getValue("sportCost").replace(/,/g, "");
  const item = {
    id: State.editingId || uid(),
    type,
    date,
    start,
    end,
    cost: Number(costRaw) || 0,
    intensity: getValue("sportIntensity"),
    note: getValue("sportNote"),
    createdAt: new Date().toISOString(),
  };

  if (State.editingId) {
    DB.update("sport", State.editingId, item);
    showToast("جلسه ویرایش شد");
  } else {
    DB.push("sport", item);
    showToast("جلسه ورزشی ثبت شد 💪");
    /* ثبت هزینه خودکار */
    if (item.cost > 0) {
      DB.push("finance", {
        id: uid(),
        title: type,
        category: "ورزش",
        amount: item.cost,
        date,
        note: item.note || "",
      });
    }
  }
  closeModal("modalSport");
  renderSport();
}

function renderSport() {
  const today = todayISO();
  const weekAgo = dateByOffset(-7);
  const all = DB.get("sport", []);
  const week = all.filter((s) => s.date >= weekAgo && s.date <= today);

  setEl("sportWeekCount", toPersianNum(week.length));
  const totalMins = week.reduce((a, s) => a + calcMins(s.start, s.end), 0);
  setEl("sportWeekMins", toPersianNum(totalMins) + " دقیقه");

  /* استریک */
  let streak = 0;
  for (let i = 0; i <= 30; i++) {
    const d = dateByOffset(-i);
    if (all.some((s) => s.date === d)) streak++;
    else if (i > 0) break;
  }
  setEl("sportStreak", toPersianNum(streak) + " روز");

  /* هزینه ماه */
  const month = todayISO().slice(0, 7);
  const mCost = DB.get("finance", [])
    .filter((f) => f.category === "ورزش" && f.date.startsWith(month))
    .reduce((a, f) => a + (Number(f.amount) || 0), 0);
  setEl("sportMonthCost", mCost ? toPersianNum(mCost.toLocaleString()) : "—");

  /* جدول */
  const tbody = document.getElementById("sportTableBody");
  if (tbody) {
    if (!all.length) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="empty-state">جلسه‌ای ثبت نشده</td></tr>';
    } else {
      tbody.innerHTML = all
        .slice()
        .reverse()
        .map(
          (s) => `
        <tr>
          <td>${s.type}</td>
          <td>${toJalaliText(s.date)}</td>
          <td>${toPersianNum(calcMins(s.start, s.end))} دقیقه</td>
          <td>${s.note || "—"}</td>
          <td>${s.cost ? toPersianNum(s.cost.toLocaleString()) : "رایگان"}</td>
          <td>
            <button class="icon-btn" onclick="deleteRecord('sport','${s.id}',renderSport)"
                    style="color:var(--color-danger)">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `,
        )
        .join("");
    }
  }

  /* نمودار */
  const labels = [];
  const dataArr = [];
  for (let i = 29; i >= 0; i--) {
    const iso = dateByOffset(-i);
    labels.push(iso.slice(8));
    dataArr.push(
      all
        .filter((s) => s.date === iso)
        .reduce((a, s) => a + calcMins(s.start, s.end), 0),
    );
  }
  labels.reverse();
  dataArr.reverse();
  makeChart("chartSport", {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "دقیقه",
          data: dataArr,
          backgroundColor: "rgba(13,148,136,.7)",
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true },
        x: {
          grid: { display: false },
          ticks: { maxRotation: 0, font: { size: 9 } },
        },
      },
    },
  });
}

/* ═══════════════════════════════════════════
   ۸. تغذیه
═══════════════════════════════════════════ */
function initFood() {
  document
    .getElementById("btn-add-food")
    ?.addEventListener("click", () => {
      setGenericDate(foodDateCfg, todayISO());
      openModal("modalFood");
    });
  document
    .getElementById("modalFoodClose")
    ?.addEventListener("click", () => closeModal("modalFood"));
  document
    .getElementById("modalFoodCancel")
    ?.addEventListener("click", () => closeModal("modalFood"));
  document.getElementById("modalFoodSave")?.addEventListener("click", saveFood);

  /* دکمه‌های "اضافه" در هر وعده */
  document.querySelectorAll("[data-add-meal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setValue("foodMealType", btn.dataset.addMeal);
      setGenericDate(foodDateCfg, todayISO());
      openModal("modalFood");
    });
  });

  initGenericDatePicker(foodDateCfg);
  setGenericDate(foodDateCfg, todayISO());
}

const foodDateCfg = {
  toggleId: "foodDateToggle",
  panelId: "foodDateCalPanel",
  labelId: "foodDateCalLabel",
  prevId: "foodDateCalPrev",
  nextId: "foodDateCalNext",
  daysId: "foodDateCalDays",
  hiddenId: "foodDate",
  displayId: "foodDateDisplay",
};

function saveFood() {
  const name = getValue("foodName").trim();
  if (!name) {
    showToast("نام غذا را وارد کنید", "error");
    return;
  }
  const item = {
    id: uid(),
    mealType: getValue("foodMealType"),
    name,
    calories: Number(getValue("foodCalories")) || 0,
    time: getValue("foodTime"),
    date: getValue("foodDate") || todayISO(),
    note: getValue("foodNote"),
  };
  DB.push("food", item);
  showToast("وعده غذایی ثبت شد 🍽️");
  closeModal("modalFood");
  renderFood();
}

function renderFood() {
  const today = todayISO();
  const meals = ["صبحانه", "ناهار", "شام", "میان‌وعده"];
  const all = DB.get("food", []).filter((f) => f.date === today);

  meals.forEach((meal) => {
    const el = document.getElementById("meal-" + meal);
    if (!el) return;
    const items = all.filter((f) => f.mealType === meal);
    if (!items.length) {
      el.innerHTML =
        '<li style="color:var(--text-secondary);font-size:.8rem">—</li>';
      return;
    }
    el.innerHTML = items
      .map(
        (f) => `
      <li class="meal-item">
        <span>${f.name}${f.time ? ` <small class="meal-time">${toPersianNum(f.time)}</small>` : ""}</span>
        ${f.calories ? `<span class="meal-cal">${toPersianNum(f.calories)} کال</span>` : ""}
        <button class="meal-del" onclick="deleteRecord('food','${f.id}',renderFood)">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </li>
    `,
      )
      .join("");
  });

  /* ۴ کارت آماری بالای نمودار */
  const todayCalories = all.reduce((a, f) => a + (f.calories || 0), 0);
  setEl("foodTodayCalories", toPersianNum(todayCalories));
  setEl("foodTodayCount", toPersianNum(all.length));

  let weekTotal = 0;
  for (let i = 0; i < 7; i++) {
    const iso = dateByOffset(-i);
    weekTotal += DB.get("food", [])
      .filter((f) => f.date === iso)
      .reduce((a, f) => a + (f.calories || 0), 0);
  }
  setEl("foodWeekAvg", toPersianNum(Math.round(weekTotal / 7)));

  const lastMeal = all
    .filter((f) => f.time)
    .sort((a, b) => (a.time || "").localeCompare(b.time || ""))
    .pop();
  setEl(
    "foodLastMeal",
    lastMeal ? `${lastMeal.name} — ${toPersianNum(lastMeal.time)}` : "—",
  );

  /* نمودار کالری ۷ روز */
  const labels = [];
  const dataArr = [];
  for (let i = 6; i >= 0; i--) {
    const iso = dateByOffset(-i);
    const d = new Date(iso + "T00:00:00");
    labels.push(JALALI_DAYS_LONG[(d.getDay() + 1) % 7]);
    dataArr.push(
      DB.get("food", [])
        .filter((f) => f.date === iso)
        .reduce((a, f) => a + (f.calories || 0), 0),
    );
  }
  labels.reverse();
  dataArr.reverse();
  makeChart("chartCalories", {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "کیلوکالری",
          data: dataArr,
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245,158,11,.15)",
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#f59e0b",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { font: { family: "Vazirmatn" } } },
        x: {
          grid: { display: false },
          ticks: { font: { family: "Vazirmatn" } },
        },
      },
    },
  });
}

/* ═══════════════════════════════════════════
   ۹. دارو و دکتر
═══════════════════════════════════════════ */
const medStartCfg = {
  toggleId: "medStartToggle",
  panelId: "medStartCalPanel",
  labelId: "medStartCalLabel",
  prevId: "medStartCalPrev",
  nextId: "medStartCalNext",
  daysId: "medStartCalDays",
  hiddenId: "medStart",
  displayId: "medStartDisplay",
};
const medEndCfg = {
  toggleId: "medEndToggle",
  panelId: "medEndCalPanel",
  labelId: "medEndCalLabel",
  prevId: "medEndCalPrev",
  nextId: "medEndCalNext",
  daysId: "medEndCalDays",
  hiddenId: "medEnd",
  displayId: "medEndDisplay",
};

let medTimesDraft = [];

function renderMedTimesChips() {
  const wrap = document.getElementById("medTimesRow");
  if (!wrap) return;
  if (!medTimesDraft.length) {
    wrap.innerHTML = '<span class="onboarding-hint">هنوز ساعتی اضافه نشده</span>';
    return;
  }
  wrap.innerHTML = medTimesDraft
    .map(
      (t) => `
      <span class="time-chip">
        ${toPersianNum(t)}
        <button type="button" class="chip-remove" data-time="${t}">✕</button>
      </span>`,
    )
    .join("");
}

function initMedicine() {
  /* مودال دارو */
  document.getElementById("btn-add-medicine")?.addEventListener("click", () => {
    State.editingId = null;
    medTimesDraft = [];
    renderMedTimesChips();
    setValue("medName", "");
    setValue("medDose", "");
    setValue("medRepeat", "روزانه");
    setValue("medStock", "");
    setValue("medNote", "");
    setGenericDate(medStartCfg, todayISO());
    setValue("medEnd", "");
    setValue("medEndDisplay", "");
    openModal("modalMedicine");
  });
  document
    .getElementById("modalMedicineClose")
    ?.addEventListener("click", () => closeModal("modalMedicine"));
  document
    .getElementById("modalMedicineCancel")
    ?.addEventListener("click", () => closeModal("modalMedicine"));
  document
    .getElementById("modalMedicineSave")
    ?.addEventListener("click", saveMedicine);

  initGenericDatePicker(medStartCfg);
  initGenericDatePicker(medEndCfg);

  document.getElementById("btn-add-med-time")?.addEventListener("click", () => {
    const t = getValue("medTimeInput");
    if (!t) return;
    if (!medTimesDraft.includes(t)) {
      medTimesDraft.push(t);
      medTimesDraft.sort();
      renderMedTimesChips();
    }
    setValue("medTimeInput", "");
  });
  document.getElementById("medTimesRow")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip-remove");
    if (!btn) return;
    medTimesDraft = medTimesDraft.filter((t) => t !== btn.dataset.time);
    renderMedTimesChips();
  });

  document.getElementById("medicineTableBody")?.addEventListener("click", (e) => {
    const delBtn = e.target.closest(".med-del");
    if (delBtn) {
      window.deleteMedicine(delBtn.dataset.id);
      return;
    }
    const statusBtn = e.target.closest(".med-status-toggle");
    if (statusBtn) openMedStatusModal(statusBtn.dataset.id);
  });

  /* مودال وضعیت مصرف امروز */
  document.getElementById("medStatusOptions")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".med-status-btn");
    if (!btn) return;
    document
      .querySelectorAll(".med-status-btn")
      .forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    State.pickedMedStatus = btn.dataset.status;
  });
  document
    .getElementById("modalMedStatusClose")
    ?.addEventListener("click", () => closeModal("modalMedStatus"));
  document
    .getElementById("modalMedStatusCancel")
    ?.addEventListener("click", () => closeModal("modalMedStatus"));
  document
    .getElementById("modalMedStatusSave")
    ?.addEventListener("click", saveMedStatus);

  /* مودال دکتر */
  document.getElementById("btn-add-doctor")?.addEventListener("click", () => {
    setGenericDate(docDateCfg, todayISO());
    setValue("docNextDate", "");
    setValue("docNextDateDisplay", "");
    openModal("modalDoctor");
  });
  document
    .getElementById("modalDoctorClose")
    ?.addEventListener("click", () => closeModal("modalDoctor"));
  document
    .getElementById("modalDoctorCancel")
    ?.addEventListener("click", () => closeModal("modalDoctor"));
  document
    .getElementById("modalDoctorSave")
    ?.addEventListener("click", saveDoctor);

  initGenericDatePicker(docDateCfg);
  initGenericDatePicker(docNextDateCfg);
  attachAmountFormatting("docCost");
}

const docDateCfg = {
  toggleId: "docDateToggle",
  panelId: "docDateCalPanel",
  labelId: "docDateCalLabel",
  prevId: "docDateCalPrev",
  nextId: "docDateCalNext",
  daysId: "docDateCalDays",
  hiddenId: "docDate",
  displayId: "docDateDisplay",
};
const docNextDateCfg = {
  toggleId: "docNextDateToggle",
  panelId: "docNextDateCalPanel",
  labelId: "docNextDateCalLabel",
  prevId: "docNextDateCalPrev",
  nextId: "docNextDateCalNext",
  daysId: "docNextDateCalDays",
  hiddenId: "docNextDate",
  displayId: "docNextDateDisplay",
};

function saveMedicine() {
  const name = getValue("medName").trim();
  if (!name) {
    showToast("نام دارو را وارد کنید", "error");
    return;
  }
  const item = {
    id: uid(),
    name,
    dose: getValue("medDose"),
    repeat: getValue("medRepeat"),
    startDate: getValue("medStart") || todayISO(),
    endDate: getValue("medEnd") || "",
    times: [...medTimesDraft],
    stock: Number(getValue("medStock")) || null,
    note: getValue("medNote"),
    active: true,
  };
  DB.push("medicine", item);
  showToast("دارو اضافه شد 💊");
  closeModal("modalMedicine");
  renderMedicine();
  updateBadges();
}

/* ─── وضعیت مصرف امروز (خوردم/نخوردم/بخشی/تداخل) ─── */
function openMedStatusModal(medId) {
  const med = DB.get("medicine", []).find((m) => m.id === medId);
  if (!med) return;
  State.pickedMedId = medId;
  State.pickedMedStatus = null;
  setEl("modalMedStatusTitle", `وضعیت مصرف امروز — ${med.name}`);
  document
    .querySelectorAll(".med-status-btn")
    .forEach((b) => b.classList.remove("selected"));
  setValue("medStatusNote", "");
  openModal("modalMedStatus");
}

function saveMedStatus() {
  if (!State.pickedMedId || !State.pickedMedStatus) {
    showToast("یکی از گزینه‌ها رو انتخاب کن", "error");
    return;
  }
  const today = todayISO();
  const log = DB.get("medDoseLog", []);
  log.push({
    id: uid(),
    medId: State.pickedMedId,
    date: today,
    status: State.pickedMedStatus,
    note: getValue("medStatusNote").trim(),
    createdAt: new Date().toISOString(),
  });
  DB.set("medDoseLog", log);

  /* برای سازگاری با کارت خونه و گزارش رویدادها، وضعیت ساده‌ی
     «مصرف‌شده» رو هم هماهنگ نگه می‌داریم */
  const taken = DB.get("meds_taken_" + today, []);
  const idx = taken.indexOf(State.pickedMedId);
  const countsAsTaken = ["taken", "partial"].includes(State.pickedMedStatus);
  if (countsAsTaken && idx === -1) taken.push(State.pickedMedId);
  if (!countsAsTaken && idx !== -1) taken.splice(idx, 1);
  DB.set("meds_taken_" + today, taken);

  closeModal("modalMedStatus");
  renderMedicine();
  showToast("وضعیت ثبت شد ✅");
}

function saveDoctor() {
  const name = getValue("docName").trim();
  if (!name) {
    showToast("نام پزشک را وارد کنید", "error");
    return;
  }
  const costRaw = getValue("docCost").replace(/,/g, "");
  const item = {
    id: uid(),
    name,
    specialty: getValue("docSpec"),
    date: getValue("docDate") || todayISO(),
    cost: Number(costRaw) || 0,
    note: getValue("docNote"),
    status: getValue("docStatus") || "در حال درمان",
    nextDate: getValue("docNextDate"),
  };
  DB.push("doctor", item);

  /* ثبت هزینه خودکار */
  if (item.cost > 0) {
    DB.push("finance", {
      id: uid(),
      title: "ویزیت " + item.name,
      category: "دکتر",
      amount: item.cost,
      date: item.date,
      note: "",
    });
  }

  /* یادآوری برای مراجعه بعدی */
  if (item.nextDate) {
    DB.push("reminders", {
      id: uid(),
      title: "مراجعه بعدی: " + item.name,
      date: item.nextDate,
      time: "09:00",
      category: "قرار دکتر",
      repeat: "none",
      done: false,
    });
    showToast("یادآوری برای مراجعه بعدی ساخته شد", "info");
  }

  showToast("ویزیت ثبت شد");
  closeModal("modalDoctor");
  renderMedicine();
}

function renderMedicine() {
  const today = todayISO();
  const meds = DB.get("medicine", []).filter((m) => m.active);
  const taken = DB.get("meds_taken_" + today, []);

  /* موارد ضروری (موجودی کم یا هنوز امروز ثبت نشده) بالای جدول */
  const isUrgent = (m) =>
    (m.stock != null && m.stock <= 3) || !taken.includes(m.id);
  const sorted = meds
    .slice()
    .sort((a, b) => Number(isUrgent(b)) - Number(isUrgent(a)));

  const tbody = document.getElementById("medicineTableBody");
  if (tbody) {
    if (!sorted.length) {
      tbody.innerHTML =
        '<tr><td colspan="8" class="empty-state">داروی فعالی ثبت نشده</td></tr>';
    } else {
      tbody.innerHTML = sorted
        .map((m) => {
          const done = taken.includes(m.id);
          const urgent = isUrgent(m);
          const rangeText = m.endDate
            ? `${toJalaliText(m.startDate).split(" - ")[1]} تا ${toJalaliText(m.endDate).split(" - ")[1]}`
            : `از ${toJalaliText(m.startDate).split(" - ")[1]} (ادامه‌دار)`;
          return `
          <tr class="${urgent ? "row-urgent" : ""}">
            <td>
              ${urgent ? '<span class="urgent-dot" title="ضروری"></span>' : ""}
              <strong>${m.name}</strong>
            </td>
            <td>${m.dose || "—"}</td>
            <td>${m.repeat}</td>
            <td class="row-subnote">${rangeText}</td>
            <td class="ltr-cell">
              ${m.times && m.times.length ? m.times.map((t) => toPersianNum(t)).join(" - ") : "—"}
            </td>
            <td>${m.stock != null ? toPersianNum(m.stock) : "—"}</td>
            <td>
              <button class="med-status-toggle events-status ${done ? "done" : "pending"}" data-id="${m.id}">
                ${done ? "ثبت‌شده ✓" : "ثبت نشده"}
              </button>
            </td>
            <td>
              <div class="actions-cell">
              <button class="icon-btn med-del" data-id="${m.id}" title="حذف" style="color:var(--color-danger)">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
            </td>
          </tr>`;
        })
        .join("");
    }
  }

  /* جدول دکترها */
  const docs = DB.get("doctor", []).slice().reverse();
  const dtbody = document.getElementById("doctorTableBody");
  if (dtbody) {
    dtbody.innerHTML = docs.length
      ? docs
          .map(
            (d) => `
          <tr>
            <td>${d.name}${d.specialty ? " / " + d.specialty : ""}</td>
            <td>${toJalaliText(d.date)}</td>
            <td>${d.cost ? toPersianNum(d.cost.toLocaleString()) : "—"}</td>
            <td>${d.note || "—"}</td>
            <td><span class="cat-badge">${d.status || "—"}</span></td>
            <td>${d.nextDate ? toJalaliText(d.nextDate).split(" - ")[1] : "—"}</td>
            <td>
              <button class="icon-btn" onclick="deleteRecord('doctor','${d.id}',renderMedicine)"
                      style="color:var(--color-danger)">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>
        `,
          )
          .join("")
      : '<tr><td colspan="7" class="empty-state">ویزیتی ثبت نشده</td></tr>';
  }

  setEl(
    "stat-medicine",
    toPersianNum(taken.length) + " / " + toPersianNum(meds.length),
  );
}

window.deleteMedicine = async function (id) {
  const ok = await confirmDialog({
    title: "حذف دارو",
    message: "این دارو حذف بشه؟ برنامه‌ی مصرفش هم از بین می‌ره.",
    confirmText: "حذف دارو",
  });
  if (!ok) return;
  DB.remove("medicine", id);
  renderMedicine();
  showToast("دارو حذف شد", "info");
};

/* ═══════════════════════════════════════════
   ۱۰. یادآوری‌ها
═══════════════════════════════════════════ */
function initReminders() {
  document.getElementById("btn-add-reminder")?.addEventListener("click", () => {
    setGenericDate(reminderDateCfg, todayISO());
    openModal("modalReminder");
  });
  document
    .getElementById("modalReminderClose")
    ?.addEventListener("click", () => closeModal("modalReminder"));
  document
    .getElementById("modalReminderCancel")
    ?.addEventListener("click", () => closeModal("modalReminder"));
  document
    .getElementById("modalReminderSave")
    ?.addEventListener("click", saveReminder);

  initGenericDatePicker(reminderDateCfg);

  /* فیلترها */
  document.querySelectorAll(".filter-btn[data-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      State.reminderFilter = btn.dataset.filter;
      renderReminders();
    });
  });
}

const reminderDateCfg = {
  toggleId: "reminderDateToggle",
  panelId: "reminderDateCalPanel",
  labelId: "reminderDateCalLabel",
  prevId: "reminderDateCalPrev",
  nextId: "reminderDateCalNext",
  daysId: "reminderDateCalDays",
  hiddenId: "reminderDate",
  displayId: "reminderDateDisplay",
};

function saveReminder() {
  const title = getValue("reminderTitle").trim();
  if (!title) {
    showToast("عنوان یادآوری را وارد کنید", "error");
    return;
  }
  const item = {
    id: uid(),
    title,
    date: getValue("reminderDate") || todayISO(),
    time: getValue("reminderTime"),
    category: getValue("reminderCategory"),
    repeat: getValue("reminderRepeat"),
    done: false,
  };
  DB.push("reminders", item);
  showToast("یادآوری ثبت شد 🔔");
  closeModal("modalReminder");
  renderReminders();
  updateBadges();
  renderStickyReminders();
}

function renderReminders() {
  const today = todayISO();
  const seen = getReminderSeen();
  let all = DB.get("reminders", []);

  switch (State.reminderFilter) {
    case "today":
      all = all.filter((r) => r.date === today);
      break;
    case "upcoming":
      all = all.filter((r) => r.date > today && !r.done);
      break;
    case "done":
      all = all.filter((r) => r.done);
      break;
  }

  all.sort((a, b) => {
    const dCmp = (a.date || "").localeCompare(b.date || "");
    if (dCmp !== 0) return dCmp;
    return (a.time || "").localeCompare(b.time || "");
  });

  const { start: weekStart, end: weekEnd } = getActivityWeekRange("calendar");

  const groups = { past: [], current: [], future: [] };
  all.forEach((r) => {
    if (r.date < weekStart) groups.past.push(r);
    else if (r.date > weekEnd) groups.future.push(r);
    else groups.current.push(r);
  });

  const cardHTML = (r) => {
    const isUnseen = r.date <= today && !r.done && !seen.has(r.id);
    return `
    <div class="reminder-card ${r.done ? "done" : ""} ${r.date === today ? "today" : ""}">
      <div class="reminder-card-header">
        <span class="reminder-title">
          ${isUnseen ? '<span class="unseen-dot" title="دیده‌نشده"></span>' : ""}
          ${r.title}
        </span>
        <span class="reminder-cat">${r.category}</span>
      </div>
      <div class="reminder-card-meta">
        <span><i class="fa-regular fa-calendar"></i> ${toJalaliText(r.date)}</span>
        ${r.time ? `<span><i class="fa-regular fa-clock"></i> ${toPersianNum(r.time)}</span>` : ""}
        ${r.repeat !== "none" ? `<span><i class="fa-solid fa-rotate"></i> ${r.repeat}</span>` : ""}
        <span class="reminder-seen-badge ${isUnseen ? "unseen" : "seen"}">
          ${isUnseen ? "دیده‌نشده" : "دیده‌شده"}
        </span>
      </div>
      <div class="reminder-card-actions">
        <button class="btn-${r.done ? "secondary" : "primary"} btn-sm"
                onclick="toggleReminder('${r.id}')">
          ${r.done ? "برگشت" : "انجام شد"}
        </button>
        <button class="icon-btn" onclick="deleteRecord('reminders','${r.id}',()=>{renderReminders();renderStickyReminders();})"
                style="color:var(--color-danger)">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `;
  };

  const fill = (id, list, emptyMsg) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = list.length
      ? list.map(cardHTML).join("")
      : `<div class="empty-state">${emptyMsg}</div>`;
  };

  fill("reminderCardsPast", groups.past, "چیزی عقب نیفتاده 🎉");
  fill("reminderCardsCurrent", groups.current, "این هفته یادآوری‌ای نیست");
  fill("reminderCardsFuture", groups.future, "یادآوری‌ای برای بعد نیست");
}

window.toggleReminder = function (id) {
  const rem = DB.get("reminders", []).find((r) => r.id === id);
  if (!rem) return;
  DB.update("reminders", id, { done: !rem.done });
  renderReminders();
  updateBadges();
  renderStickyReminders();
};

/* ─── دیده‌شده/دیده‌نشده یادآوری‌ها + هشدار پایدار ─── */
function getReminderSeen() {
  return new Set(DB.get("reminder_seen", []));
}

function markReminderSeen(id) {
  const seen = DB.get("reminder_seen", []);
  if (!seen.includes(id)) {
    seen.push(id);
    DB.set("reminder_seen", seen);
  }
}

/** یادآوری‌های سررسیدشده/نشده رو به‌صورت پایدار نشون می‌ده — فقط با
 *  کلیک روی ✕ یا «دیدمش» بسته می‌شن، خودشون بسته نمی‌شن */
function renderStickyReminders() {
  const wrap = document.getElementById("stickyAlerts");
  if (!wrap) return;
  const today = todayISO();
  const seen = getReminderSeen();
  const due = DB.get("reminders", [])
    .filter((r) => !r.done && r.date <= today && !seen.has(r.id))
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  wrap.innerHTML = due
    .map(
      (r) => `
      <div class="sticky-alert" data-id="${r.id}">
        <div class="sticky-alert-icon"><i class="fa-solid fa-bell"></i></div>
        <div class="sticky-alert-body">
          <strong>${r.title}</strong>
          <span>${r.date === today ? "امروز" : toJalaliText(r.date).split(" - ")[1]}${r.time ? " — " + toPersianNum(r.time) : ""}</span>
        </div>
        <div class="sticky-alert-actions">
          <button class="sticky-alert-seen" data-id="${r.id}">دیدمش</button>
          <button class="sticky-alert-close" data-id="${r.id}" title="بستن">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>`,
    )
    .join("");
}

function initStickyReminders() {
  document.getElementById("stickyAlerts")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".sticky-alert-seen, .sticky-alert-close");
    if (!btn) return;
    markReminderSeen(btn.dataset.id);
    renderStickyReminders();
    if (State.currentComp === "comp-reminders") renderReminders();
    renderNotifDropdown();
  });
}

/* ═══════════════════════════════════════════
   ۱۱. تقویم
═══════════════════════════════════════════ */
const LIFE_EVENT_ICONS = {
  تولد: "fa-cake-candles",
  نامزدی: "fa-ring",
  ازدواج: "fa-champagne-glasses",
  "اولین قرار": "fa-heart",
  "خاطره عاشقانه": "fa-envelope-open-text",
  طلاق: "fa-heart-crack",
  فوت: "fa-candle-holder",
  مصیبت: "fa-cloud-rain",
  سایر: "fa-star",
};

/* ─── قفل مخصوص تقویم شخصی — جدا از قفل کل برنامه، هر بار لود بشه دوباره می‌پرسه ─── */
function getCalendarPrivacy() {
  return DB.get("calendar_privacy", { pinHash: null });
}
function saveCalendarPrivacy(cfg) {
  DB.set("calendar_privacy", cfg);
}

function checkCalendarLock() {
  const overlay = document.getElementById("calendarLockOverlay");
  const content = document.getElementById("calendarContent");
  const changeBtn = document.getElementById("btn-change-calendar-pin");
  if (!overlay || !content) return;

  const cfg = getCalendarPrivacy();
  content.classList.add("blurred");
  overlay.classList.remove("hidden");
  changeBtn?.classList.add("hidden");
  document.getElementById("btn-quick-lock-calendar")?.classList.add("hidden");

  const enterBox = document.getElementById("calendarLockEnterBox");
  const setupBox = document.getElementById("calendarLockSetupBox");
  setValue("calendarLockPin", "");
  setValue("calendarLockNew1", "");
  setValue("calendarLockNew2", "");
  setEl("calendarLockError", "");
  setEl("calendarLockSetupError", "");

  if (!cfg.pinHash) {
    enterBox?.classList.add("hidden");
    setupBox?.classList.remove("hidden");
  } else {
    setupBox?.classList.add("hidden");
    enterBox?.classList.remove("hidden");
  }
}

function unlockCalendarContent() {
  document.getElementById("calendarLockOverlay")?.classList.add("hidden");
  document.getElementById("calendarContent")?.classList.remove("blurred");
  document.getElementById("btn-change-calendar-pin")?.classList.remove("hidden");
  document.getElementById("btn-quick-lock-calendar")?.classList.remove("hidden");
}

function initCalendarLock() {
  document.getElementById("btn-calendar-set-pin")?.addEventListener("click", async () => {
    const p1 = getValue("calendarLockNew1").trim();
    const p2 = getValue("calendarLockNew2").trim();
    if (!p1 || p1.length < 4 || p1.length > 16 || !/^\d+$/.test(p1)) {
      setEl("calendarLockSetupError", "رمز باید ۴ تا ۱۶ رقم باشه");
      return;
    }
    if (p1 !== p2) {
      setEl("calendarLockSetupError", "دو رمز یکی نیستن");
      return;
    }
    saveCalendarPrivacy({ pinHash: await hashPin(p1) });
    unlockCalendarContent();
    showToast("رمز این بخش ذخیره شد 🔒");
  });

  document.getElementById("btn-calendar-unlock")?.addEventListener("click", async () => {
    const val = getValue("calendarLockPin").trim();
    const cfg = getCalendarPrivacy();
    if (!val) return;
    const hash = await hashPin(val);
    if (hash === cfg.pinHash) {
      unlockCalendarContent();
    } else {
      setEl("calendarLockError", "رمز اشتباهه");
      setValue("calendarLockPin", "");
    }
  });

  document.getElementById("calendarLockPin")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("btn-calendar-unlock")?.click();
  });

  document.getElementById("btn-change-calendar-pin")?.addEventListener("click", () => {
    checkCalendarLock();
    document.getElementById("calendarLockEnterBox")?.classList.add("hidden");
    document.getElementById("calendarLockSetupBox")?.classList.remove("hidden");
  });

  /* قفل سریع: برای وقتی یهو کسی اومد — فوری این بخش رو می‌بنده و می‌بره خانه،
     بدون این‌که منتظر بمونه کاربر دوباره وارد این صفحه بشه */
  document.getElementById("btn-quick-lock-calendar")?.addEventListener("click", () => {
    checkCalendarLock();
    navigateTo("comp-dashboard-home");
  });
}

function initCalendar() {
  const t = toJalali(todayISO());
  State.calYear = t.year;
  State.calMonth = t.month;
  State.calSelectedDate = todayISO();
  State.lifeEventPhotosDraft = [];
  State.editingLifeEventId = null;

  document.getElementById("calPrev")?.addEventListener("click", () => {
    State.calMonth--;
    if (State.calMonth < 1) {
      State.calMonth = 12;
      State.calYear--;
    }
    renderCalendar();
  });
  document.getElementById("calNext")?.addEventListener("click", () => {
    State.calMonth++;
    if (State.calMonth > 12) {
      State.calMonth = 1;
      State.calYear++;
    }
    renderCalendar();
  });

  document.getElementById("calDays")?.addEventListener("click", (e) => {
    const cell = e.target.closest(".cal-day[data-date]");
    if (!cell) return;
    openDayEventsModal(cell.dataset.date);
  });

  document
    .getElementById("modalDayEventsClose")
    ?.addEventListener("click", () => closeModal("modalDayEvents"));

  document.getElementById("btn-add-life-event")?.addEventListener("click", () => {
    State.editingLifeEventId = null;
    document.getElementById("lifeEventForm")?.classList.remove("hidden");
    document.getElementById("btn-add-life-event")?.classList.add("hidden");
    resetLifeEventForm();
  });
  document
    .getElementById("btn-cancel-life-event")
    ?.addEventListener("click", () => {
      document.getElementById("lifeEventForm")?.classList.add("hidden");
      document.getElementById("btn-add-life-event")?.classList.remove("hidden");
    });

  document
    .getElementById("lifeEventPhotoInput")
    ?.addEventListener("change", async (e) => {
      const files = [...(e.target.files || [])];
      for (const file of files) {
        try {
          const dataUrl = await resizeImageFile(file, 1000);
          State.lifeEventPhotosDraft.push(dataUrl);
        } catch {
          showToast("یکی از عکس‌ها قابل خوندن نبود", "error");
        }
      }
      renderLifeEventPhotoRow();
      e.target.value = "";
    });

  document.getElementById("lifeEventPhotoRow")?.addEventListener("click", (e) => {
    const rm = e.target.closest(".photo-thumb-remove");
    if (!rm) return;
    State.lifeEventPhotosDraft.splice(Number(rm.dataset.idx), 1);
    renderLifeEventPhotoRow();
  });

  document
    .getElementById("btn-save-life-event")
    ?.addEventListener("click", saveLifeEvent);

  document.getElementById("dayEventsList")?.addEventListener("click", (e) => {
    const delBtn = e.target.closest(".life-event-del");
    if (delBtn) {
      deleteLifeEvent(delBtn.dataset.id);
      return;
    }
    const editBtn = e.target.closest(".life-event-edit");
    if (editBtn) {
      editLifeEvent(editBtn.dataset.id);
      return;
    }
    const thumb = e.target.closest(".photo-thumb-view");
    if (thumb) {
      const keys = JSON.parse(thumb.dataset.keys || "[]");
      openLightbox(keys, Number(thumb.dataset.index || 0));
      return;
    }
    const histBtn = e.target.closest(".life-event-history-btn");
    if (histBtn) {
      openNoteHistory(histBtn.dataset.id);
    }
  });

  document
    .getElementById("btn-view-note-history")
    ?.addEventListener("click", () => {
      if (State.editingLifeEventId) openNoteHistory(State.editingLifeEventId);
    });

  /* لایت‌باکس */
  document
    .getElementById("lightboxClose")
    ?.addEventListener("click", () => closeModal("modalLightbox"));
  document.getElementById("lightboxPrev")?.addEventListener("click", () => {
    State.lightboxIndex =
      (State.lightboxIndex - 1 + State.lightboxPhotos.length) %
      State.lightboxPhotos.length;
    renderLightbox();
  });
  document.getElementById("lightboxNext")?.addEventListener("click", () => {
    State.lightboxIndex = (State.lightboxIndex + 1) % State.lightboxPhotos.length;
    renderLightbox();
  });
  document.getElementById("lightboxImg")?.addEventListener("click", (e) => {
    e.target.classList.toggle("zoomed");
  });

  document
    .getElementById("modalNoteHistoryClose")
    ?.addEventListener("click", () => closeModal("modalNoteHistory"));

  initCalendarLock();
  renderCalendar();
}

function renderLifeEventPhotoRow() {
  const wrap = document.getElementById("lifeEventPhotoRow");
  if (!wrap) return;
  wrap.innerHTML = State.lifeEventPhotosDraft
    .map(
      (src, i) => `
      <div class="photo-thumb">
        <img src="${src}" />
        <button type="button" class="photo-thumb-remove" data-idx="${i}">✕</button>
      </div>`,
    )
    .join("");
}

function resetLifeEventForm() {
  State.lifeEventPhotosDraft = [];
  setEl("lifeEventFormTitle", "رویداد جدید");
  setValue("lifeEventType", "تولد");
  setValue("lifeEventTitle", "");
  setValue("lifeEventNote", "");
  document.getElementById("btn-view-note-history")?.classList.add("hidden");
  renderLifeEventPhotoRow();
}

function renderCalendar() {
  const jy = State.calYear;
  const jm = State.calMonth;
  setEl("calMonthLabel", `${JALALI_MONTHS[jm - 1]} ${toPersianNum(jy)}`);

  const eventsByDate = new Map();
  DB.get("calendar_events", []).forEach((ev) => {
    if (!eventsByDate.has(ev.date)) eventsByDate.set(ev.date, []);
    eventsByDate.get(ev.date).push({
      title: ev.title,
      category: ev.type,
      icon: LIFE_EVENT_ICONS[ev.type] || "fa-star",
    });
  });

  const daysEl = document.getElementById("calDays");
  if (daysEl) {
    daysEl.innerHTML = buildMonthGridHTML(
      jy,
      jm,
      State.calSelectedDate,
      eventsByDate,
      { big: true },
    );
  }
}

function openDayEventsModal(iso) {
  State.calSelectedDate = iso;
  setEl("dayEventsTitle", "رویدادهای " + toJalaliText(iso));
  document.getElementById("lifeEventForm")?.classList.add("hidden");
  document.getElementById("btn-add-life-event")?.classList.remove("hidden");
  State.editingLifeEventId = null;
  renderDayEventsList(iso);
  openModal("modalDayEvents");
  renderCalendar();
}

async function renderDayEventsList(iso) {
  const listEl = document.getElementById("dayEventsList");
  if (!listEl) return;
  const events = DB.get("calendar_events", []).filter((e) => e.date === iso);

  if (!events.length) {
    listEl.innerHTML =
      '<tr><td colspan="5" class="empty-state">هنوز رویدادی برای این روز ثبت نشده.</td></tr>';
    return;
  }

  listEl.innerHTML = events
    .map((ev) => {
      const keys = ev.photoKeys || [];
      const keysJson = JSON.stringify(keys).replace(/"/g, "&quot;");
      return `
      <tr>
        <td>
          <i class="fa-solid ${LIFE_EVENT_ICONS[ev.type] || "fa-star"}"
             style="color:${getCategoryColor(ev.type)}"></i>
          ${ev.type}
        </td>
        <td><strong>${ev.title}</strong></td>
        <td>
          <div class="photo-thumb-row" data-event="${ev.id}">
            ${keys
              .map(
                (k, i) => `
              <div class="photo-thumb-mini photo-thumb-view" data-keys="${keysJson}" data-index="${i}" data-key="${k}">
                <img class="lazy-idb-img" data-key="${k}" />
              </div>`,
              )
              .join("")}
            ${!keys.length ? "—" : ""}
          </div>
        </td>
        <td class="row-subnote">
          ${ev.note ? ev.note.slice(0, 60) + (ev.note.length > 60 ? "…" : "") : "—"}
          ${
            ev.noteHistory && ev.noteHistory.length
              ? `<button class="link-btn life-event-history-btn" data-id="${ev.id}">
                  <i class="fa-solid fa-clock-rotate-left"></i> ${toPersianNum(ev.noteHistory.length)} نسخه‌ی قبلی
                </button>`
              : ""
          }
        </td>
        <td>
              <div class="actions-cell">
          <button class="icon-btn life-event-edit" data-id="${ev.id}" title="ویرایش">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="icon-btn life-event-del" data-id="${ev.id}" title="حذف" style="color:var(--color-danger)">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
            </td>
      </tr>`;
    })
    .join("");

  /* عکس‌های ریز جدول رو async از IndexedDB بارگذاری کن */
  listEl.querySelectorAll(".lazy-idb-img[data-key]").forEach(async (img) => {
    try {
      const dataUrl = await window.Utils?.idbGetPhoto(img.dataset.key);
      if (dataUrl) img.src = dataUrl;
    } catch {
      /* عکس در دسترس نبود */
    }
  });
}

async function editLifeEvent(id) {
  const ev = DB.get("calendar_events", []).find((e) => e.id === id);
  if (!ev) return;
  State.editingLifeEventId = id;
  setEl("lifeEventFormTitle", "ویرایش رویداد");
  setValue("lifeEventType", ev.type);
  setValue("lifeEventTitle", ev.title);
  setValue("lifeEventNote", ev.note || "");
  document
    .getElementById("btn-view-note-history")
    ?.classList.toggle("hidden", !(ev.noteHistory && ev.noteHistory.length));

  State.lifeEventPhotosDraft = [];
  for (const key of ev.photoKeys || []) {
    try {
      const dataUrl = await window.Utils?.idbGetPhoto(key);
      if (dataUrl) State.lifeEventPhotosDraft.push(dataUrl);
    } catch {
      /* رد شو */
    }
  }
  renderLifeEventPhotoRow();

  document.getElementById("lifeEventForm")?.classList.remove("hidden");
  document.getElementById("btn-add-life-event")?.classList.add("hidden");
}

async function saveLifeEvent() {
  const title = getValue("lifeEventTitle").trim();
  if (!title) {
    showToast("یه عنوان برای این رویداد بنویس", "error");
    return;
  }
  const iso = State.calSelectedDate;
  const newNote = getValue("lifeEventNote").trim();
  const isEdit = !!State.editingLifeEventId;
  const events = DB.get("calendar_events", []);
  const existing = isEdit
    ? events.find((e) => e.id === State.editingLifeEventId)
    : null;

  /* اگه یادداشت عوض شده، نسخه‌ی قبلی رو توی تاریخچه نگه دار */
  const noteHistory = existing?.noteHistory ? [...existing.noteHistory] : [];
  if (existing && existing.note && existing.note !== newNote) {
    noteHistory.push({ text: existing.note, editedAt: new Date().toISOString() });
  }

  /* عکس‌های قبلی که دیگه توی draft نیستن رو از IndexedDB پاک کن */
  const oldKeys = existing?.photoKeys || [];
  const newPhotoKeys = [];
  for (let i = 0; i < State.lifeEventPhotosDraft.length; i++) {
    const dataUrl = State.lifeEventPhotosDraft[i];
    /* برای سادگی، هر بار ذخیره، عکس‌های فعلیِ فرم با کلید تازه ذخیره می‌شن
       و کلیدهای قبلی پاک می‌شن (به‌جای diff کردن تک‌تک عکس‌ها) */
    const key = `life-event:${iso}_${Date.now()}_${i}`;
    if (window.Utils?.idbSetPhoto) {
      try {
        await window.Utils.idbSetPhoto(key, dataUrl);
        newPhotoKeys.push(key);
      } catch {
        /* اگه ذخیره‌ی این عکس شکست خورد، رد شو */
      }
    }
  }
  /* کلیدهای قدیمی که دیگه استفاده نمی‌شن رو پاک کن */
  if (window.Utils?.idbDeletePhoto) {
    for (const k of oldKeys) {
      try {
        await window.Utils.idbDeletePhoto(k);
      } catch {
        /* رد شو */
      }
    }
  }

  const item = {
    id: isEdit ? State.editingLifeEventId : uid(),
    date: iso,
    type: getValue("lifeEventType"),
    title,
    note: newNote,
    noteHistory,
    photoKeys: newPhotoKeys,
    createdAt: existing?.createdAt || new Date().toISOString(),
  };

  if (isEdit) {
    DB.update("calendar_events", item.id, item);
    showToast("رویداد ویرایش شد ✅");
  } else {
    DB.push("calendar_events", item);
    showToast("رویداد ثبت شد 💜");
  }

  document.getElementById("lifeEventForm")?.classList.add("hidden");
  document.getElementById("btn-add-life-event")?.classList.remove("hidden");
  State.editingLifeEventId = null;
  renderDayEventsList(iso);
  renderCalendar();
}

async function deleteLifeEvent(id) {
  const ok = await confirmDialog({
    title: "حذف رویداد",
    message: "این رویداد (همراه با عکس‌هاش) حذف بشه؟",
    confirmText: "حذف رویداد",
  });
  if (!ok) return;
  const events = DB.get("calendar_events", []);
  const item = events.find((e) => e.id === id);
  if (item?.photoKeys?.length && window.Utils?.idbDeletePhoto) {
    for (const key of item.photoKeys) {
      try {
        await window.Utils.idbDeletePhoto(key);
      } catch {
        /* حذف عکس هم اگه شکست بخوره، خود رویداد باید حذف بشه */
      }
    }
  }
  DB.set(
    "calendar_events",
    events.filter((e) => e.id !== id),
  );
  showToast("رویداد حذف شد", "info");
  renderDayEventsList(State.calSelectedDate);
  renderCalendar();
}

/* ─── آلبوم/لایت‌باکس ─── */
async function openLightbox(keys, index) {
  State.lightboxPhotos = keys;
  State.lightboxIndex = index;
  openModal("modalLightbox");
  await renderLightbox();
}

async function renderLightbox() {
  const key = State.lightboxPhotos[State.lightboxIndex];
  const img = document.getElementById("lightboxImg");
  if (img) {
    img.classList.remove("zoomed");
    img.src = "";
    try {
      img.src = (await window.Utils?.idbGetPhoto(key)) || "";
    } catch {
      /* عکس در دسترس نبود */
    }
  }
  setEl(
    "lightboxCounter",
    `${toPersianNum(State.lightboxIndex + 1)} از ${toPersianNum(State.lightboxPhotos.length)}`,
  );
  const multi = State.lightboxPhotos.length > 1;
  document.getElementById("lightboxPrev")?.classList.toggle("hidden", !multi);
  document.getElementById("lightboxNext")?.classList.toggle("hidden", !multi);
}

/* ─── تاریخچه‌ی یادداشت ─── */
function openNoteHistory(id) {
  const ev = DB.get("calendar_events", []).find((e) => e.id === id);
  const listEl = document.getElementById("noteHistoryList");
  if (!listEl) return;
  const history = ev?.noteHistory || [];
  if (!history.length) {
    listEl.innerHTML = '<p class="empty-state">نسخه‌ی قبلی‌ای نیست.</p>';
  } else {
    listEl.innerHTML = [...history]
      .reverse()
      .map(
        (h) => `
        <div class="note-history-item">
          <div class="note-history-date">${toJalaliText(h.editedAt.slice(0, 10))}</div>
          <p>${h.text}</p>
        </div>`,
      )
      .join("");
  }
  openModal("modalNoteHistory");
}

/* ═══════════════════════════════════════════
   ۱۲. خانواده
═══════════════════════════════════════════ */

/* ═══════════════════════════════════════════
   ۱۲. خانواده
═══════════════════════════════════════════ */
const familyDateCfg = {
  toggleId: "familyDateToggle",
  panelId: "familyDateCalPanel",
  labelId: "familyDateCalLabel",
  prevId: "familyDateCalPrev",
  nextId: "familyDateCalNext",
  daysId: "familyDateCalDays",
  hiddenId: "familyDate",
  displayId: "familyDateDisplay",
};

const FAMILY_ICONS = {
  تولد: "fa-cake-candles",
  سالگرد: "fa-ring",
  دورهمی: "fa-utensils",
  سفر: "fa-suitcase-rolling",
  مراسم: "fa-candle-holder",
  سایر: "fa-star",
};

function initFamily() {
  document.getElementById("btn-add-family")?.addEventListener("click", () => {
    State.editingId = null;
    setValue("familyType", "تولد");
    setValue("familyPriority", "عادی");
    setValue("familyTitle", "");
    setValue("familyMembers", "");
    setValue("familyNote", "");
    setGenericDate(familyDateCfg, todayISO());
    openModal("modalFamily");
  });
  document
    .getElementById("modalFamilyClose")
    ?.addEventListener("click", () => closeModal("modalFamily"));
  document
    .getElementById("modalFamilyCancel")
    ?.addEventListener("click", () => closeModal("modalFamily"));
  document
    .getElementById("modalFamilySave")
    ?.addEventListener("click", saveFamily);

  initGenericDatePicker(familyDateCfg);

  document.getElementById("familyTableBody")?.addEventListener("click", (e) => {
    const delBtn = e.target.closest(".family-del");
    if (delBtn) deleteRecord("family", delBtn.dataset.id, renderFamily);
  });
}

function saveFamily() {
  const title = getValue("familyTitle").trim();
  if (!title) {
    showToast("عنوان رویداد را وارد کنید", "error");
    return;
  }
  const item = {
    id: uid(),
    type: getValue("familyType"),
    priority: getValue("familyPriority"),
    title,
    members: getValue("familyMembers"),
    date: getValue("familyDate") || todayISO(),
    note: getValue("familyNote").trim(),
  };
  DB.push("family", item);
  closeModal("modalFamily");
  renderFamily();
  showToast("رویداد خانوادگی ثبت شد 👨‍👩‍👧");
}

const FAMILY_PRIORITY_COLOR = {
  عادی: "#94a3b8",
  مهم: "#f59e0b",
  "خیلی مهم": "#dc2626",
};

function renderFamily() {
  const all = DB.get("family", []).slice().reverse();
  const tbody = document.getElementById("familyTableBody");
  if (!tbody) return;
  tbody.innerHTML = all.length
    ? all
        .map((f) => {
          const pColor = FAMILY_PRIORITY_COLOR[f.priority] || "#94a3b8";
          return `
        <tr>
          <td><i class="fa-solid ${FAMILY_ICONS[f.type] || "fa-star"}" style="color:var(--color-primary)"></i> ${f.type || "—"}</td>
          <td><strong>${f.title}</strong></td>
          <td>${f.members || "—"}</td>
          <td><span class="cat-badge" style="background:${pColor}20;color:${pColor}">${f.priority || "عادی"}</span></td>
          <td>${toJalaliText(f.date)}</td>
          <td class="row-subnote">${f.note || "—"}</td>
          <td>
            <button class="icon-btn family-del" data-id="${f.id}"
                    style="color:var(--color-danger)">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
        })
        .join("")
    : '<tr><td colspan="7" class="empty-state">رویدادی ثبت نشده</td></tr>';
}

/* ═══════════════════════════════════════════
   ۱۳. تفریح
═══════════════════════════════════════════ */
const leisureDateCfg = {
  toggleId: "leisureDateToggle",
  panelId: "leisureDateCalPanel",
  labelId: "leisureDateCalLabel",
  prevId: "leisureDateCalPrev",
  nextId: "leisureDateCalNext",
  daysId: "leisureDateCalDays",
  hiddenId: "leisureDate",
  displayId: "leisureDateDisplay",
};

function renderStarPicker(selected) {
  document.querySelectorAll("#leisureStarPicker i").forEach((star) => {
    star.classList.toggle("filled", Number(star.dataset.star) <= selected);
  });
}

function initLeisure() {
  document.getElementById("btn-add-leisure")?.addEventListener("click", () => {
    openLeisureModal(null);
  });
  document
    .getElementById("modalLeisureClose")
    ?.addEventListener("click", () => closeModal("modalLeisure"));
  document
    .getElementById("modalLeisureCancel")
    ?.addEventListener("click", () => closeModal("modalLeisure"));
  document
    .getElementById("modalLeisureSave")
    ?.addEventListener("click", saveLeisure);

  initGenericDatePicker(leisureDateCfg);

  document.getElementById("leisureStarPicker")?.addEventListener("click", (e) => {
    const star = e.target.closest("[data-star]");
    if (!star) return;
    const val = Number(star.dataset.star);
    setValue("leisureRating", String(val));
    renderStarPicker(val);
  });

  document.getElementById("leisureCardsGrid")?.addEventListener("click", (e) => {
    const delBtn = e.target.closest(".leisure-del");
    if (delBtn) {
      e.stopPropagation();
      deleteRecord("leisure", delBtn.dataset.id, renderLeisure);
      return;
    }
    const card = e.target.closest(".leisure-edit[data-id]");
    if (card) openLeisureModal(card.dataset.id);
  });

  /* فیلتر tag */
  document.getElementById("leisureTags")?.addEventListener("click", (e) => {
    const tag = e.target.closest(".leisure-tag");
    if (!tag) return;
    document
      .querySelectorAll(".leisure-tag")
      .forEach((t) => t.classList.remove("active"));
    tag.classList.add("active");
    State.leisureFilter = tag.dataset.type;
    renderLeisure();
  });
}

function openLeisureModal(id) {
  State.editingLeisureId = id;
  const item = id ? DB.get("leisure", []).find((l) => l.id === id) : null;
  setValue("leisureTitle", item?.title || "");
  setValue("leisureType", item?.type || "فیلم");
  const rating = item?.rating ?? 0;
  setValue("leisureRating", String(rating));
  renderStarPicker(rating);
  setValue("leisureNote", item?.note || "");
  setGenericDate(leisureDateCfg, item?.date || todayISO());
  openModal("modalLeisure");
}

function saveLeisure() {
  const title = getValue("leisureTitle").trim();
  if (!title) {
    showToast("عنوان را وارد کنید", "error");
    return;
  }
  const item = {
    id: State.editingLeisureId || uid(),
    title,
    type: getValue("leisureType"),
    rating: Number(getValue("leisureRating")) || 0,
    date: getValue("leisureDate") || todayISO(),
    note: getValue("leisureNote").trim(),
  };
  if (State.editingLeisureId) {
    DB.update("leisure", State.editingLeisureId, item);
    showToast("فعالیت ویرایش شد ✅");
  } else {
    DB.push("leisure", item);
    showToast("فعالیت تفریحی ثبت شد 🎬");
  }
  State.editingLeisureId = null;
  closeModal("modalLeisure");
  renderLeisure();
}

function renderLeisure() {
  let all = DB.get("leisure", []);
  if (State.leisureFilter)
    all = all.filter((l) => l.type === State.leisureFilter);
  all = all.slice().reverse();

  const LEISURE_ICONS = {
    فیلم: "🎬",
    کتاب: "📖",
    موسیقی: "🎵",
    گردش: "🌿",
    بازی: "🎮",
    سایر: "✨",
  };

  const grid = document.getElementById("leisureCardsGrid");
  if (!grid) return;
  grid.innerHTML = all.length
    ? all
        .map(
          (l) => `
        <div class="leisure-card leisure-edit" data-id="${l.id}">
          <div class="leisure-card-icon">${LEISURE_ICONS[l.type] || "✨"}</div>
          <div class="leisure-card-body">
            <strong>${l.title}</strong>
            <span>${l.type}</span>
            ${l.note ? `<span class="leisure-card-note">${l.note}</span>` : ""}
          </div>
          <div class="leisure-card-footer">
            <span>${"⭐".repeat(l.rating || 0)}${"☆".repeat(5 - (l.rating || 0))}</span>
            <span style="font-size:.75rem;color:var(--text-secondary)">${toJalaliText(l.date)}</span>
            <button class="icon-btn leisure-del" data-id="${l.id}"
                    style="color:var(--color-danger)">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      `,
        )
        .join("")
    : '<div class="empty-state">فعالیتی ثبت نشده</div>';
}

/* ═══════════════════════════════════════════
   ۱۴. مالی
═══════════════════════════════════════════ */
function initFinance() {
  document.getElementById("btn-add-finance")?.addEventListener("click", () => {
    setGenericDate(finDateCfg, todayISO());
    openModal("modalFinance");
  });
  document
    .getElementById("modalFinanceClose")
    ?.addEventListener("click", () => closeModal("modalFinance"));
  document
    .getElementById("modalFinanceCancel")
    ?.addEventListener("click", () => closeModal("modalFinance"));
  document
    .getElementById("modalFinanceSave")
    ?.addEventListener("click", saveFinance);

  initGenericDatePicker(finDateCfg);
  attachAmountFormatting("finAmount");

  document
    .getElementById("financeSearch")
    ?.addEventListener("input", renderFinance);
  document
    .getElementById("financeFilter")
    ?.addEventListener("change", renderFinance);

  /* فرمت‌دهی خودکار مبلغ */
  const amtInput = document.getElementById("finAmount");
  if (amtInput) {
    amtInput.addEventListener("input", () => {
      const raw = amtInput.value.replace(/\D/g, "");
      if (raw) amtInput.value = Number(raw).toLocaleString();
    });
  }
}

const finDateCfg = {
  toggleId: "finDateToggle",
  panelId: "finDateCalPanel",
  labelId: "finDateCalLabel",
  prevId: "finDateCalPrev",
  nextId: "finDateCalNext",
  daysId: "finDateCalDays",
  hiddenId: "finDate",
  displayId: "finDateDisplay",
};

function saveFinance() {
  const title = getValue("finTitle").trim();
  if (!title) {
    showToast("عنوان هزینه را وارد کنید", "error");
    return;
  }
  const raw = getValue("finAmount").replace(/,/g, "");
  if (!raw || isNaN(raw)) {
    showToast("مبلغ را وارد کنید", "error");
    return;
  }

  const item = {
    id: uid(),
    title,
    category: getValue("finCategory"),
    amount: Number(raw),
    date: getValue("finDate") || todayISO(),
    recurring: getValue("finRecurring"),
    note: getValue("finNote"),
  };
  DB.push("finance", item);

  /* هزینه‌های تکرارشونده (اجاره، شهریه، بیمه...) یادآوری برای قسط بعدی می‌گیرن
     چون عقب‌افتادنشون معمولاً مشکل‌ساز می‌شه */
  if (item.recurring === "monthly" || item.recurring === "yearly") {
    const nextDate =
      item.recurring === "monthly"
        ? dateByOffset(30)
        : dateByOffset(365);
    DB.push("reminders", {
      id: uid(),
      title: "پرداخت: " + item.title,
      date: nextDate,
      time: "09:00",
      category: "هزینه",
      repeat: "none",
      done: false,
    });
    showToast("یادآوریِ قسط بعدی هم ساخته شد 🔔", "info");
  }

  showToast("هزینه ثبت شد 💰");
  closeModal("modalFinance");
  renderFinance();
}

function renderFinance() {
  const today = todayISO();
  const month = today.slice(0, 7);
  const search = getValue("financeSearch").trim().toLowerCase();
  const filter = getValue("financeFilter");

  const all = DB.get("finance", [])
    .filter(
      (f) =>
        (!search || f.title.toLowerCase().includes(search)) &&
        (!filter || f.category === filter),
    )
    .slice()
    .reverse();

  /* آمار ماهانه */
  const monthly = DB.get("finance", []).filter((f) => f.date.startsWith(month));
  setEl(
    "finTotalMonth",
    toPersianNum(
      monthly.reduce((a, f) => a + (Number(f.amount) || 0), 0).toLocaleString(),
    ),
  );
  setEl(
    "finSport",
    toPersianNum(
      monthly
        .filter((f) => ["ورزش", "یوگا", "باشگاه"].includes(f.category))
        .reduce((a, f) => a + (Number(f.amount) || 0), 0)
        .toLocaleString(),
    ),
  );
  setEl(
    "finHealth",
    toPersianNum(
      monthly
        .filter((f) => ["دکتر", "دارو"].includes(f.category))
        .reduce((a, f) => a + (Number(f.amount) || 0), 0)
        .toLocaleString(),
    ),
  );
  setEl(
    "finOther",
    toPersianNum(
      monthly
        .filter(
          (f) =>
            !["ورزش", "یوگا", "باشگاه", "دکتر", "دارو"].includes(f.category),
        )
        .reduce((a, f) => a + (Number(f.amount) || 0), 0)
        .toLocaleString(),
    ),
  );

  /* جدول */
  const tbody = document.getElementById("financeTableBody");
  if (tbody) {
    tbody.innerHTML = all.length
      ? all
          .map(
            (f) => `
          <tr>
            <td>${f.title}</td>
            <td><span class="cat-badge" style="background:${FINANCE_COLORS[f.category] || "#94a3b8"}20;
                color:${FINANCE_COLORS[f.category] || "#94a3b8"}">${f.category}</span></td>
            <td>${toJalaliText(f.date)}</td>
            <td style="font-weight:600">${toPersianNum(Number(f.amount).toLocaleString())}</td>
            <td>${f.note || "—"}</td>
            <td>
              <button class="icon-btn" onclick="deleteRecord('finance','${f.id}',renderFinance)"
                      style="color:var(--color-danger)">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>
        `,
          )
          .join("")
      : '<tr><td colspan="6" class="empty-state">هزینه‌ای ثبت نشده</td></tr>';
  }

  renderFinanceCharts(monthly);
}

function renderFinanceCharts(monthly) {
  /* bar — هزینه روزانه ماه جاری */
  const dayMap = {};
  monthly.forEach((f) => {
    dayMap[f.date] = (dayMap[f.date] || 0) + (Number(f.amount) || 0);
  });
  /* قبلاً dayData از Object.values() (به ترتیب درج) می‌اومد ولی dayLabels
     از کلیدهای مرتب‌شده — اگه ترتیب درج با ترتیب تاریخ یکی نبود، عدد هر
     روز به برچسبِ روزِ اشتباه می‌چسبید. الان هر دو از همون کلیدهای
     مرتب‌شده می‌سازیم. */
  const sortedKeys = Object.keys(dayMap).sort();
  const dayLabels = sortedKeys.map((d) => toPersianNum(d.slice(8)));
  const dayData = sortedKeys.map((k) => dayMap[k]);
  const fullDates = [...sortedKeys].reverse();
  dayLabels.reverse();
  dayData.reverse();

  makeChart("chartFinanceBar", {
    type: "bar",
    data: {
      labels: dayLabels,
      datasets: [
        {
          label: "هزینه (تومان)",
          data: dayData,
          backgroundColor: "rgba(124,58,237,.7)",
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) =>
              items[0]
                ? toJalaliText(fullDates[items[0].dataIndex])
                : "",
            label: (ctx) => `هزینه: ${toPersianNum(ctx.parsed.y.toLocaleString())} تومان`,
          },
        },
      },
      scales: {
        y: { beginAtZero: true, ticks: { font: { family: "Vazirmatn" } } },
        x: {
          grid: { display: false },
          ticks: { font: { size: 9 } },
          title: {
            display: true,
            text: "روز ماه (برای تاریخ کامل، نگه‌دار یا لمس کن)",
            font: { size: 9 },
          },
        },
      },
    },
  });

  /* pie — دسته‌بندی */
  const catMap = {};
  monthly.forEach((f) => {
    catMap[f.category] = (catMap[f.category] || 0) + (Number(f.amount) || 0);
  });
  const catLabels = Object.keys(catMap);
  const catData = Object.values(catMap);
  const catColors = catLabels.map((c) => FINANCE_COLORS[c] || "#94a3b8");

  makeChart("chartFinancePie", {
    type: "doughnut",
    data: {
      labels: catLabels,
      datasets: [
        {
          data: catData,
          backgroundColor: catColors,
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "60%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { font: { family: "Vazirmatn" }, boxWidth: 12 },
        },
      },
    },
  });
}

/* ═══════════════════════════════════════════
   ۱۴.۵ رویدادها و بازخورد — گزارش یکجای وظیفه/ورزش/دارو/آب
═══════════════════════════════════════════ */
State.eventsRange = "today";

function getFeedbackMap() {
  return DB.get("event_feedback", {});
}

function setFeedback(key, text) {
  const map = getFeedbackMap();
  if (text) map[key] = text;
  else delete map[key];
  DB.set("event_feedback", map);
}

function getRangeForPreset(preset) {
  const today = todayISO();
  if (preset === "week") {
    return { start: dateByOffset(-6), end: today };
  }
  if (preset === "month") {
    const j = toJalali(today);
    const start = fromJalali(j.year, j.month, 1).toISOString().slice(0, 10);
    return { start, end: today };
  }
  return { start: today, end: today }; // امروز
}

function buildReportRows(start, end) {
  const rows = [];
  const feedback = getFeedbackMap();
  const inRange = (d) => d >= start && d <= end;

  DB.get("tasks", [])
    .filter((t) => inRange(t.date))
    .forEach((t) => {
      const key = `task:${t.id}`;
      rows.push({
        date: t.date,
        type: "وظیفه",
        title: t.title,
        meta: t.category || "",
        done: !!t.done,
        statusLabel: t.done ? "انجام‌شده" : "انجام‌نشده",
        key,
        feedback: feedback[key] || "",
      });
    });

  DB.get("sport", [])
    .filter((s) => inRange(s.date))
    .forEach((s) => {
      const key = `sport:${s.id}`;
      rows.push({
        date: s.date,
        type: "ورزش",
        title: s.type || "ورزش",
        meta: `${calcMins(s.start, s.end)} دقیقه`,
        done: true,
        statusLabel: "انجام‌شده",
        key,
        feedback: feedback[key] || "",
      });
    });

  const meds = DB.get("medicine", []).filter((m) => m.active !== false);
  for (
    let d = new Date(start + "T00:00:00Z");
    d.toISOString().slice(0, 10) <= end;
    d.setUTCDate(d.getUTCDate() + 1)
  ) {
    const iso = d.toISOString().slice(0, 10);

    meds.forEach((m) => {
      const taken = DB.get("meds_taken_" + iso, []).includes(m.id);
      const key = `med:${iso}:${m.id}`;
      rows.push({
        date: iso,
        type: "دارو",
        title: m.name,
        meta: m.dose || "",
        done: taken,
        statusLabel: taken ? "خورده‌شده" : "نخورده",
        key,
        feedback: feedback[key] || "",
      });
    });

    const glassCount = DB.get("water_" + iso, []).length;
    const waterKey = `water:${iso}`;
    rows.push({
      date: iso,
      type: "آب",
      title: `${toPersianNum(glassCount)} از ۸ لیوان`,
      meta: "",
      done: glassCount >= 8,
      statusLabel: glassCount >= 8 ? "هدف محقق شد" : "ناقص",
      key: waterKey,
      feedback: feedback[waterKey] || "",
    });
  }

  return rows.sort((a, b) => b.date.localeCompare(a.date));
}

function renderEvents() {
  const { start, end } = getRangeForPreset(State.eventsRange);
  const rows = buildReportRows(start, end);
  const body = document.getElementById("eventsTableBody");
  if (!body) return;

  if (!rows.length) {
    body.innerHTML =
      '<tr class="events-empty-row"><td colspan="6">توی این بازه چیزی برای گزارش نیست</td></tr>';
    return;
  }

  body.innerHTML = rows
    .map(
      (r) => `
      <tr>
        <td>${toJalaliText(r.date).split(" - ")[1] || toPersianNum(r.date)}</td>
        <td><span class="events-type-badge">${r.type}</span></td>
        <td>${r.title}</td>
        <td>${r.meta}</td>
        <td><span class="events-status ${r.done ? "done" : "pending"}">${r.statusLabel}</span></td>
        <td>
          <div class="events-feedback-cell">
            <span class="events-feedback-text ${r.feedback ? "" : "empty"}">
              ${r.feedback || "نوشته نشده"}
            </span>
            <button class="events-feedback-edit" data-key="${r.key}" data-title="${r.title}" title="نوشتن/ویرایش گزارش">
              <i class="fa-solid fa-pen"></i>
            </button>
          </div>
        </td>
      </tr>`,
    )
    .join("");
}

function exportEventsCSV() {
  const { start, end } = getRangeForPreset(State.eventsRange);
  const rows = buildReportRows(start, end);
  const header = ["تاریخ", "نوع", "عنوان", "جزئیات", "وضعیت", "گزارش"];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [header.map(esc).join(",")];
  rows.forEach((r) => {
    lines.push(
      [r.date, r.type, r.title, r.meta, r.statusLabel, r.feedback]
        .map(esc)
        .join(","),
    );
  });
  /* BOM در ابتدای فایل تا اکسل متن فارسی رو درست (UTF-8) نشون بده */
  const csv = "\uFEFF" + lines.join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `گزارش-رویدادها-${todayISO()}.csv`;
  a.click();
  showToast("فایل CSV دانلود شد — مستقیم توی اکسل باز می‌شه 📊");
}

function initEvents() {
  document.getElementById("eventsRangeTabs")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".chart-tab");
    if (!btn) return;
    document
      .querySelectorAll("#eventsRangeTabs .chart-tab")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    State.eventsRange = btn.dataset.range;
    renderEvents();
  });

  document
    .getElementById("btn-events-export")
    ?.addEventListener("click", exportEventsCSV);
  document
    .getElementById("btn-events-print")
    ?.addEventListener("click", () => window.print());

  document.getElementById("eventsTableBody")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".events-feedback-edit");
    if (!btn) return;
    openFeedbackModal(btn.dataset.key, btn.dataset.title, renderEvents);
  });

  document
    .getElementById("modalFeedbackClose")
    ?.addEventListener("click", () => closeModal("modalFeedback"));
  document
    .getElementById("modalFeedbackCancel")
    ?.addEventListener("click", () => closeModal("modalFeedback"));
  document.getElementById("modalFeedbackSave")?.addEventListener("click", () => {
    if (!State.editingFeedbackKey) return;
    setFeedback(State.editingFeedbackKey, getValue("feedbackText").trim());
    closeModal("modalFeedback");
    State.feedbackOnSave?.();
    showToast("گزارش ذخیره شد ✅");
  });
}

/** باز کردن مودال گزارش/بازخورد برای یک آیتم (وظیفه، ورزش، دارو، آب...)
 *  onSave: بعد از ذخیره صدا زده می‌شه تا همون صفحه رفرش بشه */
function openFeedbackModal(key, title, onSave) {
  State.editingFeedbackKey = key;
  State.feedbackOnSave = onSave || null;
  setEl("modalFeedbackTitle", `گزارش / بازخورد — ${title}`);
  setValue("feedbackText", getFeedbackMap()[key] || "");
  openModal("modalFeedback");
}

/* ═══════════════════════════════════════════
   ۱۵. تنظیمات
═══════════════════════════════════════════ */
function initSettings() {
  document
    .getElementById("settings-export")
    ?.addEventListener("click", exportData);
  document
    .getElementById("settings-import")
    ?.addEventListener("change", (e) => importData(e));
  initAutoBackupSettings();
  document.getElementById("btn-open-dev-card")?.addEventListener("click", () => {
    document.getElementById("cal-dev-overlay")?.classList.remove("hidden");
  });
  document.getElementById("cal-dev-close")?.addEventListener("click", () => {
    document.getElementById("cal-dev-overlay")?.classList.add("hidden");
  });
  document.getElementById("cal-dev-overlay")?.addEventListener("click", (e) => {
    if (e.target.id === "cal-dev-overlay") e.target.classList.add("hidden");
  });
  document.getElementById("btn-clear-all")?.addEventListener("click", async () => {
    const first = await confirmDialog({
      title: "پاک‌کردن همه داده‌ها؟",
      message: "تمام اطلاعات این برنامه روی این دستگاه حذف می‌شه.",
      confirmText: "ادامه",
      icon: "fa-triangle-exclamation",
    });
    if (!first) return;
    const second = await confirmDialog({
      title: "آخرین تأیید",
      message: "این عمل برگشت‌پذیر نیست. اگه بکاپ نگرفتی، همه‌چیز از بین می‌ره.",
      confirmText: "بله، همه رو پاک کن",
      icon: "fa-skull-crossbones",
    });
    if (!second) return;
    /* هر کلیدی که این برنامه توی localStorage ساخته رو پاک کن؛
       قبلاً فقط یه لیست ثابت پاک می‌شد و کلیدهای پویا مثل
       water_2026-09-13 یا meds_taken_2026-09-13 جا می‌موندن */
    Object.keys(localStorage)
      .filter((k) => k.startsWith("ana_dashboard_"))
      .forEach((k) => localStorage.removeItem(k));
    sessionStorage.removeItem("lm_unlocked");
    await AvatarStore.clearFile(); /* قبل از wipe — به handle ذخیره‌شده نیاز داره */
    await MusicStore.wipe(); /* کل دیتابیس media رو پاک می‌کنه: موزیک، گالری، handleها */
    showToast("همه داده‌ها پاک شدند", "warning");
    location.reload();
  });

  /* ─── ویرایش پروفایل ─── */
  let pendingSettingsAvatar = null; /* Blob PNG آماده‌ی ذخیره در پوشه‌ی avatar */
  let settingsPreviewUrl = null;
  document
    .getElementById("setProfileAvatarInput")
    ?.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        pendingSettingsAvatar = await AvatarStore.prepare(file);
        if (settingsPreviewUrl) URL.revokeObjectURL(settingsPreviewUrl);
        settingsPreviewUrl = URL.createObjectURL(pendingSettingsAvatar);
        const img = document.getElementById("settingsAvatar");
        if (img) img.src = settingsPreviewUrl;
      } catch {
        showToast("عکس قابل خوندن نبود", "error");
      }
    });

  document.getElementById("btn-save-profile")?.addEventListener("click", async () => {
    const name = document.getElementById("setProfileName")?.value.trim();
    const job = document.getElementById("setProfileJob")?.value || "other";
    const city = document.getElementById("setProfileCity")?.value.trim() || "";
    const appName =
      document.getElementById("setAppName")?.value.trim() || "زندگی‌یار";
    if (!name) {
      showToast("اسم نمی‌تونه خالی باشه", "error");
      return;
    }
    const profile = getProfile() || {};
    const cityChanged = (profile.city || "") !== city;
    profile.name = name;
    profile.job = job;
    profile.city = city;
    profile.appName = appName;
    saveProfile(profile);
    applyProfileToUI();
    renderWelcome();
    showToast("پروفایل ذخیره شد ✅");
    if (cityChanged) reloadWeather();

    /* عکس: یا عکس تازه‌ی انتخاب‌شده، یا انتقال عکس قدیمیِ localStorage */
    let blob = pendingSettingsAvatar;
    if (!blob && profile.avatar && !profile.hasAvatar) {
      try {
        blob = await (await fetch(profile.avatar)).blob();
      } catch {
        blob = null;
      }
    }
    if (blob) {
      const result = await AvatarStore.save(blob);
      finishAvatarSave(blob, result);
      if (result.mode !== "cancelled" && result.mode !== "error") {
        pendingSettingsAvatar = null;
      }
    }
  });

  initDataSourceSettings();
  initCategorySettings();
  initPrivacySettings();
  renderCategoryChips();
  renderHiddenSectionsList();
}

/* ═══════════════════════════════════════════
   ۱۶. اکسپورت / ایمپورت
   (قبلاً اسم توابع با utils.js نمی‌خوند و اکسپورت فقط یه لیست
   ثابت از کلیدها رو می‌گرفت، در نتیجه آب/دارو/پروفایل/دسته‌بندی‌ها
   که با کلیدهای پویا ذخیره می‌شن اصلاً اکسپورت نمی‌شدن)
═══════════════════════════════════════════ */
/* ═══════════════════════════════════════════
   بکاپ خودکار
═══════════════════════════════════════════ */
function getBackupSettings() {
  return DB.get("backup_settings", {
    enabled: false,
    intervalDays: 7,
    lastBackupAt: null,
  });
}

function saveBackupSettings(cfg) {
  DB.set("backup_settings", cfg);
}

function updateBackupStatusUI() {
  const cfg = getBackupSettings();
  const el = document.getElementById("lastBackupText");
  if (el) {
    el.textContent = cfg.lastBackupAt
      ? toJalaliText(cfg.lastBackupAt.slice(0, 10))
      : "هنوز گرفته نشده";
  }
  const toggle = document.getElementById("setAutoBackupEnabled");
  if (toggle) toggle.checked = cfg.enabled;
  const interval = document.getElementById("autoBackupInterval");
  if (interval) interval.value = String(cfg.intervalDays);
}

function initAutoBackupSettings() {
  updateBackupStatusUI();

  document
    .getElementById("setAutoBackupEnabled")
    ?.addEventListener("change", (e) => {
      const cfg = getBackupSettings();
      cfg.enabled = e.target.checked;
      saveBackupSettings(cfg);
    });

  document.getElementById("autoBackupInterval")?.addEventListener("change", (e) => {
    const cfg = getBackupSettings();
    cfg.intervalDays = Number(e.target.value);
    saveBackupSettings(cfg);
  });

  document.getElementById("btn-backup-now")?.addEventListener("click", () => {
    triggerBackupDownload(false);
  });
}

async function triggerBackupDownload(isAuto) {
  const filename = `life-manager-backup_${todayISO()}.json`;
  if (window.Utils?.exportAllData) {
    await window.Utils.exportAllData(filename);
  } else {
    exportData();
  }
  const cfg = getBackupSettings();
  cfg.lastBackupAt = new Date().toISOString();
  saveBackupSettings(cfg);
  updateBackupStatusUI();
  if (isAuto) showToast("بکاپ خودکار گرفته شد 💾", "info");
  else showToast("بکاپ دانلود شد 💾");
}

/** موقع بازکردن برنامه چک می‌کنه که آیا وقت بکاپ خودکار رسیده یا نه */
function checkAutoBackup() {
  const cfg = getBackupSettings();
  if (!cfg.enabled) return;
  const dueMs = (cfg.intervalDays || 7) * 86400000;
  const last = cfg.lastBackupAt ? new Date(cfg.lastBackupAt).getTime() : 0;
  if (Date.now() - last >= dueMs) {
    triggerBackupDownload(true);
  }
}

function exportData() {
  const filename = `life-manager_${todayISO()}.json`;
  if (window.Utils?.exportAllData) {
    window.Utils.exportAllData(filename);
    showToast("داده‌ها اکسپورت شدند 📁");
    return;
  }
  /* fallback: هر چیزی که واقعاً ذخیره شده رو اکسپورت کن، نه فقط یه لیست ثابت */
  const data = {};
  Object.keys(localStorage)
    .filter((k) => k.startsWith("ana_dashboard_"))
    .forEach((k) => {
      try {
        data[k.replace("ana_dashboard_", "")] = JSON.parse(
          localStorage.getItem(k),
        );
      } catch {
        /* رد شو */
      }
    });
  data._exported = new Date().toISOString();

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  showToast("داده‌ها اکسپورت شدند 📁");
}

function afterImportRefresh() {
  renderComp(State.currentComp);
  updateBadges();
  applyProfileToUI();
  renderCategoryChips();
  populateTaskCategorySelect();
  renderHiddenSectionsList();
  applyHiddenSections();
}

function importData(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  if (window.Utils?.importAllData) {
    window.Utils.importAllData(file, (ok) => {
      if (ok) {
        showToast("داده‌ها وارد شدند ✅");
        afterImportRefresh();
      } else {
        showToast("فایل معتبر نیست", "error");
      }
      e.target.value = "";
    });
    return;
  }

  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      Object.entries(data).forEach(([k, v]) => {
        if (k.startsWith("_")) return;
        DB.set(k, v);
      });
      showToast("داده‌ها وارد شدند ✅");
      renderComp(State.currentComp);
      updateBadges();
    } catch {
      showToast("فایل معتبر نیست", "error");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
}

/* ═══════════════════════════════════════════
   ۱۷. Badge ها
═══════════════════════════════════════════ */
function updateBadges() {
  const today = todayISO();

  /* وظایف امروز */
  const pendingTasks = DB.get("tasks", []).filter(
    (t) => t.date === today && !t.done,
  ).length;
  const badgeToday = document.getElementById("badge-today");
  if (badgeToday) {
    badgeToday.textContent = pendingTasks;
    badgeToday.style.display = pendingTasks ? "inline-flex" : "none";
  }

  /* یادآوری‌های امروز و نشده */
  const pendingRem = DB.get("reminders", []).filter(
    (r) => r.date === today && !r.done,
  ).length;
  const badgeRem = document.getElementById("badge-remind");
  if (badgeRem) {
    badgeRem.textContent = pendingRem;
    badgeRem.style.display = pendingRem ? "inline-flex" : "none";
  }

  /* اعلان topbar — فقط یادآوری‌ها و کارهای فوریِ سررسیدشده/نشده */
  renderNotifDropdown();
}

/* ═══════════════════════════════════════════
   ۱۸. کمک‌کننده‌های عمومی
═══════════════════════════════════════════ */
function getValue(id) {
  const el = document.getElementById(id);
  if (!el) return "";
  return el.value || "";
}

function setValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

/** حذف رکورد + رندر مجدد */
window.deleteRecord = async function (key, id, callback) {
  const ok = await confirmDialog({
    title: "حذف مورد",
    message: "این مورد حذف بشه؟",
  });
  if (!ok) return;
  DB.remove(key, id);
  showToast("حذف شد", "info");
  if (typeof callback === "function") callback();
  else if (typeof callback === "string") window[callback]?.();
  updateBadges();
};

/* ═══════════════════════════════════════════
   ۱۹. جستجوی سراسری
═══════════════════════════════════════════ */
function initSearch() {
  const input = document.getElementById("globalSearch");
  const dropdown = document.getElementById("searchDropdown");
  if (!input || !dropdown) return;

  const SEARCH_SOURCES = [
    { key: "tasks", title: "title", comp: "comp-daily", label: "وظیفه", icon: "fa-list-check" },
    { key: "reminders", title: "title", comp: "comp-reminders", label: "یادآوری", icon: "fa-bell" },
    { key: "activities", title: "title", comp: "comp-activities", label: "فعالیت", icon: "fa-person-running" },
    { key: "sport", title: "type", comp: "comp-sport", label: "ورزش", icon: "fa-dumbbell" },
    { key: "food", title: "name", comp: "comp-food", label: "تغذیه", icon: "fa-utensils" },
    { key: "medicine", title: "name", comp: "comp-medicine", label: "دارو", icon: "fa-pills" },
    { key: "doctor", title: "name", comp: "comp-medicine", label: "دکتر", icon: "fa-stethoscope" },
    { key: "finance", title: "title", comp: "comp-finance", label: "هزینه", icon: "fa-wallet" },
    { key: "family", title: "title", comp: "comp-family", label: "خانواده", icon: "fa-people-roof" },
    { key: "leisure", title: "title", comp: "comp-leisure", label: "تفریح", icon: "fa-gamepad" },
    { key: "calendar_events", title: "title", comp: "comp-calendar", label: "رویداد", icon: "fa-calendar-heart" },
  ];

  function runSearch(q) {
    const results = [];
    SEARCH_SOURCES.forEach((src) => {
      DB.get(src.key, []).forEach((item) => {
        const text = (item[src.title] || "").toString().toLowerCase();
        if (text.includes(q)) {
          results.push({
            text: item[src.title],
            comp: src.comp,
            label: src.label,
            icon: src.icon,
            date: item.date,
          });
        }
      });
    });
    return results.slice(0, 20);
  }

  function renderDropdown(results, q) {
    if (!q) {
      dropdown.classList.add("hidden");
      return;
    }
    if (!results.length) {
      dropdown.innerHTML =
        '<div class="notif-empty">چیزی پیدا نشد</div>';
      dropdown.classList.remove("hidden");
      return;
    }
    dropdown.innerHTML = results
      .map(
        (r) => `
        <div class="notif-item" data-comp="${r.comp}">
          <div class="notif-icon"><i class="fa-solid ${r.icon}"></i></div>
          <div class="notif-body">
            <div class="notif-title">${r.text}</div>
            <div class="notif-sub">${r.label}${r.date ? " — " + toJalaliText(r.date).split(" - ")[1] : ""}</div>
          </div>
        </div>`,
      )
      .join("");
    dropdown.classList.remove("hidden");
  }

  let debounceTimer = null;
  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const q = input.value.trim().toLowerCase();
    debounceTimer = setTimeout(() => {
      renderDropdown(q ? runSearch(q) : [], q);
    }, 150);
  });

  input.addEventListener("focus", () => {
    const q = input.value.trim().toLowerCase();
    if (q) renderDropdown(runSearch(q), q);
  });

  dropdown.addEventListener("click", (e) => {
    const item = e.target.closest(".notif-item[data-comp]");
    if (!item) return;
    navigateTo(item.dataset.comp);
    dropdown.classList.add("hidden");
    input.value = "";
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest("#globalSearch, #searchDropdown")) return;
    dropdown.classList.add("hidden");
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      dropdown.classList.add("hidden");
      input.blur();
    }
  });
}

/* ═══════════════════════════════════════════
   ۲۰. آب‌وهوا و قیمت بازار (کارت‌های صفحه‌ی خانه)
   • منبع پیش‌فرض (رایگان، بدون کلید):
       آب‌وهوا  → Open-Meteo (+ geocoding برای پیدا کردن مختصات شهر)
       قیمت‌ها → tgju (ارز/طلا/سکه) + CoinGecko (رمزارز)
   • اگه کاربر توی تنظیمات آدرس API اختصاصی گذاشته باشه، اول از اون
     خونده می‌شه و اگه جواب نداد، خودکار می‌ره سراغ منبع رایگان.
   • اگه اینترنت قطع باشه یا هیچ منبعی جواب نده، به‌جای کارت خالی یه
     نمای مخصوص با پیام مناسب نشون داده می‌شه.
   نکته: آیکن‌ها رو با <i> می‌سازیم و هیچ‌جا کلاسشون رو بعد از ساخت عوض
   نمی‌کنیم (فونت‌اوسام <i> رو به <svg> تبدیل می‌کنه).
═══════════════════════════════════════════ */
class FetchError extends Error {
  constructor(code, status) {
    super(code);
    this.code = code; // offline | timeout | network | http | parse | nocity
    this.status = status || 0;
  }
}

async function fetchJSON(url, timeout = 10000) {
  if (navigator.onLine === false) throw new FetchError("offline");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new FetchError("http", res.status);
    try {
      return await res.json();
    } catch {
      throw new FetchError("parse");
    }
  } catch (e) {
    if (e instanceof FetchError) throw e;
    if (e?.name === "AbortError") throw new FetchError("timeout");
    throw new FetchError(navigator.onLine === false ? "offline" : "network");
  } finally {
    clearTimeout(timer);
  }
}

function getDataSources() {
  return {
    weatherUrl: "",
    weatherKey: "",
    ratesUrl: "",
    ratesKey: "",
    ...(DB.get("data_sources", {}) || {}),
  };
}

/** اعداد فارسی/انگلیسی/با کاما → Number (یا NaN) */
function parseLooseNumber(v) {
  if (typeof v === "number") return v;
  if (v == null) return NaN;
  const s = String(v)
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .replace(/[٬,\s]/g, "")
    .replace(/٫/g, ".")
    .replace(/[^0-9.\-]/g, "");
  return s === "" ? NaN : parseFloat(s);
}

const faNum = (n, digits = 0) =>
  Number(n).toLocaleString("fa-IR", { maximumFractionDigits: digits });

/** نمای «حالت خاص» (خطا / خالی / آفلاین) — مشترک بین دو کارت */
function dsStateHTML({ tone = "error", icon = "fa-cloud", slash = false, title, text, actions = "" }) {
  return `
    <div class="ds-state ds-state-${tone}">
      <div class="ds-state-art">
        <i class="fa-solid ${icon}"></i>${slash ? '<span class="ds-state-slash"></span>' : ""}
      </div>
      <div class="ds-state-title">${title}</div>
      <div class="ds-state-text">${text}</div>
      ${actions ? `<div class="ds-state-actions">${actions}</div>` : ""}
    </div>`;
}

const DS_RETRY_BTN = (id) =>
  `<button type="button" class="btn-sm" id="${id}"><i class="fa-solid fa-arrows-rotate"></i> تلاش دوباره</button>`;
const DS_SETTINGS_BTN = (id) =>
  `<button type="button" class="btn-sm" id="${id}"><i class="fa-solid fa-gear"></i> رفتن به تنظیمات</button>`;

/* ───────────────────────── آب‌وهوا ───────────────────────── */
const WX_TTL = 20 * 60 * 1000;
const WX = { status: "idle", data: null, error: null, fetchedAt: 0, inflight: false };

const WX_COND = {
  clear: { label: "آفتابی", icon: "fa-sun", night: { label: "صاف", icon: "fa-moon" } },
  partly: { label: "کمی ابری", icon: "fa-cloud-sun", night: { label: "کمی ابری", icon: "fa-cloud-moon" } },
  cloudy: { label: "ابری", icon: "fa-cloud" },
  fog: { label: "مه‌آلود", icon: "fa-smog" },
  rain: { label: "بارانی", icon: "fa-cloud-showers-heavy" },
  snow: { label: "برفی", icon: "fa-snowflake" },
  storm: { label: "رعدوبرق", icon: "fa-cloud-bolt" },
};

function wxCondInfo(cond, isDay) {
  const c = WX_COND[cond] || WX_COND.cloudy;
  return !isDay && c.night ? c.night : c;
}

function wmoToCond(code) {
  if (code === 0 || code === 1) return "clear";
  if (code === 2) return "partly";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 95) return "storm";
  return "cloudy";
}

function owmToCond(id) {
  if (id >= 200 && id < 300) return "storm";
  if (id >= 300 && id < 600) return "rain";
  if (id >= 600 && id < 700) return "snow";
  if (id >= 700 && id < 800) return "fog";
  if (id === 800) return "clear";
  if (id === 801 || id === 802) return "partly";
  return "cloudy";
}

function weatherApiToCond(code) {
  if (code === 1000) return "clear";
  if (code === 1003) return "partly";
  if (code === 1006 || code === 1009) return "cloudy";
  if ([1030, 1135, 1147].includes(code)) return "fog";
  if ([1087, 1273, 1276, 1279, 1282].includes(code)) return "storm";
  if (
    [1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1255, 1258, 1261, 1264].includes(code)
  )
    return "snow";
  if (code >= 1063 && code <= 1252) return "rain";
  return "cloudy";
}

/** Open-Meteo: current + daily */
function wxFromOpenMeteo(j, placeName) {
  const c = j.current;
  const isDay = c.is_day !== 0;
  const daily = (j.daily?.time || []).map((t, i) => ({
    date: t,
    cond: wmoToCond(j.daily.weather_code?.[i]),
    hi: j.daily.temperature_2m_max?.[i],
    lo: j.daily.temperature_2m_min?.[i],
  }));
  return {
    place: placeName,
    temp: c.temperature_2m,
    feels: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    wind: c.wind_speed_10m, // km/h
    isDay,
    cond: wmoToCond(c.weather_code),
    desc: null,
    daily,
  };
}

/** OpenWeatherMap: /data/2.5/weather (units=metric) */
function wxFromOWM(j, placeName) {
  const w = j.weather?.[0] || {};
  return {
    place: j.name || placeName,
    temp: j.main?.temp,
    feels: j.main?.feels_like,
    humidity: j.main?.humidity,
    wind: j.wind?.speed != null ? j.wind.speed * 3.6 : null, // m/s → km/h
    isDay: !String(w.icon || "").endsWith("n"),
    cond: owmToCond(w.id),
    desc: w.description || null,
    daily: [],
  };
}

/** WeatherAPI.com: /current.json */
function wxFromWeatherApi(j, placeName) {
  const c = j.current;
  return {
    place: j.location?.name || placeName,
    temp: c.temp_c,
    feels: c.feelslike_c,
    humidity: c.humidity,
    wind: c.wind_kph,
    isDay: c.is_day !== 0,
    cond: weatherApiToCond(c.condition?.code),
    desc: c.condition?.text || null,
    daily: [],
  };
}

function wxParse(j, placeName) {
  let out = null;
  if (j?.current && "temperature_2m" in j.current) out = wxFromOpenMeteo(j, placeName);
  else if (j?.main && Array.isArray(j.weather)) out = wxFromOWM(j, placeName);
  else if (j?.current && "temp_c" in j.current) out = wxFromWeatherApi(j, placeName);
  if (!out || !Number.isFinite(Number(out.temp))) throw new FetchError("parse");
  return out;
}

async function wxGeocode(city) {
  const cached = DB.get("weather_geo", null);
  if (cached && cached.city === city) return cached;
  const j = await fetchJSON(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fa&format=json`,
  );
  const r = j?.results?.[0];
  if (!r) throw new FetchError("nocity");
  const geo = { city, lat: r.latitude, lon: r.longitude, name: r.name || city };
  DB.set("weather_geo", geo);
  return geo;
}

async function wxFetchDefault(city) {
  const geo = await wxGeocode(city);
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=4&timezone=auto`;
  return wxParse(await fetchJSON(url), geo.name || city);
}

async function wxFetchCustom(city, src) {
  let url = src.weatherUrl;
  if (/\{(lat|lon)\}/.test(url)) {
    const geo = await wxGeocode(city);
    url = url.replace(/\{lat\}/g, geo.lat).replace(/\{lon\}/g, geo.lon);
  }
  url = url
    .replace(/\{city\}/g, encodeURIComponent(city))
    .replace(/\{key\}/g, encodeURIComponent(src.weatherKey || ""));
  return wxParse(await fetchJSON(url), city);
}

async function loadWeather(force = false) {
  if (WX.inflight) return;
  const city = (getProfile()?.city || "").trim();
  if (!city) {
    WX.status = "nocity";
    renderWeatherCard();
    return;
  }
  const fresh = Date.now() - WX.fetchedAt;
  if (!force && WX.status === "ok" && WX.data?.cityKey === city && fresh < WX_TTL) {
    renderWeatherCard();
    return;
  }
  /* بعد از یه خطا، با هر بار برگشتن به خانه بلافاصله دوباره نزن */
  if (!force && WX.status === "error" && fresh < 20000) {
    renderWeatherCard();
    return;
  }

  WX.inflight = true;
  WX.status = "loading";
  renderWeatherCard();

  const src = getDataSources();
  let data = null;
  let customErr = null;
  let defaultErr = null;

  if (src.weatherUrl) {
    try {
      data = await wxFetchCustom(city, src);
      data.source = "custom";
    } catch (e) {
      customErr = e;
    }
  }
  if (!data) {
    try {
      data = await wxFetchDefault(city);
      data.source = "default";
      if (customErr) data.notice = "API اختصاصی جواب نداد؛ از منبع رایگان خونده شد.";
    } catch (e) {
      defaultErr = e;
    }
  }

  WX.inflight = false;
  WX.fetchedAt = Date.now();
  if (data) {
    data.cityKey = city;
    data.fetchedAt = WX.fetchedAt;
    WX.data = data;
    WX.error = null;
    WX.status = "ok";
  } else {
    const cfgProblem = customErr && ["http", "parse"].includes(customErr.code);
    WX.error = cfgProblem && defaultErr?.code !== "nocity" ? customErr : defaultErr || customErr;
    WX.error.custom = !!cfgProblem && WX.error === customErr;
    WX.status = WX.error.code === "nocity" ? "nocity-notfound" : "error";
  }
  renderWeatherCard();
}

/** بعد از عوض شدن شهر یا API: با اجبار دوباره بگیر */
function reloadWeather() {
  WX.fetchedAt = 0;
  WX.status = "idle";
  loadWeather(true);
}

const WX_THEMES = ["clear", "night", "cloudy", "fog", "rain", "snow", "storm"];

function renderWeatherCard() {
  const card = document.getElementById("weatherCard");
  const body = document.getElementById("weatherBody");
  if (!card || !body) return;

  WX_THEMES.forEach((t) => card.classList.remove("wx-theme-" + t));
  card.classList.remove("wx-ok");

  const goSettings = () =>
    document.getElementById("wxGoSettings")?.addEventListener("click", () => navigateTo("comp-settings"));
  const retry = () =>
    document.getElementById("wxRetry")?.addEventListener("click", () => loadWeather(true));

  switch (WX.status) {
    case "loading": {
      body.innerHTML = `
        <div class="wx-skeleton">
          <div class="sk sk-circle"></div>
          <div class="sk-col"><div class="sk sk-line w60"></div><div class="sk sk-line w40"></div></div>
        </div>
        <div class="sk sk-line w80"></div>
        <div class="sk sk-line w50"></div>`;
      return;
    }

    case "nocity":
    case "nocity-notfound": {
      const notFound = WX.status === "nocity-notfound";
      body.innerHTML = dsStateHTML({
        tone: "purple",
        icon: "fa-location-dot",
        title: notFound ? "این شهر پیدا نشد" : "شهرت رو مشخص کن",
        text: notFound
          ? `اسم شهر رو دوباره وارد کن (فارسی یا انگلیسی).`
          : "برای نمایش آب‌وهوا، اسم شهرت رو بنویس.",
        actions: `
          <form class="wx-city-form" id="wxCityForm" autocomplete="off">
            <input type="text" id="wxCityInput" placeholder="مثلاً: تهران" value="${
              notFound ? escapeHTML(getProfile()?.city || "") : ""
            }" />
            <button type="submit" class="btn-sm">ثبت شهر</button>
          </form>`,
      });
      document.getElementById("wxCityForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const city = document.getElementById("wxCityInput")?.value.trim();
        if (!city) return;
        const profile = getProfile();
        if (!profile) {
          showToast("اول راه‌اندازی اولیه رو کامل کن", "warning");
          return;
        }
        profile.city = city;
        saveProfile(profile);
        applyProfileToUI();
        reloadWeather();
      });
      return;
    }

    case "error": {
      const e = WX.error || { code: "network" };
      let view;
      if (e.code === "offline") {
        view = {
          tone: "slate",
          icon: "fa-wifi",
          slash: true,
          title: "اینترنت وصل نیست",
          text: "به اینترنت که وصل بشی، آب‌وهوا خودکار میاد.",
          actions: DS_RETRY_BTN("wxRetry"),
        };
      } else if (e.custom) {
        view = {
          tone: "red",
          icon: "fa-key",
          title: e.code === "parse" ? "فرمت پاسخ API شناخته نشد" : "API آب‌وهوا پذیرفته نشد",
          text:
            e.code === "parse"
              ? "خروجی این API با OpenWeatherMap، WeatherAPI یا Open-Meteo نمی‌خونه."
              : "آدرس یا کلید API رو توی تنظیمات چک کن.",
          actions: DS_SETTINGS_BTN("wxGoSettings"),
        };
      } else {
        view = {
          tone: "amber",
          icon: "fa-cloud-bolt",
          title: "آب‌وهوا در دسترس نیست",
          text:
            e.code === "timeout"
              ? "سرویس دیر جواب داد. چند لحظه‌ی دیگه دوباره امتحان کن."
              : "اتصال به سرویس آب‌وهوا برقرار نشد. اینترنت (یا فیلترشکن) رو چک کن و دوباره امتحان کن.",
          actions: DS_RETRY_BTN("wxRetry"),
        };
      }
      body.innerHTML = dsStateHTML(view);
      retry();
      goSettings();
      return;
    }

    case "ok": {
      const d = WX.data;
      const info = wxCondInfo(d.cond, d.isDay);
      const theme = !d.isDay && ["clear", "partly"].includes(d.cond) ? "night" : d.cond;
      card.classList.add("wx-ok", "wx-theme-" + theme);

      const t = (v) => (Number.isFinite(Number(v)) ? `<span dir="ltr">${faNum(Math.round(v))}°</span>` : "—");
      const today = d.daily?.[0];
      const upcoming = (d.daily || []).slice(1, 4);
      const meta = [];
      if (Number.isFinite(Number(d.feels)))
        meta.push(`<span title="دمای حس‌شده"><i class="fa-solid fa-temperature-half"></i> حس‌شده ${t(d.feels)}</span>`);
      if (Number.isFinite(Number(d.humidity)))
        meta.push(`<span title="رطوبت"><i class="fa-solid fa-droplet"></i> رطوبت ${faNum(Math.round(d.humidity))}٪</span>`);
      if (Number.isFinite(Number(d.wind)))
        meta.push(`<span title="سرعت باد"><i class="fa-solid fa-wind"></i> باد ${faNum(Math.round(d.wind))} km/h</span>`);

      body.innerHTML = `
        <div class="wx-main">
          <div class="wx-icon"><i class="fa-solid ${info.icon}"></i></div>
          <div class="wx-temp">${t(d.temp)}</div>
          <div class="wx-desc">
            <strong>${escapeHTML(d.place || "")}</strong>
            <span>${escapeHTML(d.desc || info.label)}</span>
            ${
              today
                ? `<small>بیشینه ${t(today.hi)} · کمینه ${t(today.lo)}</small>`
                : ""
            }
          </div>
        </div>
        ${meta.length ? `<div class="wx-meta">${meta.join("")}</div>` : ""}
        ${
          upcoming.length
            ? `<div class="wx-days">${upcoming
                .map((x) => {
                  const dt = new Date(x.date + "T00:00:00");
                  const name = Number.isNaN(dt.getTime())
                    ? "—"
                    : JALALI_DAYS_LONG[(dt.getDay() + 1) % 7];
                  return `<div class="wx-day">
                    <span>${name}</span>
                    <i class="fa-solid ${wxCondInfo(x.cond, true).icon}"></i>
                    <b>${t(x.hi)}</b><small>${t(x.lo)}</small>
                  </div>`;
                })
                .join("")}</div>`
            : ""
        }
        ${d.notice ? `<div class="ds-note">${d.notice}</div>` : ""}`;
      return;
    }

    default:
      body.innerHTML = "";
  }
}

/* ───────────────────────── قیمت بازار ───────────────────────── */
const RATES_TTL = 5 * 60 * 1000;
const RATES = { status: "idle", groups: null, error: null, fetchedAt: 0, inflight: false, tab: "currency", notice: "", source: "" };

const TGJU_URL = "https://call5.tgju.org/ajax.json";
const COINGECKO_IDS = [
  ["bitcoin", "بیت‌کوین", "BTC"],
  ["ethereum", "اتریوم", "ETH"],
  ["tether", "تتر", "USDT"],
  ["binancecoin", "بایننس‌کوین", "BNB"],
  ["solana", "سولانا", "SOL"],
  ["ripple", "ریپل", "XRP"],
];

/* کلیدهای tgju که برای هر بخش نشون می‌دیم — کلیدی که توی پاسخ نباشه
   بی‌سروصدا رد می‌شه. قیمت‌ها ریالیه (÷۱۰ = تومان)، به‌جز انس جهانی (دلار). */
const TGJU_MAP = {
  currency: [
    { key: "price_dollar_rl", title: "دلار آمریکا", icon: "fa-dollar-sign" },
    { key: "price_eur", title: "یورو", icon: "fa-euro-sign" },
    { key: "price_gbp", title: "پوند انگلیس", icon: "fa-sterling-sign" },
    { key: "price_aed", title: "درهم امارات", icon: "fa-money-bill-wave" },
    { key: "price_try", title: "لیر ترکیه", icon: "fa-turkish-lira-sign" },
  ],
  gold: [
    { key: "geram18", title: "طلای ۱۸ عیار (گرم)", icon: "fa-gem" },
    { key: "geram24", title: "طلای ۲۴ عیار (گرم)", icon: "fa-gem" },
    { key: "mesghal", title: "مثقال طلا", icon: "fa-gem" },
    { key: "ons", title: "انس جهانی طلا", icon: "fa-earth-americas", usd: true },
  ],
  coin: [
    { key: "sekee", title: "سکه امامی", icon: "fa-coins" },
    { key: "sekeb", title: "سکه بهار آزادی", icon: "fa-coins" },
    { key: "nim", title: "نیم‌سکه", icon: "fa-coins" },
    { key: "rob", title: "ربع‌سکه", icon: "fa-coins" },
    { key: "gerami", title: "سکه گرمی", icon: "fa-coins" },
  ],
};

function rateDir(dt, delta, pct) {
  if (dt === "high") return "up";
  if (dt === "low") return "down";
  const s = Number.isFinite(delta) ? delta : pct;
  if (!Number.isFinite(s) || s === 0) return "flat";
  return s > 0 ? "up" : "down";
}

/** پاسخ شکل tgju: { current: { key: { p, dp, d, dt, ... } } } */
function ratesParseTgju(j) {
  const cur = j?.current;
  if (!cur || typeof cur !== "object") throw new FetchError("parse");
  const groups = {};
  let total = 0;
  Object.entries(TGJU_MAP).forEach(([g, defs]) => {
    groups[g] = { items: [] };
    defs.forEach((def) => {
      const row = cur[def.key];
      const raw = parseLooseNumber(row?.p);
      if (!Number.isFinite(raw) || raw <= 0) return;
      const pct = Math.abs(parseLooseNumber(row.dp));
      const delta = parseLooseNumber(row.d);
      groups[g].items.push({
        title: def.title,
        icon: def.icon,
        price: def.usd ? raw : raw / 10,
        unit: def.usd ? "دلار" : "تومان",
        pct: Number.isFinite(pct) ? pct : null,
        dir: rateDir(row.dt, delta, pct),
        digits: def.usd ? 2 : 0,
      });
      total++;
    });
  });
  if (!total) throw new FetchError("parse");
  const usd = cur.price_dollar_rl ? parseLooseNumber(cur.price_dollar_rl.p) / 10 : NaN;
  return { groups, usdToman: Number.isFinite(usd) ? usd : null };
}

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=" +
  COINGECKO_IDS.map((x) => x[0]).join(",") +
  "&vs_currencies=usd&include_24hr_change=true";

function ratesParseCoinGecko(j, usdToman) {
  const items = [];
  COINGECKO_IDS.forEach(([id, title, sym]) => {
    const row = j?.[id];
    if (!row || !Number.isFinite(row.usd)) return;
    const pct = row.usd_24h_change;
    items.push({
      title,
      sym,
      icon: id === "bitcoin" ? "fa-bitcoin-sign" : "fa-coins",
      price: row.usd,
      unit: "دلار",
      pct: Number.isFinite(pct) ? Math.abs(pct) : null,
      dir: rateDir(null, NaN, pct),
      digits: row.usd >= 1000 ? 0 : row.usd >= 1 ? 2 : 4,
      sub: usdToman ? `≈ ${faNum(Math.round(row.usd * usdToman))} تومان` : "",
    });
  });
  if (!items.length) throw new FetchError("parse");
  return { items };
}

async function ratesFetchDefault() {
  /* دو منبع هم‌زمان گرفته می‌شن؛ اگه یکی خراب بود، بخش‌های اون یکی سالم نشون داده می‌شن */
  const tgFetch = fetchJSON(TGJU_URL).catch(async (e) => {
    /* اگه مرورگر (CORS/شبکه) اجازه‌ی گرفتن مستقیم نداد و برنامه با server.js
       اجرا شده، از پروکسی همون سرور امتحان کن */
    if (/^https?:$/.test(location.protocol) && ["network", "http", "timeout"].includes(e.code)) {
      try {
        return await fetchJSON("api/tgju");
      } catch {
        /* پروکسی نیست؛ خطای اصلی رو نشون بده */
      }
    }
    throw e;
  });
  const [tg, cg] = await Promise.allSettled([tgFetch, fetchJSON(COINGECKO_URL)]);
  let groups = {};
  let usdToman = null;
  let tgErr = null;
  if (tg.status === "fulfilled") {
    try {
      const parsed = ratesParseTgju(tg.value);
      groups = parsed.groups;
      usdToman = parsed.usdToman;
    } catch (e) {
      tgErr = e;
    }
  } else tgErr = tg.reason;
  if (tgErr) ["currency", "gold", "coin"].forEach((g) => (groups[g] = { error: tgErr }));

  try {
    if (cg.status !== "fulfilled") throw cg.reason;
    groups.crypto = ratesParseCoinGecko(cg.value, usdToman);
  } catch (e) {
    groups.crypto = { error: e };
  }
  const allFailed = ["currency", "gold", "coin", "crypto"].every((g) => groups[g]?.error);
  if (allFailed) throw groups.currency.error?.code === "offline" ? groups.currency.error : groups.crypto.error || tgErr;
  return { groups, source: "tgju و CoinGecko" };
}

/** پاسخ API اختصاصی: tgju-مانند، BrsApi-مانند، یا لیست ساده */
function ratesParseCustom(j) {
  if (j?.current && typeof j.current === "object" && !Array.isArray(j.current)) {
    const { groups } = ratesParseTgju(j);
    return groups;
  }
  const groups = { currency: { items: [] }, gold: { items: [] }, coin: { items: [] }, crypto: { items: [] } };
  const norm = (x) => {
    const price = parseLooseNumber(x?.price ?? x?.p ?? x?.value ?? x?.last);
    if (!Number.isFinite(price)) return null;
    const rawPct = parseLooseNumber(x.change_percent ?? x.changePercent ?? x.dp ?? x.change ?? x.percent);
    return {
      title: x.title || x.name_fa || x.name || x.symbol || "—",
      icon: "fa-coins",
      price,
      unit: x.unit || "تومان",
      pct: Number.isFinite(rawPct) ? Math.abs(rawPct) : null,
      dir: rateDir(null, NaN, rawPct),
      digits: price < 1000 && price % 1 ? 2 : 0,
    };
  };
  const guess = (s) => {
    s = String(s || "").toLowerCase();
    if (/coin|سکه|sekk?e/.test(s)) return "coin";
    if (/crypto|رمز|btc|eth|usdt/.test(s)) return "crypto";
    if (/gold|طلا|مثقال|geram/.test(s)) return "gold";
    return "currency";
  };
  const push = (g, it) => it && groups[g].items.push(it);

  if (Array.isArray(j?.gold) || Array.isArray(j?.currency) || Array.isArray(j?.cryptocurrency)) {
    (j.gold || []).forEach((x) => push(guess((x.symbol || "") + (x.name || "")) === "coin" ? "coin" : "gold", norm(x)));
    (j.currency || []).forEach((x) => push("currency", norm(x)));
    (j.cryptocurrency || []).forEach((x) => push("crypto", norm(x)));
  } else {
    const arr = Array.isArray(j) ? j : Array.isArray(j?.items) ? j.items : null;
    if (!arr) throw new FetchError("parse");
    arr.forEach((x) => push(guess(x.group || x.category || x.type || x.symbol || x.name), norm(x)));
  }
  if (!Object.values(groups).some((g) => g.items.length)) throw new FetchError("parse");
  return groups;
}

async function loadRates(force = false) {
  if (RATES.inflight) return;
  const fresh = Date.now() - RATES.fetchedAt;
  if (!force && RATES.status === "ok" && fresh < RATES_TTL) {
    renderRatesCard();
    return;
  }
  if (!force && RATES.status === "error" && fresh < 20000) {
    renderRatesCard();
    return;
  }
  RATES.inflight = true;
  RATES.status = "loading";
  renderRatesCard();

  const src = getDataSources();
  let result = null;
  let customErr = null;
  let defaultErr = null;
  RATES.notice = "";

  if (src.ratesUrl) {
    try {
      const url = src.ratesUrl.replace(/\{key\}/g, encodeURIComponent(src.ratesKey || ""));
      result = { groups: ratesParseCustom(await fetchJSON(url)), source: "API اختصاصی" };
    } catch (e) {
      customErr = e;
    }
  }
  if (!result) {
    try {
      result = await ratesFetchDefault();
      if (customErr) RATES.notice = "API اختصاصی جواب نداد؛ از منبع رایگان خونده شد.";
    } catch (e) {
      defaultErr = e;
    }
  }

  RATES.inflight = false;
  RATES.fetchedAt = Date.now();
  if (result) {
    RATES.groups = result.groups;
    RATES.source = result.source;
    RATES.error = null;
    RATES.status = "ok";
  } else {
    const cfgProblem = customErr && ["http", "parse"].includes(customErr.code);
    RATES.error = cfgProblem ? customErr : defaultErr || customErr;
    RATES.error.custom = !!cfgProblem;
    RATES.status = "error";
  }
  renderRatesCard();
}

function renderRatesCard() {
  const body = document.getElementById("ratesBody");
  const tabs = document.getElementById("ratesTabs");
  const foot = document.getElementById("ratesFoot");
  const updated = document.getElementById("ratesUpdated");
  if (!body || !tabs || !foot) return;

  const showTabs = RATES.status === "ok";
  tabs.classList.toggle("hidden", !showTabs);
  foot.textContent = "";
  if (updated) updated.textContent = "";

  if (RATES.status === "loading") {
    body.innerHTML = Array.from({ length: 5 })
      .map(() => `<div class="rate-row sk-row"><div class="sk sk-circle sm"></div><div class="sk sk-line w50"></div><div class="sk sk-line w25"></div></div>`)
      .join("");
    return;
  }

  if (RATES.status === "error") {
    const e = RATES.error || { code: "network" };
    let view;
    if (e.code === "offline") {
      view = {
        tone: "slate",
        icon: "fa-wifi",
        slash: true,
        title: "اینترنت وصل نیست",
        text: "قیمت‌ها وقتی اینترنت وصل بشه خودکار میاد.",
        actions: DS_RETRY_BTN("ratesRetry"),
      };
    } else if (e.custom) {
      view = {
        tone: "red",
        icon: "fa-key",
        title: e.code === "parse" ? "فرمت پاسخ API شناخته نشد" : "API قیمت‌ها پذیرفته نشد",
        text:
          e.code === "parse"
            ? "خروجی این API با فرمت tgju، BrsApi یا لیست ساده نمی‌خونه."
            : "آدرس یا کلید API رو توی تنظیمات چک کن.",
        actions: DS_SETTINGS_BTN("ratesGoSettings"),
      };
    } else {
      view = {
        tone: "amber",
        icon: "fa-chart-line",
        title: "قیمت‌ها در دسترس نیست",
        text:
          e.code === "timeout"
            ? "سرویس دیر جواب داد. چند لحظه‌ی دیگه دوباره امتحان کن."
            : "اتصال به سرویس قیمت برقرار نشد. اینترنت (یا فیلترشکن) رو چک کن و دوباره امتحان کن.",
        actions: DS_RETRY_BTN("ratesRetry"),
      };
    }
    body.innerHTML = dsStateHTML(view);
    document.getElementById("ratesRetry")?.addEventListener("click", () => loadRates(true));
    document.getElementById("ratesGoSettings")?.addEventListener("click", () => navigateTo("comp-settings"));
    return;
  }

  if (RATES.status !== "ok" || !RATES.groups) {
    body.innerHTML = "";
    return;
  }

  tabs.querySelectorAll(".rates-tab").forEach((b) => {
    const on = b.dataset.group === RATES.tab;
    b.classList.toggle("active", on);
    b.setAttribute("aria-selected", String(on));
  });

  const g = RATES.groups[RATES.tab];
  if (!g || g.error) {
    const off = g?.error?.code === "offline";
    body.innerHTML = dsStateHTML({
      tone: "amber",
      icon: "fa-plug-circle-xmark",
      title: off ? "اینترنت وصل نیست" : "این بخش الان در دسترس نیست",
      text: "منبع این بخش جواب نداد. یه‌کم بعد دوباره امتحان کن.",
      actions: DS_RETRY_BTN("ratesRetry"),
    });
    document.getElementById("ratesRetry")?.addEventListener("click", () => loadRates(true));
  } else if (!g.items?.length) {
    body.innerHTML = `<div class="rates-empty">برای این بخش داده‌ای نیومد.</div>`;
  } else {
    body.innerHTML = `<ul class="rate-list">${g.items
      .map((it) => {
        const arrow = it.dir === "up" ? "▲" : it.dir === "down" ? "▼" : "•";
        return `
          <li class="rate-row">
            <span class="rate-ico"><i class="fa-solid ${it.icon || "fa-coins"}"></i></span>
            <div class="rate-name"><strong>${escapeHTML(it.title)}</strong>${
              it.sub ? `<small>${escapeHTML(it.sub)}</small>` : it.sym ? `<small dir="ltr">${it.sym}</small>` : ""
            }</div>
            <div class="rate-val"><b>${faNum(it.price, it.digits ?? 0)}</b><small>${escapeHTML(it.unit || "")}</small></div>
            <span class="rate-chg ${it.dir}" title="تغییر">${arrow} ${
              it.pct != null ? faNum(it.pct, 2) + "٪" : ""
            }</span>
          </li>`;
      })
      .join("")}</ul>`;
  }

  if (updated) {
    const d = new Date(RATES.fetchedAt);
    updated.textContent = toPersianNum(
      `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
    );
  }
  foot.textContent = RATES.notice || (RATES.source ? `منبع: ${RATES.source}` : "");
  foot.classList.toggle("warn", !!RATES.notice);
}

function escapeHTML(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

/** قدم‌هایی که renderHome صدا می‌زنه */
function refreshWeatherCard() {
  loadWeather(false);
}
function refreshRatesCard() {
  loadRates(false);
}

function initWeatherAndRates() {
  document.getElementById("weatherRefresh")?.addEventListener("click", () => loadWeather(true));
  document.getElementById("ratesRefresh")?.addEventListener("click", () => loadRates(true));
  document.getElementById("ratesTabs")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".rates-tab");
    if (!btn) return;
    RATES.tab = btn.dataset.group;
    renderRatesCard();
  });

  /* وقتی اینترنت برگشت، هر دو کارت خودشون رو بروز کنن */
  window.addEventListener("online", () => {
    if (document.getElementById("comp-dashboard-home")?.classList.contains("active")) {
      loadWeather(true);
      loadRates(true);
    } else {
      WX.fetchedAt = RATES.fetchedAt = 0;
    }
  });

  /* بروزرسانی دوره‌ای فقط وقتی صفحه‌ی خانه جلوی چشمه */
  setInterval(() => {
    if (document.hidden) return;
    if (!document.getElementById("comp-dashboard-home")?.classList.contains("active")) return;
    loadWeather(false);
    loadRates(false);
  }, 60 * 1000);
}

/* ─── تنظیمات: منابع داده ─── */
function initDataSourceSettings() {
  const ids = {
    weatherUrl: "setWeatherUrl",
    weatherKey: "setWeatherKey",
    ratesUrl: "setRatesUrl",
    ratesKey: "setRatesKey",
  };
  const fill = () => {
    const src = getDataSources();
    Object.entries(ids).forEach(([k, id]) => setValue(id, src[k] || ""));
  };
  fill();

  document.getElementById("btn-save-datasources")?.addEventListener("click", () => {
    const next = {};
    for (const [k, id] of Object.entries(ids)) next[k] = getValue(id).trim();
    for (const k of ["weatherUrl", "ratesUrl"]) {
      if (next[k] && !/^https?:\/\//i.test(next[k])) {
        showToast("آدرس API باید با http:// یا https:// شروع بشه", "error");
        return;
      }
    }
    DB.set("data_sources", next);
    showToast("منابع داده ذخیره شد ✅");
    reloadWeather();
    loadRates(true);
  });

  document.getElementById("btn-reset-datasources")?.addEventListener("click", () => {
    DB.set("data_sources", { weatherUrl: "", weatherKey: "", ratesUrl: "", ratesKey: "" });
    fill();
    showToast("از این به بعد از سرویس‌های رایگان خونده می‌شه", "info");
    reloadWeather();
    loadRates(true);
  });
}

/* ═══════════════════════════════════════════
   ۲۱. پخش‌کننده‌ی موزیک (وسط نوار بالا)
   • «پخش از دیسک»: فایل فقط در همین نشست پخش می‌شه و جایی ذخیره نمی‌شه.
   • «ذخیره در کتابخانه»: فایل داخل IndexedDB ذخیره می‌شه و دفعه‌ی بعد از
     همون‌جا خونده می‌شه (بدون نیاز به انتخاب دوباره).
   نکته: آیکن پخش/توقف، دو <i> جدا هستن که با کلاس is-playing نشون/پنهان
   می‌شن — چون فونت‌اوسام <i> رو به <svg> تبدیل می‌کنه و عوض‌کردن کلاسِ
   آیکن بعد از لود اثر نمی‌کنه.
═══════════════════════════════════════════ */
const MusicStore = {
  async list() {
    try {
      const all = await window.Utils.mediaGetAll("tracks");
      return all.sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
    } catch {
      return [];
    }
  },
  async add(file) {
    const rec = {
      id: "trk_" + uid(),
      name: file.name,
      size: file.size,
      type: file.type || "audio/mpeg",
      blob: file,
      addedAt: Date.now(),
    };
    await window.Utils.mediaPut("tracks", rec);
    return rec;
  },
  async remove(id) {
    await window.Utils.mediaDelete("tracks", id);
  },
  async wipe() {
    try {
      await window.Utils.mediaWipe();
    } catch {
      /* مهم نیست */
    }
  },
};

const MP = {
  audio: null,
  tracks: [] /* { id, kind: "saved" | "temp", name, file } */,
  index: -1,
  url: null,
  shuffle: false,
  repeat: "off" /* off | all | one */,
  seeking: false,
  history: [],
  prefs: null,
};

const mpIsAudioFile = (f) =>
  /^audio\//.test(f.type) || /\.(mp3|m4a|aac|wav|ogg|oga|flac|opus)$/i.test(f.name);

const mpCleanName = (n) => String(n || "").replace(/\.[^.]+$/, "").replace(/[_]+/g, " ").trim() || "بدون نام";

function mpFmt(sec) {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return toPersianNum(`${m}:${String(s).padStart(2, "0")}`);
}

function mpSavePrefs(extra = {}) {
  MP.prefs = { ...MP.prefs, volume: MP.audio.volume, shuffle: MP.shuffle, repeat: MP.repeat, ...extra };
  DB.set("music_prefs", MP.prefs);
}

function mpCurrent() {
  return MP.tracks[MP.index] || null;
}

function mpRenderList() {
  const ul = document.getElementById("mpList");
  if (!ul) return;
  if (!MP.tracks.length) {
    ul.innerHTML = `<li class="mp-empty"><i class="fa-solid fa-headphones"></i><span>هنوز آهنگی اضافه نکردی.<br />یه فایل mp3 انتخاب کن.</span></li>`;
    return;
  }
  const playing = !MP.audio.paused;
  ul.innerHTML = MP.tracks
    .map((t, i) => {
      const active = i === MP.index;
      const lead =
        active && playing
          ? `<span class="mp-eq" aria-hidden="true"><i></i><i></i><i></i></span>`
          : `<i class="fa-solid ${active ? "fa-pause" : "fa-play"}"></i>`;
      return `
        <li class="mp-item ${active ? "active" : ""}" data-i="${i}">
          <button type="button" class="mp-item-main" data-act="play" title="پخش">
            <span class="mp-item-ico">${lead}</span>
            <span class="mp-item-name">${escapeHTML(mpCleanName(t.name))}</span>
          </button>
          <span class="mp-badge ${t.kind}">${t.kind === "saved" ? "ذخیره‌شده" : "موقت"}</span>
          ${
            t.kind === "temp"
              ? `<button type="button" class="mp-item-btn" data-act="save" title="ذخیره در کتابخانه"><i class="fa-solid fa-floppy-disk"></i></button>`
              : ""
          }
          <button type="button" class="mp-item-btn danger" data-act="del" title="${
            t.kind === "saved" ? "حذف از کتابخانه" : "برداشتن از لیست"
          }"><i class="fa-solid fa-trash-can"></i></button>
        </li>`;
    })
    .join("");
}

function mpUpdateUI() {
  const t = mpCurrent();
  const playing = !!MP.audio && !MP.audio.paused;
  const title = t ? mpCleanName(t.name) : "موزیکی انتخاب نشده";
  setEl("mpTitle", title);
  setEl("mpPanelTitle", title);
  setEl(
    "mpPanelSub",
    t
      ? t.kind === "saved"
        ? "ذخیره‌شده توی کتابخانه‌ی مرورگر"
        : "پخش موقت از دیسک — بعد از بستن صفحه نمی‌مونه"
      : "از پایین یه فایل mp3 اضافه کن",
  );
  ["mpPlay", "mpPlay2"].forEach((id) => {
    const b = document.getElementById(id);
    if (!b) return;
    b.classList.toggle("is-playing", playing);
    b.title = playing ? "توقف" : "پخش";
  });
  document.getElementById("musicPlayer")?.classList.toggle("is-playing", playing);
  const rep = document.getElementById("mpRepeat");
  if (rep) {
    rep.dataset.mode = MP.repeat;
    rep.classList.toggle("on", MP.repeat !== "off");
    rep.title = { off: "تکرار: خاموش", all: "تکرار: کل لیست", one: "تکرار: همین آهنگ" }[MP.repeat];
  }
  const sh = document.getElementById("mpShuffle");
  if (sh) {
    sh.classList.toggle("on", MP.shuffle);
    sh.setAttribute("aria-pressed", String(MP.shuffle));
  }
  const muted = MP.audio.muted || MP.audio.volume === 0;
  document.getElementById("mpMute")?.classList.toggle("is-muted", muted);
  mpRenderList();
}

function mpUpdateProgress() {
  const a = MP.audio;
  const dur = a.duration;
  const pct = Number.isFinite(dur) && dur > 0 ? (a.currentTime / dur) * 100 : 0;
  const fill = document.getElementById("mpMiniFill");
  if (fill) fill.style.width = pct + "%";
  setEl("mpTime", mpFmt(a.currentTime));
  setEl("mpCur", mpFmt(a.currentTime));
  setEl("mpDur", mpFmt(dur));
  const seek = document.getElementById("mpSeek");
  if (seek && !MP.seeking) {
    seek.value = String(Math.round(pct * 10));
    seek.style.setProperty("--pct", pct + "%");
  }
}

function mpLoad(i, autoplay = false) {
  const t = MP.tracks[i];
  if (!t) return;
  MP.index = i;
  if (MP.url) URL.revokeObjectURL(MP.url);
  MP.url = URL.createObjectURL(t.file);
  MP.audio.src = MP.url;
  MP.audio.load();
  mpSavePrefs({ lastId: t.kind === "saved" ? t.id : null });
  if (autoplay) {
    MP.audio.play().catch(() => {
      /* مرورگر پخش خودکار رو نداد؛ کاربر دکمه‌ی پخش رو می‌زنه */
    });
  }
  mpUpdateProgress();
  mpUpdateUI();
  if ("mediaSession" in navigator && window.MediaMetadata) {
    navigator.mediaSession.metadata = new MediaMetadata({ title: mpCleanName(t.name), artist: "زندگی‌یار" });
  }
}

function mpToggle() {
  if (!MP.tracks.length) {
    mpOpenPanel(true);
    return;
  }
  if (MP.index < 0) {
    mpLoad(0, true);
    return;
  }
  if (MP.audio.paused) MP.audio.play().catch(() => {});
  else MP.audio.pause();
}

function mpNext(auto = false) {
  const n = MP.tracks.length;
  if (!n) return;
  if (MP.index >= 0) MP.history.push(MP.index);
  if (MP.history.length > 50) MP.history.shift();
  let next;
  if (MP.shuffle && n > 1) {
    do next = Math.floor(Math.random() * n);
    while (next === MP.index);
  } else {
    next = MP.index + 1;
    if (next >= n) {
      if (auto && MP.repeat === "off") {
        /* آخر لیست و تکرار خاموشه: متوقف شو */
        MP.audio.pause();
        MP.audio.currentTime = 0;
        mpUpdateUI();
        return;
      }
      next = 0;
    }
  }
  mpLoad(next, true);
}

function mpPrev() {
  if (!MP.tracks.length) return;
  /* اگه بیشتر از ۳ ثانیه پخش شده، اول همین آهنگ رو از اول بذار */
  if (MP.audio.currentTime > 3) {
    MP.audio.currentTime = 0;
    return;
  }
  const back = MP.history.pop();
  const prev = back != null && MP.tracks[back] ? back : (MP.index - 1 + MP.tracks.length) % MP.tracks.length;
  mpLoad(prev, true);
}

async function mpAddFiles(fileList, save) {
  const files = [...(fileList || [])].filter(mpIsAudioFile);
  if (!files.length) {
    showToast("فایل صوتی پیدا نشد (mp3 انتخاب کن)", "warning");
    return;
  }
  const hadNothing = MP.index < 0;
  let firstNew = -1;
  let dup = 0;
  for (const f of files) {
    if (save) {
      if (MP.tracks.some((t) => t.kind === "saved" && t.name === f.name && t.file.size === f.size)) {
        dup++;
        continue;
      }
      try {
        navigator.storage?.persist?.();
        const rec = await MusicStore.add(f);
        MP.tracks.push({ id: rec.id, kind: "saved", name: rec.name, file: rec.blob });
      } catch (err) {
        console.error("ذخیره‌ی موزیک شکست خورد:", err);
        showToast(
          err?.name === "QuotaExceededError"
            ? "فضای ذخیره‌سازی مرورگر پر شده؛ این آهنگ ذخیره نشد"
            : "ذخیره‌ی آهنگ توی مرورگر انجام نشد",
          "error",
        );
        break;
      }
    } else {
      MP.tracks.push({ id: "tmp_" + uid(), kind: "temp", name: f.name, file: f });
    }
    if (firstNew < 0) firstNew = MP.tracks.length - 1;
  }
  if (dup) showToast(`${toPersianNum(dup)} آهنگ از قبل توی کتابخانه بود`, "info");
  if (firstNew >= 0) {
    showToast(save ? "به کتابخانه اضافه شد 🎵" : "آماده‌ی پخش از دیسک 🎵");
    /* اگه چیزی پخش نمی‌شد، اولین آهنگ تازه رو بذار */
    if (hadNothing || MP.audio.paused) mpLoad(firstNew, true);
    else mpUpdateUI();
  }
}

async function mpRemove(i) {
  const t = MP.tracks[i];
  if (!t) return;
  if (t.kind === "saved") {
    const ok = await confirmDialog({
      title: "حذف آهنگ",
      message: `«${mpCleanName(t.name)}» از کتابخانه حذف بشه؟ فایل اصلیِ روی دیسکت دست‌نخورده می‌مونه.`,
      confirmText: "حذف آهنگ",
    });
    if (!ok) return;
    try {
      await MusicStore.remove(t.id);
    } catch {
      showToast("حذف انجام نشد", "error");
      return;
    }
  }
  const wasCurrent = i === MP.index;
  MP.tracks.splice(i, 1);
  MP.history = MP.history.filter((h) => h !== i).map((h) => (h > i ? h - 1 : h));
  if (wasCurrent) {
    MP.audio.pause();
    MP.audio.removeAttribute("src");
    MP.audio.load();
    if (MP.url) URL.revokeObjectURL(MP.url);
    MP.url = null;
    MP.index = -1;
    if (MP.tracks.length) mpLoad(Math.min(i, MP.tracks.length - 1), false);
  } else if (i < MP.index) {
    MP.index--;
  }
  mpUpdateProgress();
  mpUpdateUI();
}

async function mpSaveTemp(i) {
  const t = MP.tracks[i];
  if (!t || t.kind !== "temp") return;
  if (MP.tracks.some((x) => x.kind === "saved" && x.name === t.name && x.file.size === t.file.size)) {
    showToast("این آهنگ از قبل توی کتابخانه هست", "info");
    return;
  }
  try {
    navigator.storage?.persist?.();
    const rec = await MusicStore.add(t.file);
    t.id = rec.id;
    t.kind = "saved";
    t.file = rec.blob;
    showToast("توی کتابخانه ذخیره شد 💾");
    mpUpdateUI();
  } catch {
    showToast("ذخیره‌ی آهنگ توی مرورگر انجام نشد", "error");
  }
}

function mpOpenPanel(open) {
  const panel = document.getElementById("mpPanel");
  if (!panel) return;
  const willOpen = open ?? panel.classList.contains("hidden");
  panel.classList.toggle("hidden", !willOpen);
  document.getElementById("mpListBtn")?.setAttribute("aria-expanded", String(willOpen));
  if (willOpen) closeTopbarDropdowns();
}

async function initMusicPlayer() {
  const audio = document.getElementById("mpAudio");
  if (!audio) return;
  MP.audio = audio;
  MP.prefs = { volume: 0.8, shuffle: false, repeat: "off", lastId: null, ...(DB.get("music_prefs", {}) || {}) };
  audio.volume = Math.min(1, Math.max(0, Number(MP.prefs.volume)));
  MP.shuffle = !!MP.prefs.shuffle;
  MP.repeat = ["off", "all", "one"].includes(MP.prefs.repeat) ? MP.prefs.repeat : "off";

  const vol = document.getElementById("mpVolume");
  if (vol) {
    vol.value = String(Math.round(audio.volume * 100));
    vol.style.setProperty("--pct", vol.value + "%");
  }

  /* کنترل‌های نوار بالا و پنل */
  ["mpPlay", "mpPlay2"].forEach((id) => document.getElementById(id)?.addEventListener("click", mpToggle));
  ["mpNext", "mpNext2"].forEach((id) => document.getElementById(id)?.addEventListener("click", () => mpNext(false)));
  ["mpPrev", "mpPrev2"].forEach((id) => document.getElementById(id)?.addEventListener("click", mpPrev));
  document.getElementById("mpListBtn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    mpOpenPanel();
  });
  document.getElementById("mpNow")?.addEventListener("click", (e) => {
    e.stopPropagation();
    mpOpenPanel();
  });
  document.getElementById("mpPanelClose")?.addEventListener("click", () => mpOpenPanel(false));
  document.addEventListener("click", (e) => {
    /* composedPath: چون با هر کلیک روی لیست، لیست دوباره ساخته می‌شه و
       e.target از DOM جدا می‌شه؛ با closest() اشتباهاً پنل بسته می‌شد */
    const inside = e.composedPath().some(
      (el) => el.id === "musicPlayer" || el.classList?.contains("app-dialog-overlay"),
    );
    if (!inside) mpOpenPanel(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") mpOpenPanel(false);
  });

  document.getElementById("mpShuffle")?.addEventListener("click", () => {
    MP.shuffle = !MP.shuffle;
    mpSavePrefs();
    mpUpdateUI();
  });
  document.getElementById("mpRepeat")?.addEventListener("click", () => {
    MP.repeat = { off: "all", all: "one", one: "off" }[MP.repeat];
    mpSavePrefs();
    mpUpdateUI();
  });

  /* جلو/عقب بردن */
  const seek = document.getElementById("mpSeek");
  seek?.addEventListener("input", () => {
    MP.seeking = true;
    seek.style.setProperty("--pct", seek.value / 10 + "%");
    if (Number.isFinite(audio.duration)) setEl("mpCur", mpFmt((seek.value / 1000) * audio.duration));
  });
  seek?.addEventListener("change", () => {
    if (Number.isFinite(audio.duration)) audio.currentTime = (seek.value / 1000) * audio.duration;
    MP.seeking = false;
  });

  /* صدا */
  vol?.addEventListener("input", () => {
    audio.volume = vol.value / 100;
    audio.muted = false;
    vol.style.setProperty("--pct", vol.value + "%");
    mpSavePrefs();
    mpUpdateUI();
  });
  document.getElementById("mpMute")?.addEventListener("click", () => {
    audio.muted = !audio.muted;
    mpUpdateUI();
  });

  /* افزودن فایل */
  document.getElementById("mpFileTemp")?.addEventListener("change", (e) => {
    mpAddFiles(e.target.files, false);
    e.target.value = "";
  });
  document.getElementById("mpFileSave")?.addEventListener("change", (e) => {
    mpAddFiles(e.target.files, true);
    e.target.value = "";
  });

  /* لیست */
  document.getElementById("mpList")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act]");
    const li = e.target.closest(".mp-item");
    if (!btn || !li) return;
    const i = Number(li.dataset.i);
    if (btn.dataset.act === "play") {
      if (i === MP.index) mpToggle();
      else mpLoad(i, true);
    } else if (btn.dataset.act === "del") mpRemove(i);
    else if (btn.dataset.act === "save") mpSaveTemp(i);
  });

  /* رویدادهای خودِ پخش‌کننده */
  audio.addEventListener("timeupdate", mpUpdateProgress);
  audio.addEventListener("loadedmetadata", mpUpdateProgress);
  audio.addEventListener("play", mpUpdateUI);
  audio.addEventListener("pause", mpUpdateUI);
  audio.addEventListener("volumechange", () => {
    document.getElementById("mpMute")?.classList.toggle("is-muted", audio.muted || audio.volume === 0);
  });
  audio.addEventListener("ended", () => {
    if (MP.repeat === "one") {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } else mpNext(true);
  });
  audio.addEventListener("error", () => {
    if (!audio.getAttribute("src")) return;
    showToast("این فایل قابل پخش نبود", "error");
    mpUpdateUI();
  });

  if ("mediaSession" in navigator) {
    const set = (a, fn) => {
      try {
        navigator.mediaSession.setActionHandler(a, fn);
      } catch {
        /* این اکشن پشتیبانی نمی‌شه */
      }
    };
    set("play", () => audio.play().catch(() => {}));
    set("pause", () => audio.pause());
    set("previoustrack", mpPrev);
    set("nexttrack", () => mpNext(false));
  }

  /* کتابخانه‌ی ذخیره‌شده رو از IndexedDB بخون */
  const saved = await MusicStore.list();
  MP.tracks = saved.map((r) => ({ id: r.id, kind: "saved", name: r.name, file: r.blob }));
  const last = MP.prefs.lastId ? MP.tracks.findIndex((t) => t.id === MP.prefs.lastId) : -1;
  if (last >= 0) mpLoad(last, false);
  else if (MP.tracks.length) mpLoad(0, false);
  else mpUpdateUI();
  mpUpdateProgress();
}

/* ═══════════════════════════════════════════
   ۲۳. گالری تصاویر
   • «باز کردن از دیسک»: فقط برای همین نشست نشون داده می‌شه، ذخیره نمی‌شه.
   • «افزودن و ذخیره در گالری»: داخل IndexedDB (استور جدای «gallery»)
     ذخیره می‌شه و دفعه‌ی بعد هم هست.
   • این بخش کاملاً مستقل از عکس‌های «دفتر زندگی و خاطرات» (life_manager_files)
     — هیچ‌جا به اون دیتابیس دسترسی پیدا نمی‌کنه.
═══════════════════════════════════════════ */
const GalleryStore = {
  async list() {
    try {
      const all = await window.Utils.mediaGetAll("gallery");
      return all.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
    } catch {
      return [];
    }
  },
  async add(file) {
    const rec = {
      id: "img_" + uid(),
      name: file.name,
      size: file.size,
      type: file.type || "image/jpeg",
      blob: file,
      addedAt: Date.now(),
    };
    await window.Utils.mediaPut("gallery", rec);
    return rec;
  },
  async remove(id) {
    await window.Utils.mediaDelete("gallery", id);
  },
};

const GAL = { items: [] /* { id, kind: "saved"|"temp", name, file, url } */, lbIndex: -1 };

const galIsImageFile = (f) => /^image\//.test(f.type) || /\.(jpe?g|png|gif|webp|bmp|svg|avif)$/i.test(f.name);

function galObjUrl(it) {
  if (!it.url) it.url = URL.createObjectURL(it.file);
  return it.url;
}

function galRenderGrid() {
  const grid = document.getElementById("galGrid");
  if (!grid) return;
  if (!GAL.items.length) {
    grid.innerHTML = `
      <div class="gal-empty">
        <i class="fa-solid fa-panorama"></i>
        <span>هنوز عکسی اضافه نکردی.<br />از بالا یه عکس باز کن یا ذخیره کن.</span>
      </div>`;
    return;
  }
  grid.innerHTML = GAL.items
    .map(
      (it, i) => `
      <button type="button" class="gal-thumb" data-i="${i}" title="${escapeHTML(it.name)}">
        <img src="${galObjUrl(it)}" alt="${escapeHTML(it.name)}" loading="lazy" />
        <span class="gal-thumb-badge ${it.kind}">${it.kind === "saved" ? "ذخیره‌شده" : "موقت"}</span>
      </button>`,
    )
    .join("");
}

async function galAddFiles(fileList, save) {
  const files = [...(fileList || [])].filter(galIsImageFile);
  if (!files.length) {
    showToast("فایل تصویری پیدا نشد", "warning");
    return;
  }
  let added = 0;
  for (const f of files) {
    if (save) {
      try {
        navigator.storage?.persist?.();
        const rec = await GalleryStore.add(f);
        GAL.items.unshift({ id: rec.id, kind: "saved", name: rec.name, file: rec.blob });
      } catch (err) {
        console.error("ذخیره‌ی عکس شکست خورد:", err);
        showToast(
          err?.name === "QuotaExceededError"
            ? "فضای ذخیره‌سازی مرورگر پر شده؛ این عکس ذخیره نشد"
            : "ذخیره‌ی عکس توی مرورگر انجام نشد",
          "error",
        );
        break;
      }
    } else {
      GAL.items.unshift({ id: "tmp_" + uid(), kind: "temp", name: f.name, file: f });
    }
    added++;
  }
  if (added) {
    showToast(save ? `${toPersianNum(added)} عکس به گالری اضافه شد 🖼️` : `${toPersianNum(added)} عکس آماده‌ی نمایشه`);
    galRenderGrid();
  }
}

async function galRemove(i) {
  const it = GAL.items[i];
  if (!it) return;
  if (it.kind === "saved") {
    const ok = await confirmDialog({
      title: "حذف عکس",
      message: `«${it.name}» از گالری حذف بشه؟`,
      confirmText: "حذف عکس",
    });
    if (!ok) return;
    try {
      await GalleryStore.remove(it.id);
    } catch {
      showToast("حذف انجام نشد", "error");
      return;
    }
  }
  const wasInLightbox = GAL.lbIndex === i;
  if (it.url) URL.revokeObjectURL(it.url);
  GAL.items.splice(i, 1);
  galRenderGrid();
  if (wasInLightbox) {
    if (!GAL.items.length) galCloseLightbox();
    else {
      GAL.lbIndex = Math.min(i, GAL.items.length - 1);
      galRenderLightbox();
    }
  } else if (GAL.lbIndex > i) {
    GAL.lbIndex--;
  }
}

async function galSaveTemp(i) {
  const it = GAL.items[i];
  if (!it || it.kind !== "temp") return;
  try {
    navigator.storage?.persist?.();
    const rec = await GalleryStore.add(it.file);
    it.id = rec.id;
    it.kind = "saved";
    it.file = rec.blob;
    showToast("توی گالری ذخیره شد 💾");
    galRenderGrid();
    if (GAL.lbIndex === i) galRenderLightbox();
  } catch {
    showToast("ذخیره‌ی عکس توی مرورگر انجام نشد", "error");
  }
}

function galRenderLightbox() {
  const it = GAL.items[GAL.lbIndex];
  if (!it) return;
  setEl("galLbName", it.name);
  const badge = document.getElementById("galLbBadge");
  if (badge) {
    badge.textContent = it.kind === "saved" ? "ذخیره‌شده در گالری" : "موقت (ذخیره نشده)";
    badge.className = "lightbox-badge " + it.kind;
  }
  const img = document.getElementById("galLbImg");
  if (img) img.src = galObjUrl(it);
  document.getElementById("galLbSave")?.classList.toggle("hidden", it.kind !== "temp");
  const multi = GAL.items.length > 1;
  document.getElementById("galLbPrev")?.classList.toggle("hidden", !multi);
  document.getElementById("galLbNext")?.classList.toggle("hidden", !multi);
}

function galOpenLightbox(i) {
  GAL.lbIndex = i;
  document.getElementById("galLightbox")?.classList.remove("hidden");
  galRenderLightbox();
}

function galCloseLightbox() {
  GAL.lbIndex = -1;
  document.getElementById("galLightbox")?.classList.add("hidden");
}

function galLbStep(delta) {
  if (!GAL.items.length) return;
  GAL.lbIndex = (GAL.lbIndex + delta + GAL.items.length) % GAL.items.length;
  galRenderLightbox();
}

function renderGallery() {
  galRenderGrid();
}

async function initGalleryEvents() {
  document.getElementById("galFileTemp")?.addEventListener("change", (e) => {
    galAddFiles(e.target.files, false);
    e.target.value = "";
  });
  document.getElementById("galFileSave")?.addEventListener("change", (e) => {
    galAddFiles(e.target.files, true);
    e.target.value = "";
  });
  document.getElementById("galGrid")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".gal-thumb");
    if (!btn) return;
    galOpenLightbox(Number(btn.dataset.i));
  });
  document.getElementById("galLbClose")?.addEventListener("click", galCloseLightbox);
  document.getElementById("galLbPrev")?.addEventListener("click", () => galLbStep(-1));
  document.getElementById("galLbNext")?.addEventListener("click", () => galLbStep(1));
  document.getElementById("galLbSave")?.addEventListener("click", () => galSaveTemp(GAL.lbIndex));
  document.getElementById("galLbDelete")?.addEventListener("click", () => galRemove(GAL.lbIndex));
  document.getElementById("galLightbox")?.addEventListener("click", (e) => {
    if (e.target.id === "galLightbox") galCloseLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (document.getElementById("galLightbox")?.classList.contains("hidden")) return;
    if (e.key === "Escape") galCloseLightbox();
    else if (e.key === "ArrowRight") galLbStep(-1); /* راست‌به‌چپ: راست = قبلی */
    else if (e.key === "ArrowLeft") galLbStep(1);
  });

  /* عکس‌های ذخیره‌شده رو از IndexedDB بخون */
  const saved = await GalleryStore.list();
  GAL.items = saved.map((r) => ({ id: r.id, kind: "saved", name: r.name, file: r.blob }));
  galRenderGrid();
}

/* ═══════════════════════════════════════════
   ۲۴. اسناد و فایل‌ها — مرور و نمایش زنده‌ی یه پوشه‌ی روی دیسک
   (File System Access API؛ چیزی کپی/آپلود نمی‌شه، فقط handle پوشه
   برای دفعه‌ی بعد داخل IndexedDB ذخیره می‌شه)
   کتابخونه‌های نمایش (mammoth / xlsx / jszip) فقط وقتی لازم بشن،
   با تگ <script> لود می‌شن — نه از اول، تا حجم اولیه‌ی برنامه کم بمونه.
═══════════════════════════════════════════ */
const DOC_EXT = {
  pdf: { icon: "fa-file-pdf", label: "PDF", kind: "pdf" },
  doc: { icon: "fa-file-word", label: "Word", kind: "docx" },
  docx: { icon: "fa-file-word", label: "Word", kind: "docx" },
  xls: { icon: "fa-file-excel", label: "Excel", kind: "xlsx" },
  xlsx: { icon: "fa-file-excel", label: "Excel", kind: "xlsx" },
  csv: { icon: "fa-file-csv", label: "CSV", kind: "text" },
  ppt: { icon: "fa-file-powerpoint", label: "PowerPoint", kind: "pptx" },
  pptx: { icon: "fa-file-powerpoint", label: "PowerPoint", kind: "pptx" },
  txt: { icon: "fa-file-lines", label: "متن", kind: "text" },
  md: { icon: "fa-file-lines", label: "Markdown", kind: "text" },
  json: { icon: "fa-file-code", label: "JSON", kind: "text" },
  log: { icon: "fa-file-lines", label: "متن", kind: "text" },
};

function docExtOf(name) {
  const m = /\.([a-z0-9]+)$/i.exec(name || "");
  return m ? m[1].toLowerCase() : "";
}
function docInfoOf(name) {
  return DOC_EXT[docExtOf(name)] || { icon: "fa-file", label: "فایل", kind: "other" };
}

const DOCS = {
  supported: typeof window.showDirectoryPicker === "function",
  root: null /* FileSystemDirectoryHandle ریشه */,
  stack: [] /* [{ name, handle }] — مسیر فعلی از ریشه */,
  entries: [] /* لیست فایل/پوشه‌های سطح فعلی */,
};

/** لود یه اسکریپت خارجی فقط یه‌بار (نتیجه‌ش کش می‌شه) */
const _scriptCache = {};
function loadScriptOnce(src) {
  if (_scriptCache[src]) return _scriptCache[src];
  _scriptCache[src] = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => {
      delete _scriptCache[src];
      reject(new Error("لود نشد: " + src));
    };
    document.head.appendChild(s);
  });
  return _scriptCache[src];
}

async function docsGetSavedRootHandle() {
  try {
    return (await window.Utils.mediaGet("handles", "docsRoot"))?.handle || null;
  } catch {
    return null;
  }
}
async function docsSaveRootHandle(handle) {
  try {
    await window.Utils.mediaPut("handles", { key: "docsRoot", handle });
  } catch {
    /* ذخیره نشد؛ دفعه‌ی بعد دوباره می‌پرسه — مشکلی نیست */
  }
}

async function docsPickFolder() {
  if (!DOCS.supported) {
    showToast("این قابلیت فقط توی مرورگرهای مبتنی بر Chrome (کروم/اج) در دسترسه", "warning");
    return;
  }
  try {
    const handle = await window.showDirectoryPicker({ id: "lifemanager-docs", mode: "read" });
    await docsSaveRootHandle(handle);
    DOCS.root = handle;
    DOCS.stack = [{ name: handle.name, handle }];
    await docsRefresh();
  } catch (err) {
    if (err?.name !== "AbortError") showToast("انتخاب پوشه انجام نشد", "error");
  }
}

async function docsEnsurePermission(handle, interactive) {
  let perm = await handle.queryPermission({ mode: "read" });
  if (perm !== "granted" && interactive) perm = await handle.requestPermission({ mode: "read" });
  return perm === "granted";
}

async function docsTryRestoreRoot() {
  const handle = await docsGetSavedRootHandle();
  if (!handle) return false;
  const ok = await docsEnsurePermission(handle, false);
  if (!ok) {
    /* اجازه از بین رفته؛ کاربر با کلیک روی «انتخاب پوشه» دوباره تأییدش می‌کنه */
    DOCS.root = handle;
    DOCS.stack = [{ name: handle.name, handle }];
    docRenderNeedsPermission();
    return true;
  }
  DOCS.root = handle;
  DOCS.stack = [{ name: handle.name, handle }];
  await docsRefresh();
  return true;
}

function docRenderNeedsPermission() {
  docsRenderBreadcrumb();
  const body = document.getElementById("docBody");
  if (!body) return;
  body.innerHTML = dsStateHTML({
    tone: "purple",
    icon: "fa-lock",
    title: "اجازه‌ی دسترسی دوباره لازمه",
    text: `مرورگر اجازه‌ی خوندن پوشه‌ی «${escapeHTML(DOCS.root?.name || "")}» رو نگه نداشته؛ دوباره تأیید کن.`,
    actions: `<button type="button" class="btn-sm" id="docReauth"><i class="fa-solid fa-unlock"></i> اجازه‌ی دسترسی</button>`,
  });
  document.getElementById("docReauth")?.addEventListener("click", async () => {
    const ok = await docsEnsurePermission(DOCS.root, true);
    if (ok) docsRefresh();
  });
}

async function docsRefresh() {
  const cur = DOCS.stack[DOCS.stack.length - 1];
  if (!cur) return docsRenderEmptyState();
  docsRenderBreadcrumb();
  const body = document.getElementById("docBody");
  if (body)
    body.innerHTML = `<div class="doc-loading"><i class="fa-solid fa-spinner fa-spin"></i> در حال خوندن پوشه…</div>`;
  const folders = [];
  const files = [];
  try {
    for await (const [name, handle] of cur.handle.entries()) {
      /* فایل/پوشه‌های مخفی (نقطه‌دار) مثل .gitkeep یا .git رو نشون نده —
         این‌ها برای مرور نیستن، فقط برای گیت یا سیستم‌عاملن */
      if (name.startsWith(".")) continue;
      if (handle.kind === "directory") folders.push({ name, handle });
      else files.push({ name, handle });
    }
  } catch (err) {
    if (body)
      body.innerHTML = dsStateHTML({
        tone: "red",
        icon: "fa-triangle-exclamation",
        title: "خوندن پوشه ممکن نشد",
        text: "شاید پوشه جابه‌جا یا حذف شده باشه.",
      });
    return;
  }
  folders.sort((a, b) => a.name.localeCompare(b.name, "fa"));
  files.sort((a, b) => a.name.localeCompare(b.name, "fa"));
  DOCS.entries = [...folders.map((f) => ({ ...f, isDir: true })), ...files.map((f) => ({ ...f, isDir: false }))];
  docsRenderList();
}

function docsRenderEmptyState() {
  docsRenderBreadcrumb();
  const body = document.getElementById("docBody");
  if (!body) return;
  body.innerHTML = DOCS.supported
    ? dsStateHTML({
        tone: "purple",
        icon: "fa-folder-open",
        title: "هنوز پوشه‌ای انتخاب نشده",
        text: "با دکمه‌ی «انتخاب پوشه» یه پوشه روی دیسکت رو باز کن.",
      })
    : dsStateHTML({
        tone: "amber",
        icon: "fa-triangle-exclamation",
        title: "مرورگرت این قابلیت رو نداره",
        text: "این بخش فقط توی مرورگرهای مبتنی بر Chrome (کروم، اج، برَیو و ...) کار می‌کنه.",
      });
}

function docsRenderBreadcrumb() {
  const nav = document.getElementById("docBreadcrumb");
  if (!nav) return;
  if (!DOCS.stack.length) {
    nav.innerHTML = "";
    return;
  }
  nav.innerHTML = DOCS.stack
    .map((s, i) => {
      const last = i === DOCS.stack.length - 1;
      return `<button type="button" class="doc-crumb ${last ? "active" : ""}" data-i="${i}" ${last ? "disabled" : ""}>${escapeHTML(s.name)}</button>`;
    })
    .join('<i class="fa-solid fa-angle-left doc-crumb-sep"></i>');
}

const DOC_ICON_COLOR = { pdf: "#dc2626", docx: "#2563eb", xlsx: "#15803d", pptx: "#ea580c", text: "#64748b", other: "#94a3b8" };

function docsRenderList() {
  const body = document.getElementById("docBody");
  if (!body) return;
  if (!DOCS.entries.length) {
    body.innerHTML = `<div class="doc-empty">این پوشه خالیه.</div>`;
    return;
  }
  body.innerHTML = `<div class="doc-grid">${DOCS.entries
    .map((e, i) => {
      if (e.isDir)
        return `
        <button type="button" class="doc-item" data-i="${i}" data-dir="1">
          <span class="doc-item-icon dir"><i class="fa-solid fa-folder"></i></span>
          <span class="doc-item-name">${escapeHTML(e.name)}</span>
        </button>`;
      const info = docInfoOf(e.name);
      const supported = info.kind !== "other";
      return `
        <button type="button" class="doc-item ${supported ? "" : "unsupported"}" data-i="${i}" title="${
          supported ? "" : "نمایش این نوع فایل پشتیبانی نمی‌شه"
        }">
          <span class="doc-item-icon" style="color:${DOC_ICON_COLOR[info.kind]}"><i class="fa-solid ${info.icon}"></i></span>
          <span class="doc-item-name">${escapeHTML(e.name)}</span>
        </button>`;
    })
    .join("")}</div>`;
}

async function docsOpenEntry(i) {
  const e = DOCS.entries[i];
  if (!e) return;
  if (e.isDir) {
    DOCS.stack.push({ name: e.name, handle: e.handle });
    await docsRefresh();
    return;
  }
  const info = docInfoOf(e.name);
  if (info.kind === "other") {
    showToast("نمایش این نوع فایل پشتیبانی نمی‌شه", "warning");
    return;
  }
  await docsOpenViewer(e.handle, e.name, info);
}

function docsJumpTo(i) {
  DOCS.stack = DOCS.stack.slice(0, i + 1);
  docsRefresh();
}

/* ─── نمایشگر سند ─── */
function docViewerSetLoading(msg) {
  const body = document.getElementById("docViewerBody");
  if (body) body.innerHTML = `<div class="doc-loading"><i class="fa-solid fa-spinner fa-spin"></i> ${escapeHTML(msg)}</div>`;
}
function docViewerSetError(msg) {
  const body = document.getElementById("docViewerBody");
  if (body)
    body.innerHTML = dsStateHTML({ tone: "red", icon: "fa-triangle-exclamation", title: "نمایش ممکن نشد", text: msg });
}

let docViewerObjectUrl = null;

async function docsOpenViewer(handle, name, info) {
  const overlay = document.getElementById("docViewer");
  const body = document.getElementById("docViewerBody");
  const icon = document.getElementById("docViewerIcon");
  const openBtn = document.getElementById("docViewerOpenExternal");
  if (!overlay || !body) return;
  setEl("docViewerName", name);
  if (icon) icon.className = "fa-solid " + info.icon;
  overlay.classList.remove("hidden");
  if (docViewerObjectUrl) {
    URL.revokeObjectURL(docViewerObjectUrl);
    docViewerObjectUrl = null;
  }
  if (openBtn) openBtn.removeAttribute("href");
  docViewerSetLoading("در حال خوندن فایل…");

  let file;
  try {
    file = await handle.getFile();
  } catch {
    docViewerSetError("این فایل قابل خوندن نبود (شاید حذف یا جابه‌جا شده).");
    return;
  }
  if (file.size > 60 * 1024 * 1024) {
    docViewerSetError("فایل خیلی بزرگه (بیشتر از ۶۰ مگابایت)؛ برای دیدنش دانلودش کن.");
  }
  docViewerObjectUrl = URL.createObjectURL(file);
  if (openBtn) {
    openBtn.href = docViewerObjectUrl;
    openBtn.download = name;
  }

  try {
    if (info.kind === "pdf") {
      body.innerHTML = `<iframe class="doc-pdf-frame" src="${docViewerObjectUrl}" title="${escapeHTML(name)}"></iframe>`;
    } else if (info.kind === "text") {
      const text = await file.text();
      body.innerHTML = `<pre class="doc-text-view"></pre>`;
      body.querySelector("pre").textContent = text.length > 400000 ? text.slice(0, 400000) + "\n\n… (فایل بریده شد)" : text;
    } else if (info.kind === "docx") {
      docViewerSetLoading("در حال آماده‌سازی نمایشگر Word…");
      await loadScriptOnce("js/mammoth.browser.min.js");
      const buf = await file.arrayBuffer();
      const result = await window.mammoth.convertToHtml({ arrayBuffer: buf });
      body.innerHTML = `<div class="doc-html-view">${result.value}</div>`;
    } else if (info.kind === "xlsx") {
      docViewerSetLoading("در حال آماده‌سازی نمایشگر Excel…");
      await loadScriptOnce("js/xlsx.full.min.js");
      const buf = await file.arrayBuffer();
      const wb = window.XLSX.read(buf, { type: "array" });
      docsRenderXlsx(wb);
    } else if (info.kind === "pptx") {
      docViewerSetLoading("در حال آماده‌سازی نمایشگر PowerPoint…");
      await loadScriptOnce("js/jszip.min.js");
      const buf = await file.arrayBuffer();
      await docsRenderPptx(buf);
    }
  } catch (err) {
    console.error("نمایش فایل شکست خورد:", err);
    docViewerSetError("فرمت این فایل خونده نشد. ممکنه خراب یا رمزگذاری‌شده باشه.");
  }
}

function docsRenderXlsx(wb) {
  const body = document.getElementById("docViewerBody");
  if (!body) return;
  const names = wb.SheetNames || [];
  const tabsHtml = names.length > 1 ? `<div class="doc-xlsx-tabs">${names.map((n, i) => `<button type="button" class="doc-xlsx-tab ${i === 0 ? "active" : ""}" data-n="${i}">${escapeHTML(n)}</button>`).join("")}</div>` : "";
  body.innerHTML = `${tabsHtml}<div class="doc-table-wrap" id="docXlsxTableWrap"></div>`;
  const renderSheet = (i) => {
    const html = window.XLSX.utils.sheet_to_html(wb.Sheets[names[i]], { editable: false });
    const wrap = document.getElementById("docXlsxTableWrap");
    if (wrap) wrap.innerHTML = html;
  };
  renderSheet(0);
  body.querySelectorAll(".doc-xlsx-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      body.querySelectorAll(".doc-xlsx-tab").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderSheet(Number(btn.dataset.n));
    });
  });
}

/** استخراج ساده‌ی متن و عکس‌های اسلایدها از pptx با JSZip (بدون رندر واقعی طرح‌بندی) */
async function docsRenderPptx(buf) {
  const zip = await window.JSZip.loadAsync(buf);
  const slideFiles = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => {
      const na = Number(a.match(/slide(\d+)\.xml/)[1]);
      const nb = Number(b.match(/slide(\d+)\.xml/)[1]);
      return na - nb;
    });

  if (!slideFiles.length) throw new Error("no slides found");

  const parser = new DOMParser();
  const body = document.getElementById("docViewerBody");
  const slidesHtml = [];

  for (let i = 0; i < slideFiles.length; i++) {
    const path = slideFiles[i];
    const xmlText = await zip.file(path).async("text");
    const xml = parser.parseFromString(xmlText, "application/xml");
    const texts = [...xml.getElementsByTagName("a:t")].map((n) => n.textContent).filter((t) => t && t.trim());

    /* عکس‌های همین اسلاید از روی فایل rels */
    const relsPath = path.replace("slides/", "slides/_rels/") + ".rels";
    const imgUrls = [];
    const relsEntry = zip.file(relsPath);
    if (relsEntry) {
      const relsXml = parser.parseFromString(await relsEntry.async("text"), "application/xml");
      const rels = [...relsXml.getElementsByTagName("Relationship")].filter((r) =>
        /image/i.test(r.getAttribute("Type") || ""),
      );
      for (const r of rels) {
        const target = r.getAttribute("Target");
        if (!target) continue;
        const mediaPath = "ppt/" + target.replace(/^\.\.\//, "");
        const mediaEntry = zip.file(mediaPath);
        if (!mediaEntry) continue;
        const blob = await mediaEntry.async("blob");
        imgUrls.push(URL.createObjectURL(blob));
      }
    }

    slidesHtml.push(`
      <div class="pptx-slide">
        <div class="pptx-slide-num">اسلاید ${toPersianNum(i + 1)}</div>
        ${imgUrls.length ? `<div class="pptx-slide-imgs">${imgUrls.map((u) => `<img src="${u}" loading="lazy" />`).join("")}</div>` : ""}
        ${texts.length ? `<ul class="pptx-slide-text">${texts.map((t) => `<li>${escapeHTML(t)}</li>`).join("")}</ul>` : texts.length === 0 && !imgUrls.length ? '<div class="pptx-slide-empty">(بدون متن)</div>' : ""}
      </div>`);
  }

  body.innerHTML = `
    <div class="pptx-note">
      <i class="fa-solid fa-circle-info"></i>
      این فقط یه پیش‌نمایش سبکه (متن و عکس‌های هر اسلاید) — نه رندر دقیق طرح‌بندی. برای دیدن اصل فایل، از دکمه‌ی «باز کردن در برنامه‌ی ویرایشگر» استفاده کن.
    </div>
    <div class="pptx-slides">${slidesHtml.join("")}</div>`;
}

function docsCloseViewer() {
  document.getElementById("docViewer")?.classList.add("hidden");
  if (docViewerObjectUrl) {
    URL.revokeObjectURL(docViewerObjectUrl);
    docViewerObjectUrl = null;
  }
  const body = document.getElementById("docViewerBody");
  if (body) body.innerHTML = "";
}

function renderDocuments() {
  if (!DOCS.root) {
    docsTryRestoreRoot().then((restored) => {
      if (!restored) docsRenderEmptyState();
    });
  } else {
    docsRenderBreadcrumb();
    docsRenderList();
  }
}

function initDocumentsEvents() {
  document.getElementById("btn-doc-pick-folder")?.addEventListener("click", docsPickFolder);
  document.getElementById("btn-doc-refresh")?.addEventListener("click", () => {
    if (DOCS.root) docsRefresh();
  });
  document.getElementById("docBreadcrumb")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".doc-crumb");
    if (btn && !btn.disabled) docsJumpTo(Number(btn.dataset.i));
  });
  document.getElementById("docBody")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".doc-item");
    if (btn) docsOpenEntry(Number(btn.dataset.i));
  });
  document.getElementById("docViewerClose")?.addEventListener("click", docsCloseViewer);
  document.getElementById("docViewer")?.addEventListener("click", (e) => {
    if (e.target.id === "docViewer") docsCloseViewer();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !document.getElementById("docViewer")?.classList.contains("hidden")) docsCloseViewer();
  });
}

/* ═══════════════════════════════════════════
   ۲۵. راه‌اندازی اولیه برنامه
═══════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", async () => {
  /* اول قفل رو چک کن؛ تا باز نشه ادامه نمی‌ره */
  await checkLockScreen();

  /* اگه پروفایلی ثبت نشده، صفحه‌ی راه‌اندازی اولیه رو نشون بده */
  initOnboarding();
  applyProfileToUI();

  /* ماژول‌ها */
  initSidebar();
  initClock();
  initTopbarMenus();

  initHomeEvents();
  initDaily();
  initActivities();
  initHealth();
  initSport();
  initFood();
  initMedicine();
  initReminders();
  initStickyReminders();
  initCalendar();
  initFamily();
  initLeisure();
  initFinance();
  initEvents();
  initSettings();
  initSearch();
  initAvatarZoomPreview();
  initWeatherAndRates();
  initMusicPlayer().catch((err) => console.error("پخش‌کننده‌ی موزیک:", err));
  initGalleryEvents().catch((err) => console.error("گالری تصاویر:", err));
  initDocumentsEvents();
  migrateLegacyAvatar();

  populateTaskCategorySelect();
  applyHiddenSections();

  /* رندر اولیه */
  navigateTo("comp-dashboard-home");
  updateBadges();
  checkAutoBackup();
  renderStickyReminders();
});
