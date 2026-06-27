// ===============================
// ALISA'S LIBRARY APP
// ===============================

let ownedBooks = [];
let ratingsBooks = [];
let selectedJournalRating = 0;
let selectedStickers = [];
let yearlyGoal = 75;
let currentChallenge = null;
let completedChallenges = [];
let rewards = [];

const APP_PASSWORD = "9705";

const STORAGE_KEY = "alisasLibraryDataV1";
const THEME_KEY = "alisasLibraryThemeV1";
const GOAL_KEY = "alisasLibraryGoalV1";
const UNLOCK_KEY = "alisasLibraryUnlockedV1";

const quotes = [
  "Your next favorite story may already be waiting on your shelf.",
  "Every unread book is a tiny adventure asking to begin.",
  "Some books feel like coming home.",
  "One more chapter can change the whole night.",
  "Read softly. Dream loudly.",
  "The library remembers every dream you borrowed.",
  "A cozy corner, a warm light, and a book can fix almost anything.",
  "Every page you turn is a small kind of magic.",
  "Books are doors. You only need to open one.",
  "Tonight’s escape is waiting between the pages."
];

const challengeIdeas = [
  "Read 50 pages today",
  "Finish this book in 5 days",
  "Read this book before buying another book",
  "Read for 30 minutes without touching your phone",
  "Write a small review after finishing",
  "Read the first 3 chapters tonight",
  "Read this book with a cozy drink",
  "Read this book during a rainy or cozy night",
  "Predict the ending before you start",
  "Read 100 pages this weekend",
  "Annotate 5 favorite lines",
  "Finish this book and pick one favorite quote"
];

const rewardIdeas = [
  { icon: "🔖", name: "Cozy Bookmark" },
  { icon: "🌸", name: "Flower Bookmark" },
  { icon: "☕", name: "Coffee Reading Badge" },
  { icon: "👑", name: "Book Queen Badge" },
  { icon: "⭐", name: "Golden Star Reward" },
  { icon: "📚", name: "Library Badge" },
  { icon: "🌙", name: "Moonlight Reader Badge" },
  { icon: "🧸", name: "Cozy Teddy Reward" },
  { icon: "🕯️", name: "Candlelight Reader Badge" },
  { icon: "🎀", name: "Cute Ribbon Reward" }
];

// ===============================
// ELEMENTS
// ===============================

const passwordScreen = document.getElementById("passwordScreen");
const passwordInput = document.getElementById("passwordInput");
const passwordBtn = document.getElementById("passwordBtn");
const passwordMessage = document.getElementById("passwordMessage");

const welcomeScreen = document.getElementById("welcomeScreen");
const openingQuote = document.getElementById("openingQuote");
const enterLibraryBtn = document.getElementById("enterLibraryBtn");

const ownedExcelInput = document.getElementById("ownedExcelInput");
const ratingsExcelInput = document.getElementById("ratingsExcelInput");
const importMessage = document.getElementById("importMessage");

const bookGrid = document.getElementById("bookGrid");
const shelfArea = document.getElementById("shelfArea");

const homeSearchInput = document.getElementById("homeSearchInput");
const homeSearchBtn = document.getElementById("homeSearchBtn");
const homeSearchResults = document.getElementById("homeSearchResults");

const librarySearchInput = document.getElementById("librarySearchInput");
const statusFilter = document.getElementById("statusFilter");
const formatFilter = document.getElementById("formatFilter");

const currentReadingTitle = document.getElementById("currentReadingTitle");
const currentReadingInfo = document.getElementById("currentReadingInfo");

const bookModal = document.getElementById("bookModal");
const bookModalContent = document.getElementById("bookModalContent");
const closeBookModal = document.getElementById("closeBookModal");

const addBookModal = document.getElementById("addBookModal");
const addBookBtn = document.getElementById("addBookBtn");
const closeAddModal = document.getElementById("closeAddModal");
const saveManualBookBtn = document.getElementById("saveManualBookBtn");

const fetchCoversBtn = document.getElementById("fetchCoversBtn");
const exportBackupBtn = document.getElementById("exportBackupBtn");
const exportBackupBtnLibrary = document.getElementById("exportBackupBtnLibrary");
const importBackupInput = document.getElementById("importBackupInput");
const settingsMessage = document.getElementById("settingsMessage");

const musicPlayer = document.getElementById("musicPlayer");
const lampBtn = document.getElementById("lampBtn");
const booknookDarkLayer = document.getElementById("booknookDarkLayer");
const musicMenuBtn = document.getElementById("musicMenuBtn");
const musicPanel = document.getElementById("musicPanel");
const stopMusicBtn = document.getElementById("stopMusicBtn");

const timerOpenBtn = document.getElementById("timerOpenBtn");
const timerPanel = document.getElementById("timerPanel");
const readingTimer = document.getElementById("readingTimer");
const startReadingBtn = document.getElementById("startReadingBtn");
const pauseReadingBtn = document.getElementById("pauseReadingBtn");
const resetReadingBtn = document.getElementById("resetReadingBtn");

const gameStage = document.getElementById("gamePlayStage");
const gameResult = document.getElementById("gameResult");

const newChallengeBtn = document.getElementById("newChallengeBtn");
const completeChallengeBtn = document.getElementById("completeChallengeBtn");
const currentChallengeBox = document.getElementById("currentChallengeBox");
const rewardShelf = document.getElementById("rewardShelf");
const challengeHistory = document.getElementById("challengeHistory");

let timerSeconds = 0;
let timerInterval = null;

// ===============================
// START
// ===============================

openingQuote.textContent = quotes[Math.floor(Math.random() * quotes.length)];

if (localStorage.getItem(UNLOCK_KEY) === "yes") {
  passwordScreen.classList.add("hidden");
  welcomeScreen.classList.remove("hidden");
}

passwordBtn.addEventListener("click", unlockApp);

passwordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    unlockApp();
  }
});

function unlockApp() {
  const typedPassword = passwordInput.value.trim();

  if (typedPassword === APP_PASSWORD) {
    passwordScreen.classList.add("hidden");
    welcomeScreen.classList.remove("hidden");
    passwordMessage.textContent = "";
    passwordInput.value = "";
  } else {
    passwordMessage.textContent = "Wrong password. Try again.";
    passwordInput.value = "";
  }
}

enterLibraryBtn.addEventListener("click", () => {
  welcomeScreen.classList.add("hidden");
});

loadFromStorage();
loadTheme();
renderAll();

// ===============================
// HELPERS
// ===============================

function makeId() {
  return "book_" + Date.now() + "_" + Math.random().toString(16).slice(2);
}

function clean(value) {
  return String(value ?? "").trim();
}

function escapeHTML(value) {
  return clean(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function sampleBooks(list, count) {
  const copy = [...list];
  const result = [];

  while (copy.length && result.length < count) {
    const index = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(index, 1)[0]);
  }

  return result;
}

function getUnreadBooks() {
  return ownedBooks.filter((book) => book.status !== "Read");
}

function bookText(book) {
  return `${book.title || ""} ${book.author || ""} ${book.genre || ""}`.toLowerCase();
}

function matchAnyKeyword(book, keywords) {
  const text = bookText(book);
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

function titleKey(title) {
  return clean(title).toLowerCase().replace(/[^a-z0-9]/g, "");
}

// ===============================
// NAVIGATION
// ===============================

document.querySelectorAll("[data-section]").forEach((btn) => {
  btn.addEventListener("click", () => {
    openSection(btn.dataset.section);
  });
});

function openSection(sectionId) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  const section = document.getElementById(sectionId);

  if (section) {
    section.classList.add("active");
  }

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.section === sectionId);
  });

  window.scrollTo(0, 0);
}

// ===============================
// STORAGE
// ===============================

function saveToStorage() {
  const data = {
    ownedBooks,
    ratingsBooks,
    currentChallenge,
    completedChallenges,
    rewards
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      const data = JSON.parse(saved);
      ownedBooks = data.ownedBooks || [];
      ratingsBooks = data.ratingsBooks || [];
      currentChallenge = data.currentChallenge || null;
      completedChallenges = data.completedChallenges || [];
      rewards = data.rewards || [];
      normalizeSavedBooks();
    } catch (error) {
      console.log("Storage load error", error);
    }
  }

  yearlyGoal = Number(localStorage.getItem(GOAL_KEY)) || 75;
}

function normalizeSavedBooks() {
  ownedBooks = ownedBooks.map((book) => ({
    id: book.id || makeId(),
    title: book.title || "",
    author: book.author || "",
    status: book.status || "Unread",
    genre: book.genre || "",
    publication: book.publication || "",
    pages: Number(book.pages) || 0,
    price: book.price || "",
    store: book.store || "",
    format: book.format || "Physical",
    rating: book.rating || "",
    review: book.review || "",
    favoriteQuote: book.favoriteQuote || "",
    stickers: Array.isArray(book.stickers) ? book.stickers : [],
    startDate: book.startDate || "",
    endDate: book.endDate || "",
    month: book.month || "",
    coverUrl: book.coverUrl || "",
    source: book.source || "Saved"
  }));
}

// ===============================
// EXCEL IMPORT
// ===============================

ownedExcelInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];

  if (!file) return;

  const rows = await readExcel(file);
  ownedBooks = parseOwnedBooks(rows);

  mergeRatingsIntoOwnedBooks();

  saveToStorage();
  renderAll();

  importMessage.innerHTML = `Owned books imported: <b>${ownedBooks.length}</b>`;
});

ratingsExcelInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];

  if (!file) return;

  const rows = await readExcel(file);
  ratingsBooks = parseRatingsBooks(rows);

  mergeRatingsIntoOwnedBooks();

  saveToStorage();
  renderAll();

  importMessage.innerHTML = `2026 ratings imported: <b>${ratingsBooks.length}</b>`;
});

async function readExcel(file) {
  if (!window.XLSX) {
    alert("Excel reader needs internet the first time because it loads SheetJS.");
    return [];
  }

  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, {
    cellDates: true
  });

  const sheetName = workbook.SheetNames.includes("Sheet1")
    ? "Sheet1"
    : workbook.SheetNames[0];

  const sheet = workbook.Sheets[sheetName];

  return XLSX.utils.sheet_to_json(sheet, {
    defval: "",
    raw: false
  });
}

function normalizeHeaderObject(row) {
  const newRow = {};

  Object.keys(row).forEach((key) => {
    const cleanKey = key.trim().toLowerCase();
    newRow[cleanKey] = row[key];
  });

  return newRow;
}

function parseOwnedBooks(rows) {
  const books = [];

  rows.forEach((originalRow, index) => {
    const row = normalizeHeaderObject(originalRow);

    const title = clean(
      row["book title"] ||
      row["title"] ||
      row["book"] ||
      ""
    );

    if (!title) return;

    const readValue = clean(
      row["read"] ||
      row["status"] ||
      ""
    );

    books.push({
      id: makeId(),
      serialNo: clean(row["serial no"] || row["s.no"] || index + 1),
      title,
      author: clean(row["author"]),
      status: convertReadStatus(readValue),
      genre: clean(row["genre"]),
      publication: formatDate(row["publication"]),
      pages: Number(clean(row["pages"])) || 0,
      price: clean(row["price"]),
      store: clean(row["store"]),
      format: "Physical",
      rating: "",
      review: "",
      favoriteQuote: "",
      stickers: [],
      startDate: "",
      endDate: "",
      month: "",
      coverUrl: "",
      source: "Owned Excel"
    });
  });

  return books;
}

function parseRatingsBooks(rows) {
  const books = [];

  rows.forEach((originalRow, index) => {
    const row = normalizeHeaderObject(originalRow);

    const title = clean(
      row["book title"] ||
      row["title"] ||
      row["book"] ||
      ""
    );

    if (!title) return;

    books.push({
      id: makeId(),
      serialNo: clean(row["s.no"] || row["serial no"] || index + 1),
      title,
      author: "",
      startDate: formatDate(row["start date"]),
      month: formatMonth(row["month"]),
      endDate: formatDate(row["end date"]),
      genre: clean(row["genre"]),
      rating: clean(row["rating"]),
      review: clean(row["review notes"]),
      favoriteQuote: "",
      stickers: [],
      format: normalizeFormat(row["format"]),
      status: "Read",
      coverUrl: "",
      source: "2026 Ratings Excel"
    });
  });

  return books;
}

function convertReadStatus(value) {
  const status = clean(value).toLowerCase();

  if (status === "yes" || status === "read") return "Read";
  if (status === "no" || status === "unread") return "Unread";
  if (status === "reading" || status === "currently reading") return "Currently Reading";

  return "Unread";
}

function normalizeFormat(value) {
  const format = clean(value).toLowerCase();

  if (format.includes("kindle")) return "Kindle";
  if (format.includes("audio")) return "Audio";
  if (format.includes("digital")) return "Digital";
  if (format.includes("libby")) return "Libby";
  if (format.includes("borrow")) return "Borrowed";
  if (format.includes("pdf")) return "PDF";
  if (format.includes("physical")) return "Physical";

  return clean(value) || "Physical";
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (!isNaN(date)) {
    return date.toISOString().slice(0, 10);
  }

  return clean(value);
}

function formatMonth(value) {
  if (!value) return "";

  const date = new Date(value);

  if (!isNaN(date)) {
    return date.toLocaleString("en-US", { month: "short" });
  }

  return clean(value);
}

function mergeRatingsIntoOwnedBooks() {
  ratingsBooks.forEach((ratingBook) => {
    const match = ownedBooks.find(
      (owned) => titleKey(owned.title) === titleKey(ratingBook.title)
    );

    if (match) {
      match.status = "Read";
      match.startDate = ratingBook.startDate;
      match.endDate = ratingBook.endDate;
      match.month = ratingBook.month;
      match.rating = ratingBook.rating;
      match.review = ratingBook.review;
      match.format = ratingBook.format;
      match.genre = match.genre || ratingBook.genre;
    } else {
      ownedBooks.push({
        ...ratingBook,
        source: "2026 Ratings Excel"
      });
    }
  });
}

// ===============================
// RENDER ALL
// ===============================

function renderAll() {
  renderHomeCurrentReading();
  renderLibrary();
  renderShelves();
  renderStats();
  renderReadmap();
  renderChallenges();
}

function renderHomeCurrentReading() {
  const current = ownedBooks.find(
    (book) => book.status === "Currently Reading"
  );

  if (!current) {
    currentReadingTitle.textContent = "No current book yet";
    currentReadingInfo.textContent = "Books marked READING will show here.";
    return;
  }

  currentReadingTitle.textContent = current.title;
  currentReadingInfo.textContent = `${current.author || "Unknown author"} • ${current.pages || 0} pages`;
}

function getFilteredBooks() {
  const query = clean(librarySearchInput.value).toLowerCase();
  const status = statusFilter.value;
  const format = formatFilter.value;

  return ownedBooks.filter((book) => {
    const matchesQuery =
      !query ||
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.genre.toLowerCase().includes(query);

    const matchesStatus = !status || book.status === status;
    const matchesFormat = !format || book.format === format;

    return matchesQuery && matchesStatus && matchesFormat;
  });
}

function renderLibrary() {
  const books = getFilteredBooks();

  if (!books.length) {
    bookGrid.innerHTML = `<p>No books found. Upload Excel, add a book, or change filters.</p>`;
    return;
  }

  bookGrid.innerHTML = books.map((book) => `
    <article class="book-card">
      <div class="book-cover">
        ${book.coverUrl ? `<img src="${book.coverUrl}" alt="${escapeHTML(book.title)} cover">` : escapeHTML(book.title)}
      </div>

      <div>
        <h3>${escapeHTML(book.title)}</h3>
        <p>${escapeHTML(book.author || "Unknown Author")}</p>
        <p>${escapeHTML(book.status)} • ${escapeHTML(book.format)}</p>
        <p>${escapeHTML(book.genre || "")}</p>
        <p>${book.rating ? "⭐ " + escapeHTML(book.rating) : ""}</p>
        <p>${book.stickers && book.stickers.length ? book.stickers.join(" ") : ""}</p>
      </div>

      <div class="book-card-actions">
        <button onclick="showBookDetails('${book.id}')">Details</button>
        <button onclick="setCurrentlyReading('${book.id}')">Reading</button>
        <button onclick="markBookRead('${book.id}')">Mark Read</button>
      </div>
    </article>
  `).join("");
}

function renderShelves() {
  const groups = {
    "Currently Reading": ownedBooks.filter(book => book.status === "Currently Reading"),
    "Unread / TBR": ownedBooks.filter(book => book.status === "Unread"),
    "Read": ownedBooks.filter(book => book.status === "Read"),
    "Favorites": ownedBooks.filter(book => Number(book.rating) >= 4.5)
  };

  shelfArea.innerHTML = Object.entries(groups).map(([groupName, books]) => `
    <div>
      <h3 class="shelf-title">${groupName} (${books.length})</h3>
      <div class="shelf-row">
        ${books.length ? books.map(book => `
          <button
            class="book-spine"
            style="background:${spineColor(book.title)}"
            onclick="showBookDetails('${book.id}')"
          >
            ${escapeHTML(book.title)}
          </button>
        `).join("") : "<p>No books here yet.</p>"}
      </div>
    </div>
  `).join("");
}

function spineColor(title) {
  const colors = [
    "#57331f", "#173c30", "#2f355d", "#62313b",
    "#75511d", "#203447", "#694723", "#42294c",
    "#49502b", "#8a3d24"
  ];

  return colors[title.length % colors.length];
}

// ===============================
// HOME SEARCH + FILTERS
// ===============================

homeSearchBtn.addEventListener("click", searchHomeLibrary);

homeSearchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") searchHomeLibrary();
});

librarySearchInput.addEventListener("input", renderLibrary);
statusFilter.addEventListener("change", renderLibrary);
formatFilter.addEventListener("change", renderLibrary);

function searchHomeLibrary() {
  const query = clean(homeSearchInput.value).toLowerCase();

  if (!query) {
    homeSearchResults.innerHTML = "Type a book title or author.";
    return;
  }

  const results = ownedBooks.filter((book) => {
    return (
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query)
    );
  });

  if (!results.length) {
    homeSearchResults.innerHTML = `
      <b>No match found.</b><br>
      You may not own this book yet.
    `;
    return;
  }

  homeSearchResults.innerHTML = results.map(book => `
    <div>
      <b>${escapeHTML(book.title)}</b><br>
      ${escapeHTML(book.author || "Unknown Author")}<br>
      Status: ${escapeHTML(book.status)}
    </div>
    <hr>
  `).join("");
}

// ===============================
// BOOK ACTIONS
// ===============================

window.showBookDetails = function (bookId) {
  const book = ownedBooks.find((item) => item.id === bookId);
  if (!book) return;

  bookModalContent.innerHTML = `
    <div class="detail-layout">
      <div class="detail-cover">
        ${book.coverUrl ? `<img src="${book.coverUrl}" alt="${escapeHTML(book.title)} cover">` : escapeHTML(book.title)}
      </div>

      <div>
        <h2>${escapeHTML(book.title)}</h2>
        <p><b>Author:</b> ${escapeHTML(book.author || "")}</p>
        <p><b>Status:</b> ${escapeHTML(book.status || "")}</p>
        <p><b>Genre:</b> ${escapeHTML(book.genre || "")}</p>
        <p><b>Publication:</b> ${escapeHTML(book.publication || "")}</p>
        <p><b>Pages:</b> ${escapeHTML(book.pages || "")}</p>
        <p><b>Format:</b> ${escapeHTML(book.format || "")}</p>
        <p><b>Rating:</b> ${escapeHTML(book.rating || "")}</p>
        <p><b>Start Date:</b> ${escapeHTML(book.startDate || "")}</p>
        <p><b>End Date:</b> ${escapeHTML(book.endDate || "")}</p>
        <p><b>Stickers:</b> ${book.stickers && book.stickers.length ? book.stickers.join(" ") : ""}</p>
        <p><b>Favorite Quote:</b> ${escapeHTML(book.favoriteQuote || "")}</p>
        <p><b>Review:</b> ${escapeHTML(book.review || "")}</p>

        <button onclick="openJournalForBook('${book.id}')">Open Journal</button>
      </div>
    </div>
  `;

  bookModal.classList.remove("hidden");
};

window.setCurrentlyReading = function (bookId) {
  const book = ownedBooks.find((item) => item.id === bookId);
  if (!book) return;

  book.status = "Currently Reading";
  saveToStorage();
  renderAll();
  openSection("home");
};

window.markBookRead = function (bookId) {
  const book = ownedBooks.find((item) => item.id === bookId);
  if (!book) return;

  book.status = "Read";
  book.endDate = book.endDate || new Date().toISOString().slice(0, 10);

  saveToStorage();
  renderAll();
};

closeBookModal.addEventListener("click", () => {
  bookModal.classList.add("hidden");
});

// ===============================
// MANUAL ADD BOOK
// ===============================

addBookBtn.addEventListener("click", () => {
  addBookModal.classList.remove("hidden");
});

closeAddModal.addEventListener("click", () => {
  addBookModal.classList.add("hidden");
});

saveManualBookBtn.addEventListener("click", () => {
  const title = clean(document.getElementById("manualTitle").value);

  if (!title) {
    alert("Book title is required.");
    return;
  }

  ownedBooks.push({
    id: makeId(),
    title,
    author: clean(document.getElementById("manualAuthor").value),
    genre: clean(document.getElementById("manualGenre").value),
    status: document.getElementById("manualStatus").value,
    pages: Number(document.getElementById("manualPages").value) || 0,
    format: document.getElementById("manualFormat").value,
    rating: "",
    review: "",
    favoriteQuote: "",
    stickers: [],
    startDate: "",
    endDate: "",
    month: "",
    coverUrl: "",
    source: "Manual Entry"
  });

  saveToStorage();
  renderAll();
  addBookModal.classList.add("hidden");
});

// ===============================
// OPEN LIBRARY COVER FETCH
// ===============================

fetchCoversBtn.addEventListener("click", fetchAllCovers);

async function fetchAllCovers() {
  if (!ownedBooks.length) {
    alert("Upload or add books first.");
    return;
  }

  importMessage.textContent = "Fetching covers from Open Library...";

  for (const book of ownedBooks) {
    if (!book.coverUrl) {
      const cover = await findOpenLibraryCover(book.title, book.author);
      if (cover) book.coverUrl = cover;
    }
  }

  saveToStorage();
  renderAll();

  importMessage.textContent = "Cover fetch finished.";
}

async function findOpenLibraryCover(title, author) {
  try {
    const url =
      "https://openlibrary.org/search.json?title=" +
      encodeURIComponent(title) +
      "&author=" +
      encodeURIComponent(author || "");

    const response = await fetch(url);
    const data = await response.json();

    const doc = data.docs && data.docs[0];

    if (doc && doc.cover_i) {
      return `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
    }

    return "";
  } catch (error) {
    console.log("Cover fetch error", error);
    return "";
  }
}

// ===============================
// JOURNAL + STICKERS
// ===============================

document.querySelectorAll("#starButtons button").forEach((button) => {
  button.addEventListener("click", () => {
    selectedJournalRating = Number(button.dataset.star);
    updateStarButtons();
    updateJournalPreview();
  });
});

function updateStarButtons() {
  document.querySelectorAll("#starButtons button").forEach((button) => {
    const star = Number(button.dataset.star);

    if (star <= selectedJournalRating) {
      button.textContent = "⭐";
      button.classList.add("active");
    } else {
      button.textContent = "☆";
      button.classList.remove("active");
    }
  });
}

document.querySelectorAll("#stickerPicker button").forEach((button) => {
  button.addEventListener("click", () => {
    const sticker = button.dataset.sticker;

    if (selectedStickers.includes(sticker)) {
      selectedStickers = selectedStickers.filter((item) => item !== sticker);
      button.classList.remove("selected");
    } else {
      selectedStickers.push(sticker);
      button.classList.add("selected");
    }

    updateStickerDisplay();
    updateJournalPreview();
  });
});

document.getElementById("clearStickersBtn").addEventListener("click", () => {
  selectedStickers = [];

  document.querySelectorAll("#stickerPicker button").forEach((btn) => {
    btn.classList.remove("selected");
  });

  updateStickerDisplay();
  updateJournalPreview();
});

function updateStickerDisplay() {
  const selectedStickersBox = document.getElementById("selectedStickers");

  selectedStickersBox.textContent = selectedStickers.length
    ? selectedStickers.join(" ")
    : "No stickers yet.";
}

function updateJournalPreview() {
  const title = clean(document.getElementById("journalTitle").value) || "Your review page";
  const review = clean(document.getElementById("journalReview").value) || "Your selected stickers and review will appear here.";

  document.getElementById("journalPreviewTitle").textContent = title;
  document.getElementById("journalPreviewText").textContent = review;
  document.getElementById("journalPreviewStickers").textContent = selectedStickers.length
    ? selectedStickers.join(" ")
    : "✨ 📚 ☕";
}

["journalTitle", "journalReview", "journalQuote", "journalAuthor"].forEach((id) => {
  document.getElementById(id).addEventListener("input", updateJournalPreview);
});

window.openJournalForBook = function (bookId) {
  const book = ownedBooks.find((item) => item.id === bookId);
  if (!book) return;

  openSection("journal");

  document.getElementById("journalTitle").value = book.title;
  document.getElementById("journalAuthor").value = book.author || "";
  document.getElementById("journalFormat").value = book.format || "Physical";
  document.getElementById("journalReview").value = book.review || "";
  document.getElementById("journalQuote").value = book.favoriteQuote || "";

  selectedJournalRating = Number(book.rating) || 0;
  selectedStickers = Array.isArray(book.stickers) ? [...book.stickers] : [];

  updateStarButtons();
  syncStickerButtons();
  updateStickerDisplay();
  updateJournalPreview();

  bookModal.classList.add("hidden");
};

function syncStickerButtons() {
  document.querySelectorAll("#stickerPicker button").forEach((button) => {
    button.classList.toggle("selected", selectedStickers.includes(button.dataset.sticker));
  });
}

document.getElementById("saveJournalBtn").addEventListener("click", () => {
  const title = clean(document.getElementById("journalTitle").value);

  if (!title) {
    alert("Enter a book title.");
    return;
  }

  let book = ownedBooks.find(
    (item) => titleKey(item.title) === titleKey(title)
  );

  if (!book) {
    book = {
      id: makeId(),
      title,
      author: "",
      genre: "",
      status: "Read",
      pages: 0,
      format: "Physical",
      rating: "",
      review: "",
      favoriteQuote: "",
      stickers: [],
      startDate: "",
      endDate: "",
      month: "",
      coverUrl: "",
      source: "Journal Entry"
    };

    ownedBooks.push(book);
  }

  book.author = clean(document.getElementById("journalAuthor").value);
  book.rating = selectedJournalRating;
  book.review = clean(document.getElementById("journalReview").value);
  book.favoriteQuote = clean(document.getElementById("journalQuote").value);
  book.format = document.getElementById("journalFormat").value;
  book.status = "Read";
  book.stickers = [...selectedStickers];

  saveToStorage();
  renderAll();

  alert("Journal review saved.");
});

// ===============================
// BOOK NOOK
// ===============================

lampBtn.addEventListener("click", () => {
  booknookDarkLayer.classList.toggle("dark");
});

musicMenuBtn.addEventListener("click", () => {
  musicPanel.classList.toggle("hidden");
});

document.querySelectorAll(".music-choice").forEach((button) => {
  button.addEventListener("click", () => {
    const file = button.dataset.music;
    musicPlayer.src = `assets/music/${file}`;
    musicPlayer.play();
  });
});

stopMusicBtn.addEventListener("click", () => {
  musicPlayer.pause();
  musicPlayer.currentTime = 0;
});

timerOpenBtn.addEventListener("click", () => {
  timerPanel.classList.toggle("hidden");
});

startReadingBtn.addEventListener("click", () => {
  if (timerInterval) return;

  timerInterval = setInterval(() => {
    timerSeconds++;
    readingTimer.textContent = formatTimer(timerSeconds);
  }, 1000);
});

pauseReadingBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  timerInterval = null;
});

resetReadingBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  timerInterval = null;
  timerSeconds = 0;
  readingTimer.textContent = "00:00:00";
});

function formatTimer(seconds) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");

  return `${h}:${m}:${s}`;
}

// ===============================
// TBR GAMES
// ===============================

document.querySelectorAll(".game-btn").forEach((button) => {
  button.addEventListener("click", () => {
    playGame(button.dataset.game);
  });
});

function playGame(gameName) {
  if (gameName === "Spin the Wheel") return animateWheel();
  if (gameName === "TBR Jar Shake") return animateJar();
  if (gameName === "Q and A Picker") return startQAGame();
  if (gameName === "Truth or Dare") return startTruthDare();
  if (gameName === "Pick a Card") return startCardGame();
  if (gameName === "Dice Roll") return startDiceRoll();
  if (gameName === "Magic Spell") return startMagicSpell();
  if (gameName === "Mood Picker") return startMoodPicker();
  if (gameName === "Short Pages") return startShortPages();
  if (gameName === "Genre Picker") return startGenrePicker();

  const pick = pickUnreadBook();

  if (pick) {
    showReveal(gameName, pick);
  }
}

function pickUnreadBook(pool = getUnreadBooks()) {
  if (!pool.length) return null;
  return randomFrom(pool);
}

function noBookMessage(gameName) {
  gameStage.innerHTML = `
    <div class="magic-card-reveal">
      <div>
        <h3>${escapeHTML(gameName)}</h3>
        <p>No matching unread books found.</p>
      </div>
    </div>
  `;

  gameResult.innerHTML = `
    <b>${escapeHTML(gameName)}</b><br>
    No matching unread books found.
  `;
}

function animateWheel() {
  const pick = pickUnreadBook();

  if (!pick) return noBookMessage("Spin the Wheel");

  const rotation = 1440 + Math.floor(Math.random() * 720);

  gameStage.innerHTML = `
    <div class="wheel-wrap">
      <div class="wheel-pointer"></div>
      <div id="tbrWheel" class="tbr-wheel"></div>
    </div>
  `;

  const wheel = document.getElementById("tbrWheel");

  setTimeout(() => {
    wheel.style.transform = `rotate(${rotation}deg)`;
  }, 100);

  setTimeout(() => {
    showReveal("Spin the Wheel", pick);
  }, 2700);
}

function animateJar() {
  const pick = pickUnreadBook();

  if (!pick) return noBookMessage("TBR Jar Shake");

  gameStage.innerHTML = `
    <div id="tbrJar" class="tbr-jar">
      🫙
      <span class="jar-paper" style="--rotate:-12deg"></span>
      <span class="jar-paper" style="--rotate:18deg"></span>
      <span class="jar-paper" style="--rotate:8deg"></span>
    </div>
  `;

  const jar = document.getElementById("tbrJar");

  setTimeout(() => {
    jar.classList.add("jar-shake");
  }, 100);

  setTimeout(() => {
    showReveal("TBR Jar Shake", pick);
  }, 2500);
}

function startQAGame() {
  const questions = [
    {
      question: "What mood are you in?",
      options: [
        { label: "Moody", keywords: ["dark", "mystery", "thriller", "gothic"] },
        { label: "Excited", keywords: ["fast", "thriller", "murder", "crime"] },
        { label: "Happy", keywords: ["romance", "cozy", "love"] },
        { label: "Sad", keywords: ["emotional", "trauma", "family", "drama"] }
      ]
    },
    {
      question: "How many pages would you like?",
      options: [
        { label: "Under 250", pages: 250 },
        { label: "Under 300", pages: 300 },
        { label: "Under 350", pages: 350 },
        { label: "Under 400", pages: 400 }
      ]
    },
    {
      question: "Pick a vibe.",
      options: [
        { label: "Serial killer", keywords: ["serial", "killer", "murder"] },
        { label: "Missing person", keywords: ["missing", "disappear", "gone"] },
        { label: "Secrets", keywords: ["secret", "lie", "lies", "hidden"] },
        { label: "Creepy house", keywords: ["house", "home", "mansion", "gothic"] }
      ]
    },
    {
      question: "What kind of night is this?",
      options: [
        { label: "Rainy reading", keywords: ["mystery", "thriller", "dark"] },
        { label: "Cozy blanket", keywords: ["cozy", "romance", "family"] },
        { label: "Scary lights off", keywords: ["horror", "ghost", "haunting"] },
        { label: "Detective mode", keywords: ["crime", "detective", "murder"] }
      ]
    }
  ];

  const q = randomFrom(questions);

  gameStage.innerHTML = `
    <div class="qa-box">
      <p class="tiny-title">Q and A Picker</p>
      <h2>${escapeHTML(q.question)}</h2>
      <div class="qa-options">
        ${q.options.map((option, index) => `
          <button class="qa-option" onclick="answerQA(${index})">${escapeHTML(option.label)}</button>
        `).join("")}
      </div>
    </div>
  `;

  window.answerQA = function (index) {
    const option = q.options[index];
    let pool = getUnreadBooks();

    if (option.pages) {
      pool = pool.filter((book) => Number(book.pages) > 0 && Number(book.pages) <= option.pages);
    }

    if (option.keywords) {
      const matched = pool.filter((book) => matchAnyKeyword(book, option.keywords));

      if (matched.length) {
        pool = matched;
      }
    }

    const pick = pickUnreadBook(pool);

    if (!pick) return noBookMessage("Q and A Picker");

    showReveal(`Q and A Picker: ${option.label}`, pick);
  };
}

function startTruthDare() {
  gameStage.innerHTML = `
    <div class="choice-box">
      <p class="tiny-title">Truth or Dare</p>
      <h2>Choose your fate</h2>
      <div class="truth-dare-options">
        <button class="truth-dare-option" onclick="truthDareChoice('Truth')">Truth</button>
        <button class="truth-dare-option" onclick="truthDareChoice('Dare')">Dare</button>
      </div>
    </div>
  `;

  window.truthDareChoice = function (choice) {
    const pick = pickUnreadBook();

    if (!pick) return noBookMessage("Truth or Dare");

    const truthQuotes = [
      "Tell the truth after reading this: did it deserve the hype?",
      "Your truth mission: write one honest sentence after every 50 pages.",
      "Be honest: are you brave enough to finish this without checking reviews?",
      "Truth challenge: predict the ending before you start."
    ];

    const dareQuotes = [
      "I dare you to read this book in 5 days.",
      "I dare you to read 50 pages tonight.",
      "I dare you to start this book with no spoilers.",
      "I dare you to read this before buying another book."
    ];

    const quote = choice === "Truth" ? randomFrom(truthQuotes) : randomFrom(dareQuotes);

    showReveal(`Truth or Dare: ${choice}`, pick, quote);
  };
}

function startCardGame() {
  const cards = ["Queen", "King", "Jack", "Ace"];

  gameStage.innerHTML = `
    <div class="choice-box">
      <p class="tiny-title">Pick a Card</p>
      <h2>Choose one card</h2>
      <div class="card-grid">
        ${cards.map(card => `
          <button class="card-pick" onclick="pickCard('${card}', this)">${card}</button>
        `).join("")}
      </div>
    </div>
  `;

  window.pickCard = function (card, button) {
    const pick = pickUnreadBook();

    if (!pick) return noBookMessage("Pick a Card");

    button.classList.add("flipped");

    setTimeout(() => {
      showReveal(`Pick a Card: ${card}`, pick);
    }, 800);
  };
}

function startDiceRoll() {
  const pool = getUnreadBooks();

  if (!pool.length) return noBookMessage("Dice Roll");

  gameStage.innerHTML = `
    <div class="dice-face" id="diceFace">🎲</div>
  `;

  const diceFace = document.getElementById("diceFace");
  let rolls = 0;

  const interval = setInterval(() => {
    const number = Math.floor(Math.random() * 6) + 1;
    diceFace.textContent = number;
    rolls++;

    if (rolls > 12) {
      clearInterval(interval);

      const finalNumber = Math.floor(Math.random() * 6) + 1;
      diceFace.textContent = finalNumber;

      const choices = sampleBooks(pool, finalNumber);

      setTimeout(() => {
        gameStage.innerHTML = `
          <div class="choice-box">
            <p class="tiny-title">Dice Roll</p>
            <h2>You rolled ${finalNumber}</h2>
            <p>Pick one book:</p>

            <div class="book-choice-grid">
              ${choices.map(book => `
                <div class="book-mini-card">
                  <h3>${escapeHTML(book.title)}</h3>
                  <p>${escapeHTML(book.author || "")}</p>
                  <button onclick="showReveal('Dice Roll', ownedBooks.find(b => b.id === '${book.id}'))">Choose</button>
                </div>
              `).join("")}
            </div>
          </div>
        `;
      }, 700);
    }
  }, 120);
}

function startMagicSpell() {
  const pick = pickUnreadBook();

  if (!pick) return noBookMessage("Magic Spell");

  gameStage.innerHTML = `
    <div class="choice-box">
      <div class="sparkles"></div>
      <div class="crystal-ball">🔮</div>
      <h2>Reading your bookish fortune...</h2>
    </div>
  `;

  setTimeout(() => {
    showReveal("Magic Spell", pick, "The crystal ball has chosen your next read.");
  }, 2200);
}

function startMoodPicker() {
  const moods = [
    { label: "Moody", keywords: ["dark", "mystery", "thriller", "gothic"] },
    { label: "Excited", keywords: ["fast", "murder", "crime", "thriller"] },
    { label: "Happy", keywords: ["romance", "love", "cozy"] },
    { label: "Sad", keywords: ["emotional", "trauma", "family", "drama"] },
    { label: "Scared", keywords: ["horror", "haunting", "ghost", "dark"] },
    { label: "Detective", keywords: ["detective", "murder", "crime", "mystery"] }
  ];

  gameStage.innerHTML = `
    <div class="dropdown-game-box">
      <p class="tiny-title">Mood Picker</p>
      <h2>Select your mood</h2>

      <select id="moodDropdown">
        ${moods.map((mood, index) => `<option value="${index}">${escapeHTML(mood.label)}</option>`).join("")}
      </select>

      <button onclick="chooseMoodBook()">Reveal Book</button>
    </div>
  `;

  window.chooseMoodBook = function () {
    const index = Number(document.getElementById("moodDropdown").value);
    const mood = moods[index];

    let pool = getUnreadBooks();
    const matched = pool.filter((book) => matchAnyKeyword(book, mood.keywords));

    if (matched.length) {
      pool = matched;
    }

    const pick = pickUnreadBook(pool);

    if (!pick) return noBookMessage("Mood Picker");

    showReveal(`Mood Picker: ${mood.label}`, pick);
  };
}

function startShortPages() {
  const pool = getUnreadBooks().filter((book) => Number(book.pages) > 0 && Number(book.pages) < 300);

  const pick = pickUnreadBook(pool);

  if (!pick) return noBookMessage("Short Pages");

  showReveal("Short Pages: Under 300 pages", pick);
}

function startGenrePicker() {
  const genres = [
    "Psychological Thriller",
    "Thriller",
    "Mystery",
    "Horror",
    "Romance",
    "Dark Romance",
    "Magic",
    "Fairytale",
    "Fantasy",
    "Crime",
    "Gothic",
    "YA",
    "Suspense"
  ];

  gameStage.innerHTML = `
    <div class="dropdown-game-box">
      <p class="tiny-title">Genre Picker</p>
      <h2>Select a genre</h2>

      <select id="genreDropdown">
        ${genres.map(genre => `<option value="${escapeHTML(genre)}">${escapeHTML(genre)}</option>`).join("")}
      </select>

      <button onclick="chooseGenreBook()">Reveal Book</button>
    </div>
  `;

  window.chooseGenreBook = function () {
    const genre = document.getElementById("genreDropdown").value;

    let pool = getUnreadBooks();

    const matched = pool.filter((book) => {
      return book.genre.toLowerCase().includes(genre.toLowerCase()) ||
             bookText(book).includes(genre.toLowerCase());
    });

    if (matched.length) {
      pool = matched;
    }

    const pick = pickUnreadBook(pool);

    if (!pick) return noBookMessage("Genre Picker");

    showReveal(`Genre Picker: ${genre}`, pick);
  };
}

function showReveal(gameName, pick, extraQuote = "") {
  if (!pick) return noBookMessage(gameName);

  gameStage.innerHTML = `
    <div class="sparkles"></div>
    <div class="magic-card-reveal">
      <div>
        <p class="tiny-title">${escapeHTML(gameName)}</p>
        <h2>${escapeHTML(pick.title)}</h2>
        <p>${escapeHTML(pick.author || "Unknown Author")}</p>
        <p>${escapeHTML(pick.genre || "")}</p>
        ${extraQuote ? `<p><b>${escapeHTML(extraQuote)}</b></p>` : ""}
        <button onclick="showBookDetails('${pick.id}')">View Details</button>
      </div>
    </div>
  `;

  gameResult.innerHTML = `
    <b>${escapeHTML(gameName)}</b><br><br>
    Picked Book:<br>
    <h3>${escapeHTML(pick.title)}</h3>
    <p>${escapeHTML(pick.author || "")}</p>
    <p>${escapeHTML(pick.genre || "")}</p>
    ${extraQuote ? `<p><b>${escapeHTML(extraQuote)}</b></p>` : ""}
    <button onclick="showBookDetails('${pick.id}')">View Details</button>
  `;
}

// ===============================
// BOOK CHALLENGES
// ===============================

newChallengeBtn.addEventListener("click", createNewChallenge);
completeChallengeBtn.addEventListener("click", completeCurrentChallenge);

function createNewChallenge() {
  const unread = getUnreadBooks();

  if (!unread.length) {
    currentChallengeBox.innerHTML = `
      <div class="challenge-card">
        <h3>No unread books found</h3>
        <p>Add unread books first to create a challenge.</p>
      </div>
    `;
    return;
  }

  const book = randomFrom(unread);
  const challenge = randomFrom(challengeIdeas);

  currentChallenge = {
    id: makeId(),
    bookId: book.id,
    title: book.title,
    author: book.author,
    genre: book.genre,
    challenge,
    createdAt: new Date().toISOString()
  };

  saveToStorage();
  renderChallenges();
}

function completeCurrentChallenge() {
  if (!currentChallenge) {
    alert("Pick a challenge first.");
    return;
  }

  const reward = randomFrom(rewardIdeas);

  const completed = {
    ...currentChallenge,
    completedAt: new Date().toISOString(),
    reward
  };

  completedChallenges.unshift(completed);
  rewards.unshift({
    id: makeId(),
    ...reward,
    earnedAt: new Date().toISOString(),
    challengeTitle: currentChallenge.title
  });

  currentChallenge = null;

  saveToStorage();
  renderChallenges();

  alert(`Challenge complete! You unlocked: ${reward.icon} ${reward.name}`);
}

function renderChallenges() {
  renderCurrentChallenge();
  renderRewards();
  renderChallengeHistory();
}

function renderCurrentChallenge() {
  if (!currentChallenge) {
    currentChallengeBox.innerHTML = "No active challenge yet. Pick one to begin.";
    return;
  }

  currentChallengeBox.innerHTML = `
    <div class="challenge-card">
      <p class="tiny-title">Current Challenge</p>
      <h3>${escapeHTML(currentChallenge.title)}</h3>
      <p>${escapeHTML(currentChallenge.author || "Unknown Author")}</p>
      <p><b>${escapeHTML(currentChallenge.challenge)}</b></p>
      <p>${escapeHTML(currentChallenge.genre || "")}</p>
    </div>
  `;
}

function renderRewards() {
  if (!rewards.length) {
    rewardShelf.innerHTML = "No rewards yet.";
    return;
  }

  rewardShelf.innerHTML = `
    <div class="reward-grid">
      ${rewards.map((reward) => `
        <div class="reward-card">
          <span class="reward-icon">${reward.icon}</span>
          <h4>${escapeHTML(reward.name)}</h4>
          <p>Earned from: ${escapeHTML(reward.challengeTitle || "Challenge")}</p>
        </div>
      `).join("")}
    </div>
  `;
}

function renderChallengeHistory() {
  if (!completedChallenges.length) {
    challengeHistory.innerHTML = "No completed challenges yet.";
    return;
  }

  challengeHistory.innerHTML = `
    <div class="history-grid">
      ${completedChallenges.map((item) => `
        <div class="history-card">
          <h4>${escapeHTML(item.title)}</h4>
          <p>${escapeHTML(item.challenge)}</p>
          <p>Reward: ${item.reward.icon} ${escapeHTML(item.reward.name)}</p>
        </div>
      `).join("")}
    </div>
  `;
}

// ===============================
// READMAP
// ===============================

document.getElementById("saveGoalBtn").addEventListener("click", () => {
  yearlyGoal = Number(document.getElementById("yearGoalInput").value) || 75;
  localStorage.setItem(GOAL_KEY, yearlyGoal);
  renderReadmap();
});

function renderReadmap() {
  document.getElementById("yearGoalInput").value = yearlyGoal;

  const readCount = ownedBooks.filter((book) => book.status === "Read").length;
  const percent = Math.min(100, Math.round((readCount / yearlyGoal) * 100));

  document.getElementById("goalProgressText").innerHTML = `
    You read <b>${readCount}</b> of <b>${yearlyGoal}</b> books.
    Progress: <b>${percent}%</b>
  `;

  const roadmapRewards = [
    { level: 1, need: 5, reward: "🌸 Floral Bookmark" },
    { level: 2, need: 10, reward: "☕ Cozy Bookmark" },
    { level: 3, need: 20, reward: "🌙 Moon Bookmark" },
    { level: 4, need: 35, reward: "📚 Library Bookmark" },
    { level: 5, need: 50, reward: "⭐ Golden Bookmark" },
    { level: 6, need: 75, reward: "👑 Ultimate Reader Bookmark" }
  ];

  document.getElementById("goalLevels").innerHTML = roadmapRewards.map((reward) => {
    const unlocked = readCount >= reward.need;

    return `
      <div class="level-card ${unlocked ? "unlocked" : ""}">
        <h3>Level ${reward.level}</h3>
        <p>${reward.need} books</p>
        <strong>${unlocked ? reward.reward : "Locked 🔒"}</strong>
      </div>
    `;
  }).join("");
}

// ===============================
// STATS
// ===============================

function renderStats() {
  const total = ownedBooks.length;
  const read = ownedBooks.filter((book) => book.status === "Read").length;
  const unread = ownedBooks.filter((book) => book.status === "Unread").length;
  const reading = ownedBooks.filter((book) => book.status === "Currently Reading").length;

  document.getElementById("totalBooksStat").textContent = total;
  document.getElementById("readBooksStat").textContent = read;
  document.getElementById("unreadBooksStat").textContent = unread;
  document.getElementById("readingBooksStat").textContent = reading;

  renderBars("statusBars", {
    Read: read,
    Unread: unread,
    Reading: reading
  });

  renderBars("ratingBars", countBy(
    ownedBooks.filter((book) => book.rating),
    (book) => `${book.rating} ⭐`
  ));

  renderBars("formatBars", countBy(
    ownedBooks,
    (book) => book.format || "Physical"
  ));

  renderBars("monthBars", countBy(
    ratingsBooks,
    (book) => book.month || "Unknown"
  ));
}

function countBy(list, keyFunction) {
  const counts = {};

  list.forEach((item) => {
    const key = keyFunction(item);
    counts[key] = (counts[key] || 0) + 1;
  });

  return counts;
}

function renderBars(elementId, data) {
  const element = document.getElementById(elementId);
  const entries = Object.entries(data);
  const max = Math.max(...entries.map((entry) => entry[1]), 1);

  if (!entries.length) {
    element.innerHTML = "<p>No data yet.</p>";
    return;
  }

  element.innerHTML = entries.map(([label, value]) => {
    const width = Math.round((value / max) * 100);

    return `
      <div class="bar-row">
        <div class="bar-label">
          <span>${escapeHTML(label)}</span>
          <b>${value}</b>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${width}%"></div>
        </div>
      </div>
    `;
  }).join("");
}

// ===============================
// THEMES + SETTINGS DATA
// ===============================

document.querySelectorAll("[data-theme]").forEach((button) => {
  button.addEventListener("click", () => {
    const theme = button.dataset.theme;

    document.body.className = theme;
    localStorage.setItem(THEME_KEY, theme);
  });
});

function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);

  if (savedTheme) {
    document.body.className = savedTheme;
  }
}

document.getElementById("clearDataBtn").addEventListener("click", () => {
  const confirmClear = confirm("Clear all saved library data?");

  if (!confirmClear) return;

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(GOAL_KEY);
  localStorage.removeItem(UNLOCK_KEY);

  ownedBooks = [];
  ratingsBooks = [];
  yearlyGoal = 75;
  selectedStickers = [];
  selectedJournalRating = 0;
  currentChallenge = null;
  completedChallenges = [];
  rewards = [];

  renderAll();

  settingsMessage.textContent = "Saved data cleared. Password lock will show again after refresh.";
});

function exportBackup() {
  const data = {
    ownedBooks,
    ratingsBooks,
    yearlyGoal,
    currentChallenge,
    completedChallenges,
    rewards,
    theme: document.body.className,
    exportedAt: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "alisas-library-backup.json";
  link.click();

  settingsMessage.textContent = "Backup exported.";
}

exportBackupBtn.addEventListener("click", exportBackup);
exportBackupBtnLibrary.addEventListener("click", exportBackup);

importBackupInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];

  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    ownedBooks = data.ownedBooks || [];
    ratingsBooks = data.ratingsBooks || [];
    yearlyGoal = Number(data.yearlyGoal) || 75;
    currentChallenge = data.currentChallenge || null;
    completedChallenges = data.completedChallenges || [];
    rewards = data.rewards || [];

    normalizeSavedBooks();

    if (data.theme) {
      document.body.className = data.theme;
      localStorage.setItem(THEME_KEY, data.theme);
    }

    localStorage.setItem(GOAL_KEY, yearlyGoal);
    saveToStorage();
    renderAll();

    settingsMessage.textContent = "Backup imported successfully.";
  } catch (error) {
    settingsMessage.textContent = "Could not import backup. Check the JSON file.";
  }
});