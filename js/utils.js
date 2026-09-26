/**
 * utils.js — توابع کمکی داشبورد
 * تقویم شمسی، فرمت پول ایرانی، ذخیره‌سازی داده
 */

/* ثابت‌های تقویم شمسی — قبلاً فقط داخل toJalali تعریف می‌شدن و در
   window.Utils به یه چیزی ارجاع داده می‌شد که هیچ‌جا تعریف نشده بود
   (ReferenceError موقع لود صفحه، قبل از این‌که dashboard.js اصلاً اجرا بشه). */
const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const JALALI_DAYS_LONG = [
  "شنبه",
  "یک‌شنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنج‌شنبه",
  "جمعه",
];

const JALALI_DAYS_SHORT = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

function toJalali(dateInput) {
  const d = new Date(dateInput);

  // مبدأ میلادی = 20 March 2025
  const baseG = Date.UTC(2025, 2, 20);

  // مبدأ شمسی = 1403/12/30
  let jy = 1403,
    jm = 12,
    jd = 30;

  // اختلاف روز
  const days = Math.floor((d.getTime() - baseG) / 86400000);

  let remaining = days;

  // اضافه کردن روزها از 30 اسفند 1403 به بعد
  const monthLengths = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

  while (remaining > 0) {
    jd++;
    const len = monthLengths[jm - 1];
    if (jd > len) {
      jd = 1;
      jm++;
      if (jm > 12) {
        jm = 1;
        jy++;
      }
    }
    remaining--;
  }

  while (remaining < 0) {
    jd--;
    if (jd < 1) {
      jm--;
      if (jm < 1) {
        jm = 12;
        jy--;
      }
      jd = monthLengths[jm - 1];
    }
    remaining++;
  }

  const dayName = JALALI_DAYS_LONG[(d.getUTCDay() + 1) % 7];

  return {
    year: jy,
    month: jm,
    day: jd,
    monthName: JALALI_MONTHS[jm - 1],
    dayName,
  };
}

/**
 * فرمت تاریخ شمسی
 * @param {Date|string|number} date
 * @param {'short'|'long'|'full'} style
 * @returns {string}
 */
function formatJalali(date, style = "short") {
  const j = toJalali(date);
  const yy = j.year;
  const mm = String(j.month).padStart(2, "0");
  const dd = String(j.day).padStart(2, "0");

  if (style === "short") return `${yy}/${mm}/${dd}`;
  if (style === "long") return `${j.day} ${j.monthName} ${yy}`;
  if (style === "full") return `${j.dayName}، ${j.day} ${j.monthName} ${yy}`;
  return `${yy}/${mm}/${dd}`;
}

/**
 * تبدیل تاریخ شمسی به میلادی
 * @param {number} jy  @param {number} jm  @param {number} jd
 * @returns {Date}
 */
function fromJalali(jy, jm, jd) {
  /* دقیقاً همون قانون گام‌به‌گامِ toJalali رو برعکس اجرا می‌کنیم (نه یه
     فرمول بسته‌ی جدا) تا این دو تابع همیشه معکوس دقیق هم بمونن. نسخه‌ی
     قبلی یه فرمول جمع‌بسته داشت که دقیقاً سر مبدأ (که خودش لبه‌ی یه سال
     کبیسه‌ست) یک روز جابه‌جا می‌شد. */
  const monthLengths = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  let cy = 1403,
    cm = 12,
    cd = 30; // همون مبدأ toJalali (⇐ 20 مارس 2025)
  let steps = 0;

  const isBefore = (y1, m1, d1, y2, m2, d2) =>
    y1 < y2 || (y1 === y2 && (m1 < m2 || (m1 === m2 && d1 < d2)));
  const isAfter = (y1, m1, d1, y2, m2, d2) =>
    y1 > y2 || (y1 === y2 && (m1 > m2 || (m1 === m2 && d1 > d2)));

  while (isBefore(cy, cm, cd, jy, jm, jd)) {
    cd++;
    if (cd > monthLengths[cm - 1]) {
      cd = 1;
      cm++;
      if (cm > 12) {
        cm = 1;
        cy++;
      }
    }
    steps++;
  }
  while (isAfter(cy, cm, cd, jy, jm, jd)) {
    cd--;
    if (cd < 1) {
      cm--;
      if (cm < 1) {
        cm = 12;
        cy--;
      }
      cd = monthLengths[cm - 1];
    }
    steps--;
  }

  const baseG = Date.UTC(2025, 2, 20);
  return new Date(baseG + steps * 86400000);
}

// ============================================================
//  ۲. فرمت زمان
// ============================================================

/**
 * فرمت زمان از Date
 * @param {Date|string|number} date
 * @returns {string}  مثال: ۱۴:۳۰
 */
function formatTime(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * محاسبه مدت زمان بین دو تاریخ
 * @param {Date|string} start
 * @param {Date|string} end
 * @returns {{ hours, minutes, totalMinutes, formatted }}
 */
function calcDuration(start, end) {
  const s = start instanceof Date ? start : new Date(start);
  const e = end instanceof Date ? end : new Date(end);
  const diffMs = e - s;
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return {
    hours,
    minutes,
    totalMinutes,
    formatted:
      hours > 0
        ? `${hours} ساعت${minutes > 0 ? " و " + minutes + " دقیقه" : ""}`
        : `${minutes} دقیقه`,
  };
}

// ============================================================
//  ۳. فرمت پول ایرانی (بدون ممیز شناور، با کاما)
// ============================================================

/**
 * فرمت مبلغ به تومان با جداکننده سه‌رقمی
 * @param {number|string} amount
 * @param {boolean} showUnit  نمایش "تومان" در انتها
 * @returns {string}  مثال: ۱,۲۵۰,۰۰۰ تومان
 */
function formatCurrency(amount, showUnit = true) {
  const num = parseInt(String(amount).replace(/,/g, ""), 10);
  if (isNaN(num)) return "—";
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return showUnit ? `${formatted} تومان` : formatted;
}

/**
 * پارس مبلغ از رشته (حذف کاما)
 * @param {string} str
 * @returns {number}
 */
function parseCurrency(str) {
  return (
    parseInt(
      String(str)
        .replace(/,/g, "")
        .replace(/[^0-9]/g, ""),
      10,
    ) || 0
  );
}

// ============================================================
//  ۴. ذخیره‌سازی داده در localStorage
// ============================================================

const DB_PREFIX = "ana_dashboard_";

/**
 * ذخیره داده
 * @param {string} key
 * @param {*} data
 */
function saveData(key, data) {
  try {
    localStorage.setItem(DB_PREFIX + key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("خطا در ذخیره‌سازی:", e);
    return false;
  }
}

/**
 * بارگذاری داده
 * @param {string} key
 * @param {*} defaultValue
 * @returns {*}
 */
function loadData(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(DB_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    console.error("خطا در بارگذاری:", e);
    return defaultValue;
  }
}

/**
 * حذف داده
 * @param {string} key
 */
function deleteData(key) {
  localStorage.removeItem(DB_PREFIX + key);
}

/**
 * دریافت همه کلیدهای ذخیره شده
 * @returns {string[]}
 */
function getAllKeys() {
  return Object.keys(localStorage)
    .filter((k) => k.startsWith(DB_PREFIX))
    .map((k) => k.replace(DB_PREFIX, ""));
}

// ============================================================
//  IndexedDB — برای عکس‌ها (ظرفیت خیلی بیشتر از localStorage)
// ============================================================
const IDB_NAME = "life_manager_files";
const IDB_STORE = "photos";
let _idbPromise = null;

function openIDB() {
  if (_idbPromise) return _idbPromise;
  _idbPromise = new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB در این مرورگر در دسترس نیست"));
      return;
    }
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return _idbPromise;
}

/** ذخیره‌ی یه عکس (dataURL) با یه کلید دلخواه (مثلاً بر اساس تاریخ/ساعت رویداد) */
async function idbSetPhoto(key, dataUrl) {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put({
      key,
      dataUrl,
      savedAt: new Date().toISOString(),
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGetPhoto(key) {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result ? req.result.dataUrl : null);
    req.onerror = () => reject(req.error);
  });
}

/** حذف واقعی از IndexedDB (فضا واقعاً آزاد می‌شه) */
async function idbDeletePhoto(key) {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGetAllPhotos() {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).getAll();
    req.onsuccess = () => {
      const map = {};
      (req.result || []).forEach((r) => {
        map[r.key] = r.dataUrl;
      });
      resolve(map);
    };
    req.onerror = () => reject(req.error);
  });
}

// ============================================================
//  IndexedDB رسانه — موزیک‌های ذخیره‌شده‌ی پخش‌کننده + دسته‌ی (handle)
//  پوشه‌ی avatar. دیتابیس جدا از دیتابیس عکس‌هاست تا به هم نخورن.
// ============================================================
const MEDIA_DB_NAME = "life_manager_media";
/* نسخه‌ی ۲: اضافه‌شدن store گالری تصاویر (کتابخانه‌ی موزیک و handleهای
   پوشه از نسخه‌ی ۱ هستن؛ IndexedDB با آپگرید نسخه، storeهای جدید رو
   بدون از دست دادن داده‌های قبلی اضافه می‌کنه) */
const MEDIA_DB_VERSION = 2;
const MEDIA_STORES = { tracks: "id", handles: "key", gallery: "id" };
let _mediaDbPromise = null;

function openMediaDB() {
  if (_mediaDbPromise) return _mediaDbPromise;
  _mediaDbPromise = new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB در این مرورگر در دسترس نیست"));
      return;
    }
    const req = indexedDB.open(MEDIA_DB_NAME, MEDIA_DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      Object.entries(MEDIA_STORES).forEach(([name, keyPath]) => {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath });
        }
      });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      _mediaDbPromise = null;
      reject(req.error);
    };
  });
  return _mediaDbPromise;
}

async function mediaPut(store, value) {
  const db = await openMediaDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

async function mediaGet(store, key) {
  const db = await openMediaDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(store, "readonly").objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function mediaGetAll(store) {
  const db = await openMediaDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(store, "readonly").objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function mediaDelete(store, key) {
  const db = await openMediaDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** پاک‌کردن کامل دیتابیس رسانه (برای «پاک‌کردن همه داده‌ها») */
async function mediaWipe() {
  try {
    if (_mediaDbPromise) {
      const db = await _mediaDbPromise;
      db.close();
      _mediaDbPromise = null;
    }
  } catch {
    /* اگه هیچ‌وقت باز نشده بود مهم نیست */
  }
  if (!window.indexedDB) return;
  await new Promise((resolve) => {
    const req = indexedDB.deleteDatabase(MEDIA_DB_NAME);
    req.onsuccess = req.onerror = req.onblocked = () => resolve();
  });
}

// ============================================================
//  ۵. اکسپورت / ایمپورت داده (localStorage + عکس‌های IndexedDB)
// ============================================================

/**
 * اکسپورت همه داده‌ها به JSON — شامل عکس‌های ذخیره‌شده در IndexedDB
 * @param {string} filename
 */
async function exportAllData(filename) {
  const keys = getAllKeys();
  const allData = {};
  keys.forEach((key) => {
    allData[key] = loadData(key);
  });

  let photos = {};
  try {
    photos = await idbGetAllPhotos();
  } catch (e) {
    /* IndexedDB در دسترس نبود؛ بدون عکس ادامه بده تا کل بکاپ گیر نکنه */
  }

  const meta = {
    exportedAt: formatJalali(new Date(), "full"),
    exportedAtISO: new Date().toISOString(),
    version: "1.1",
  };
  const output = { meta, data: allData, photos };
  const blob = new Blob([JSON.stringify(output, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `backup_${formatJalali(new Date())}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * ایمپورت داده از فایل JSON — عکس‌ها رو هم به IndexedDB برمی‌گردونه
 * @param {File} file
 * @param {function} callback  تابع بعد از ایمپورت موفق
 */
function importAllData(file, callback) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      const dataObj = parsed.data || parsed;
      Object.entries(dataObj).forEach(([key, value]) => {
        saveData(key, value);
      });

      if (parsed.photos) {
        for (const [key, dataUrl] of Object.entries(parsed.photos)) {
          try {
            await idbSetPhoto(key, dataUrl);
          } catch (err) {
            /* یه عکس ناقص نباید کل ایمپورت رو متوقف کنه */
          }
        }
      }

      if (typeof callback === "function") callback(true, parsed.meta || {});
    } catch (err) {
      console.error("خطا در ایمپورت:", err);
      if (typeof callback === "function") callback(false, {});
    }
  };
  reader.readAsText(file);
}

// ============================================================
//  ۶. توابع کمکی هزینه و مالی
// ============================================================

/**
 * افزودن یک تراکنش مالی
 * @param {{ title, amount, category, date, note }} tx
 */
function addTransaction(tx) {
  const list = loadData("transactions", []);
  list.push({
    id: Date.now(),
    title: tx.title,
    amount: parseCurrency(tx.amount),
    category: tx.category || "سایر",
    date: tx.date || new Date().toISOString(),
    note: tx.note || "",
  });
  saveData("transactions", list);
  return list;
}

/**
 * دریافت همه تراکنش‌ها
 * @returns {Array}
 */
function getTransactions() {
  return loadData("transactions", []);
}

/**
 * جمع هزینه‌های یک دسته در بازه زمانی
 * @param {string} category
 * @param {Date} from
 * @param {Date} to
 * @returns {{ total, count, formatted }}
 */
function sumByCategory(category, from, to) {
  const all = getTransactions();
  const filtered = all.filter((tx) => {
    const d = new Date(tx.date);
    const matchCat = category ? tx.category === category : true;
    const matchFrom = from ? d >= from : true;
    const matchTo = to ? d <= to : true;
    return matchCat && matchFrom && matchTo;
  });
  const total = filtered.reduce((s, tx) => s + tx.amount, 0);
  return {
    total,
    count: filtered.length,
    formatted: formatCurrency(total),
  };
}

// ============================================================
//  ۷. Notifications / یادآوری‌ها
// ============================================================

/**
 * ذخیره یادآوری
 * @param {{ title, datetime, category, repeat }} reminder
 */
function addReminder(reminder) {
  const list = loadData("reminders", []);
  list.push({
    id: Date.now(),
    title: reminder.title,
    datetime: reminder.datetime,
    category: reminder.category || "عمومی",
    repeat: reminder.repeat || "none",
    done: false,
  });
  saveData("reminders", list);
  return list;
}

/**
 * دریافت یادآوری‌های امروز
 * @returns {Array}
 */
function getTodayReminders() {
  const all = loadData("reminders", []);
  const todayStr = formatJalali(new Date());
  return all.filter((r) => {
    return formatJalali(new Date(r.datetime)) === todayStr && !r.done;
  });
}

// ============================================================
//  ۸. Export همه توابع (برای استفاده در dashboard.js)
// ============================================================

window.Utils = {
  // تاریخ
  toJalali,
  formatJalali,
  fromJalali,
  // زمان
  formatTime,
  calcDuration,
  // پول
  formatCurrency,
  parseCurrency,
  // ذخیره‌سازی
  saveData,
  loadData,
  deleteData,
  getAllKeys,
  // اکسپورت/ایمپورت
  exportAllData,
  importAllData,
  // عکس‌ها (IndexedDB)
  idbSetPhoto,
  idbGetPhoto,
  idbDeletePhoto,
  idbGetAllPhotos,
  // رسانه (موزیک + handle پوشه‌ی avatar)
  mediaPut,
  mediaGet,
  mediaGetAll,
  mediaDelete,
  mediaWipe,
  // مالی
  addTransaction,
  getTransactions,
  sumByCategory,
  // یادآوری
  addReminder,
  getTodayReminders,
  // ثابت‌ها
  JALALI_MONTHS,
  JALALI_DAYS_LONG,
  JALALI_DAYS_SHORT,
};
