const STORAGE_KEY = "alisasLibraryDataV1";
const THEME_KEY = "alisasLibraryThemeV1";
const GOAL_KEY = "alisasLibraryGoalV1";
const APP_PASSWORD = "9705";

let ownedBooks = [];
let ratingsBooks = [];
let selectedRating = 0;
let selectedStickers = [];
let yearlyGoal = Number(localStorage.getItem(GOAL_KEY)) || 50;

let currentChallenge = null;
let completedChallenges = [];
let rewards = [];

let timerInterval = null;
let timerSeconds = 0;

const $ = (id) => document.getElementById(id);

const passwordScreen = $("passwordScreen");
const passwordInput = $("passwordInput");
const passwordBtn = $("passwordBtn");
const passwordMessage = $("passwordMessage");
const welcomeScreen = $("welcomeScreen");
const enterLibraryBtn = $("enterLibraryBtn");

const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll("[data-section]");
const searchInput = $("searchInput");
const searchResults = $("searchResults");

const ownedUpload = $("ownedUpload");
const ratingsUpload = $("ratingsUpload");
const addBookBtn = $("addBookBtn");
const bookGrid = $("bookGrid");
const libraryMessage = $("libraryMessage");

const filterSearch = $("filterSearch");
const filterStatus = $("filterStatus");
const filterGenre = $("filterGenre");

const shelfArea = $("shelfArea");

const journalBookSelect = $("journalBookSelect");
const journalTitle = $("journalTitle");
const journalAuthor = $("journalAuthor");
const journalReview = $("journalReview");
const journalPreview = $("journalPreview");
const saveJournalBtn = $("saveJournalBtn");
const stickerPicker = $("stickerPicker");
const selectedStickersBox = $("selectedStickersBox");

const musicPlayer = $("musicPlayer");
const lightLayer = $("booknookLightLayer");
const toggleLightBtn = $("toggleLightBtn");
const timerDisplay = $("readingTimer");
const startTimerBtn = $("startTimerBtn");
const pauseTimerBtn = $("pauseTimerBtn");
const resetTimerBtn = $("resetTimerBtn");

const gameResult = $("gameResult");
const gamePlayStage = $("gamePlayStage");

const yearlyGoalInput = $("yearlyGoalInput");
const saveGoalBtn = $("saveGoalBtn");
const goalLevels = $("goalLevels");

const totalBooksStat = $("totalBooksStat");
const readBooksStat = $("readBooksStat");
const unreadBooksStat = $("unreadBooksStat");
const avgRatingStat = $("avgRatingStat");
const genreBars = $("genreBars");
const ratingBars = $("ratingBars");

const exportBtn = $("exportBtn");
const importBackup = $("importBackup");
const clearDataBtn = $("clearDataBtn");

const newChallengeBtn = $("newChallengeBtn");
const completeChallengeBtn = $("completeChallengeBtn");
const currentChallengeBox = $("currentChallengeBox");
const rewardShelf = $("rewardShelf");
const challengeHistory = $("challengeHistory");

const bookModal = $("bookModal");
const closeModalBtn = $("closeModalBtn");
const modalBody = $("modalBody");

const editModal = $("editModal");
const closeEditBtn = $("closeEditBtn");
const editForm = $("editForm");

const stickers = [
  "⭐", "🌙", "☕", "🕯️", "🌸", "📚", "🔖", "🖤", "💌", "🍂",
  "🌧️", "🧸", "👑", "✨", "💭", "🩸", "🔍", "🏠", "🌊", "❄️"
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

const gamePrompts = [
  "Pick a book with a dark cover",
  "Pick a book you forgot you owned",
  "Pick the shortest book from your shelf",
  "Pick a thriller",
  "Pick a book with red on the cover",
  "Pick a book you bought recently",
  "Pick a book you are scared to read",
  "Pick a book with a house on the cover",
  "Pick a book by an author you already read",
  "Pick a random unread book"
];

function safeText(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function normalizeBook(row) {
  const title =
    row.Title ||
    row.title ||
    row.Book ||
    row.book ||
    row["Book Title"] ||
    row["Book title"] ||
    row.Name ||
    row.name ||
    "";

  const author =
    row.Author ||
    row.author ||
    row["Author Name"] ||
    row["author name"] ||
    "";

  const genre =
    row.Genre ||
    row.genre ||
    row.Category ||
    row.category ||
    "";

  const status =
    row.Status ||
    row.status ||
    row.Read ||
    row.read ||
    row["Read Status"] ||
    "Unread";

  const pages =
    row.Pages ||
    row.pages ||
    row.Page ||
    row.page ||
    "";

  const rating =
    row.Rating ||
    row.rating ||
    row.Stars ||
    row.stars ||
    "";

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    title: safeText(title),
    author: safeText(author),
    genre: safeText(genre),
    status: safeText(status) || "Unread",
    pages: safeText(pages),
    rating: safeText(rating),
    review: safeText(row.Review || row.review || row.Notes || row.notes || ""),
    stickers: [],
    cover: ""
  };
}

function saveData() {
  const data = {
    ownedBooks,
    ratingsBooks,
    yearlyGoal,
    currentChallenge,
    completedChallenges,
    rewards
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  localStorage.setItem(GOAL_KEY, String(yearlyGoal));
}

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (saved) {
      ownedBooks = Array.isArray(saved.ownedBooks) ? saved.ownedBooks : [];
      ratingsBooks = Array.isArray(saved.ratingsBooks) ? saved.ratingsBooks : [];
      yearlyGoal = Number(saved.yearlyGoal) || yearlyGoal;
      currentChallenge = saved.currentChallenge || null;
      completedChallenges = Array.isArray(saved.completedChallenges) ? saved.completedChallenges : [];
      rewards = Array.isArray(saved.rewards) ? saved.rewards : [];
    }
  } catch (error) {
    console.log("Load error:", error);
  }
}

function unlockApp() {
  if (!passwordInput || !passwordScreen) return;

  const typedPassword = passwordInput.value.trim();

  if (typedPassword === APP_PASSWORD) {
    passwordScreen.classList.add("hidden");

    if (welcomeScreen) {
      welcomeScreen.classList.add("hidden");
    }

    showSection("home");

    if (passwordMessage) {
      passwordMessage.textContent = "";
    }

    passwordInput.value = "";
  } else {
    if (passwordMessage) {
      passwordMessage.textContent = "Wrong password. Try again.";
    }

    passwordInput.value = "";
  }
}

function enterLibrary() {
  if (welcomeScreen) {
    welcomeScreen.classList.add("hidden");
  }

  if (passwordScreen) {
    passwordScreen.classList.add("hidden");
  }

  showSection("home");
}

function showSection(sectionId) {
  pages.forEach((page) => {
    page.classList.toggle("active", page.id === sectionId);
  });

  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.section === sectionId);
  });

  if (sectionId === "library") renderBooks();
  if (sectionId === "shelves") renderShelves();
  if (sectionId === "journal") renderJournalSelect();
  if (sectionId === "readmap") renderReadmap();
  if (sectionId === "stats") renderStats();
  if (sectionId === "challenges") renderChallenges();
}

function readExcelFile(file, callback) {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (event) {
    try {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet);
      callback(rows);
    } catch (error) {
      alert("Excel file could not be read.");
      console.log(error);
    }
  };

  reader.readAsArrayBuffer(file);
}

function renderBooks() {
  if (!bookGrid) return;

  const search = filterSearch ? filterSearch.value.toLowerCase() : "";
  const status = filterStatus ? filterStatus.value : "all";
  const genre = filterGenre ? filterGenre.value : "all";

  let books = [...ownedBooks];

  if (search) {
    books = books.filter((book) =>
      `${book.title} ${book.author} ${book.genre}`.toLowerCase().includes(search)
    );
  }

  if (status !== "all") {
    books = books.filter((book) => safeText(book.status).toLowerCase() === status.toLowerCase());
  }

  if (genre !== "all") {
    books = books.filter((book) => safeText(book.genre).toLowerCase() === genre.toLowerCase());
  }

  bookGrid.innerHTML = "";

  if (books.length === 0) {
    bookGrid.innerHTML = `<p>No books found.</p>`;
    return;
  }

  books.forEach((book) => {
    const card = document.createElement("div");
    card.className = "book-card";

    card.innerHTML = `
      <div class="book-cover">${book.cover ? `<img src="${book.cover}" alt="">` : safeText(book.title).slice(0, 25)}</div>
      <div>
        <h3>${safeText(book.title) || "Untitled"}</h3>
        <p>${safeText(book.author) || "Unknown author"}</p>
        <p>${safeText(book.genre)}</p>
        <p>Status: ${safeText(book.status) || "Unread"}</p>
        <p>${book.rating ? "⭐ " + book.rating : ""}</p>
      </div>
      <div class="book-card-actions">
        <button data-action="view">View</button>
        <button data-action="read">Mark Read</button>
        <button data-action="unread">Mark Unread</button>
        <button data-action="delete">Delete</button>
      </div>
    `;

    card.querySelector('[data-action="view"]').addEventListener("click", () => openBookModal(book));

    card.querySelector('[data-action="read"]').addEventListener("click", () => {
      book.status = "Read";
      saveData();
      renderAll();
    });

    card.querySelector('[data-action="unread"]').addEventListener("click", () => {
      book.status = "Unread";
      saveData();
      renderAll();
    });

    card.querySelector('[data-action="delete"]').addEventListener("click", () => {
      if (confirm("Delete this book?")) {
        ownedBooks = ownedBooks.filter((b) => b.id !== book.id);
        saveData();
        renderAll();
      }
    });

    bookGrid.appendChild(card);
  });

  updateGenreFilter();
}

function updateGenreFilter() {
  if (!filterGenre) return;

  const current = filterGenre.value;
  const genres = [...new Set(ownedBooks.map((b) => safeText(b.genre)).filter(Boolean))];

  filterGenre.innerHTML = `<option value="all">All genres</option>`;

  genres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    filterGenre.appendChild(option);
  });

  filterGenre.value = current;
}

function openBookModal(book) {
  if (!bookModal || !modalBody) return;

  modalBody.innerHTML = `
    <div class="detail-layout">
      <div class="detail-cover">${book.cover ? `<img src="${book.cover}" alt="">` : safeText(book.title)}</div>
      <div>
        <h2>${safeText(book.title) || "Untitled"}</h2>
        <p><strong>Author:</strong> ${safeText(book.author) || "Unknown"}</p>
        <p><strong>Genre:</strong> ${safeText(book.genre)}</p>
        <p><strong>Status:</strong> ${safeText(book.status)}</p>
        <p><strong>Pages:</strong> ${safeText(book.pages)}</p>
        <p><strong>Rating:</strong> ${safeText(book.rating)}</p>
        <p><strong>Review:</strong> ${safeText(book.review)}</p>
      </div>
    </div>
  `;

  bookModal.classList.remove("hidden");
}

function renderShelves() {
  if (!shelfArea) return;

  const categories = {
    Read: ownedBooks.filter((b) => safeText(b.status).toLowerCase() === "read"),
    Unread: ownedBooks.filter((b) => safeText(b.status).toLowerCase() !== "read"),
    Favorites: ownedBooks.filter((b) => Number(b.rating) >= 4)
  };

  shelfArea.innerHTML = "";

  Object.entries(categories).forEach(([name, books]) => {
    const title = document.createElement("h3");
    title.className = "shelf-title";
    title.textContent = name;

    const row = document.createElement("div");
    row.className = "shelf-row";

    if (books.length === 0) {
      row.innerHTML = `<p>No books yet.</p>`;
    } else {
      books.forEach((book, index) => {
        const spine = document.createElement("div");
        spine.className = "book-spine";
        spine.textContent = safeText(book.title).slice(0, 30);
        spine.style.background = [
          "#7b3f22", "#173c30", "#62313b", "#2f355d", "#8a5a2b",
          "#42294c", "#49502b", "#8a3d24", "#203447", "#75511d"
        ][index % 10];
        row.appendChild(spine);
      });
    }

    shelfArea.appendChild(title);
    shelfArea.appendChild(row);
  });
}

function renderJournalSelect() {
  if (!journalBookSelect) return;

  journalBookSelect.innerHTML = `<option value="">Choose a book</option>`;

  ownedBooks.forEach((book) => {
    const option = document.createElement("option");
    option.value = book.id;
    option.textContent = `${book.title} — ${book.author}`;
    journalBookSelect.appendChild(option);
  });
}

function renderStickerPicker() {
  if (!stickerPicker) return;

  stickerPicker.innerHTML = "";

  stickers.forEach((sticker) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = sticker;

    button.addEventListener("click", () => {
      if (selectedStickers.includes(sticker)) {
        selectedStickers = selectedStickers.filter((s) => s !== sticker);
        button.classList.remove("selected");
      } else {
        selectedStickers.push(sticker);
        button.classList.add("selected");
      }

      updateSelectedStickers();
      updateJournalPreview();
    });

    stickerPicker.appendChild(button);
  });
}

function updateSelectedStickers() {
  if (!selectedStickersBox) return;
  selectedStickersBox.textContent = selectedStickers.join(" ");
}

function updateJournalPreview() {
  if (!journalPreview) return;

  const title = journalTitle ? journalTitle.value : "";
  const author = journalAuthor ? journalAuthor.value : "";
  const review = journalReview ? journalReview.value : "";

  journalPreview.innerHTML = `
    <p class="tiny-title">Reading Journal</p>
    <h2>${safeText(title) || "Book Title"}</h2>
    <p>${safeText(author) || "Author"}</p>
    <p>${"⭐".repeat(selectedRating)}</p>
    <div class="journal-preview-stickers">${selectedStickers.join(" ")}</div>
    <p>${safeText(review) || "Your review will appear here..."}</p>
  `;
}

function saveJournal() {
  const id = journalBookSelect ? journalBookSelect.value : "";
  const book = ownedBooks.find((b) => b.id === id);

  if (!book) {
    alert("Choose a book first.");
    return;
  }

  book.rating = selectedRating;
  book.review = journalReview ? journalReview.value : "";
  book.stickers = selectedStickers;
  book.status = "Read";

  saveData();
  renderAll();

  alert("Journal saved.");
}

function renderReadmap() {
  if (yearlyGoalInput) yearlyGoalInput.value = yearlyGoal;
  if (!goalLevels) return;

  const readCount = ownedBooks.filter((b) => safeText(b.status).toLowerCase() === "read").length;
  const levels = [5, 10, 25, 50, 75, 100];

  goalLevels.innerHTML = "";

  levels.forEach((level) => {
    const card = document.createElement("div");
    card.className = `level-card ${readCount >= level ? "unlocked" : ""}`;
    card.innerHTML = `
      <h3>${readCount >= level ? "Unlocked" : "Locked"}</h3>
      <p>${level} books</p>
      <p>${readCount >= level ? "🏆" : "🔒"}</p>
    `;
    goalLevels.appendChild(card);
  });
}

function renderStats() {
  const total = ownedBooks.length;
  const read = ownedBooks.filter((b) => safeText(b.status).toLowerCase() === "read").length;
  const unread = total - read;
  const ratings = ownedBooks.map((b) => Number(b.rating)).filter((n) => n > 0);
  const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "0";

  if (totalBooksStat) totalBooksStat.textContent = total;
  if (readBooksStat) readBooksStat.textContent = read;
  if (unreadBooksStat) unreadBooksStat.textContent = unread;
  if (avgRatingStat) avgRatingStat.textContent = avg;

  renderBars(genreBars, countBy(ownedBooks, "genre"));
  renderBars(ratingBars, countBy(ownedBooks, "rating"));
}

function countBy(array, key) {
  const counts = {};

  array.forEach((item) => {
    const value = safeText(item[key]) || "Unknown";
    counts[value] = (counts[value] || 0) + 1;
  });

  return counts;
}

function renderBars(container, counts) {
  if (!container) return;

  const entries = Object.entries(counts);
  const max = Math.max(...entries.map((entry) => entry[1]), 1);

  container.innerHTML = "";

  entries.forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <div class="bar-label">
        <span>${label}</span>
        <span>${value}</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${(value / max) * 100}%"></div>
      </div>
    `;
    container.appendChild(row);
  });
}

function renderChallenges() {
  if (!currentChallengeBox || !rewardShelf || !challengeHistory) return;

  renderCurrentChallenge();
  renderRewards();
  renderChallengeHistory();
}

function createNewChallenge() {
  currentChallenge = {
    text: randomItem(challengeIdeas),
    createdAt: new Date().toLocaleString()
  };

  saveData();
  renderChallenges();
}

function completeCurrentChallenge() {
  if (!currentChallenge) {
    alert("Create a challenge first.");
    return;
  }

  const reward = randomItem(rewardIdeas);

  completedChallenges.unshift({
    ...currentChallenge,
    completedAt: new Date().toLocaleString(),
    reward
  });

  rewards.unshift(reward);
  currentChallenge = null;

  saveData();
  renderChallenges();

  alert(`Challenge complete! Reward unlocked: ${reward.icon} ${reward.name}`);
}

function renderCurrentChallenge() {
  if (!currentChallengeBox) return;

  if (!currentChallenge) {
    currentChallengeBox.innerHTML = `
      <div class="challenge-card">
        <h3>No current challenge</h3>
        <p>Click New Challenge to start one.</p>
      </div>
    `;
    return;
  }

  currentChallengeBox.innerHTML = `
    <div class="challenge-card">
      <p class="tiny-title">Current Challenge</p>
      <h3>${currentChallenge.text}</h3>
      <p>Started: ${currentChallenge.createdAt}</p>
    </div>
  `;
}

function renderRewards() {
  if (!rewardShelf) return;

  rewardShelf.innerHTML = `<h3>Reward Shelf</h3>`;

  const grid = document.createElement("div");
  grid.className = "reward-grid";

  if (rewards.length === 0) {
    grid.innerHTML = `<p>No rewards yet.</p>`;
  } else {
    rewards.forEach((reward) => {
      const card = document.createElement("div");
      card.className = "reward-card";
      card.innerHTML = `
        <span class="reward-icon">${reward.icon}</span>
        <strong>${reward.name}</strong>
      `;
      grid.appendChild(card);
    });
  }

  rewardShelf.appendChild(grid);
}

function renderChallengeHistory() {
  if (!challengeHistory) return;

  challengeHistory.innerHTML = `<h3>Challenge History</h3>`;

  const grid = document.createElement("div");
  grid.className = "history-grid";

  if (completedChallenges.length === 0) {
    grid.innerHTML = `<p>No completed challenges yet.</p>`;
  } else {
    completedChallenges.forEach((challenge) => {
      const card = document.createElement("div");
      card.className = "history-card";
      card.innerHTML = `
        <strong>${challenge.text}</strong>
        <p>${challenge.completedAt}</p>
        <p>${challenge.reward.icon} ${challenge.reward.name}</p>
      `;
      grid.appendChild(card);
    });
  }

  challengeHistory.appendChild(grid);
}

function playMusic(file) {
  if (!musicPlayer || !file) return;

  musicPlayer.pause();
  musicPlayer.currentTime = 0;
  musicPlayer.src = `./${file}`;
  musicPlayer.volume = 0.7;

  musicPlayer.play().catch((error) => {
    console.log("Music error:", error);
    alert("Music could not play. Check that calm.mp3, birds.mp3, and river.mp3 are uploaded in GitHub root folder.");
  });
}

function updateTimerDisplay() {
  if (!timerDisplay) return;

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;

  timerDisplay.textContent =
    String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

function startTimer() {
  if (timerInterval) return;

  timerInterval = setInterval(() => {
    timerSeconds++;
    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  pauseTimer();
  timerSeconds = 0;
  updateTimerDisplay();
}

function getUnreadBooks() {
  return ownedBooks.filter((book) => {
    const status = safeText(book.status).toLowerCase();
    return status !== "read";
  });
}

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function getRandomUnreadBooks(count = 1) {
  const unread = getUnreadBooks();

  if (unread.length === 0) {
    return [];
  }

  return shuffleArray(unread).slice(0, Math.min(count, unread.length));
}

function showNoUnreadBooksMessage() {
  if (!gamePlayStage || !gameResult) return;

  gamePlayStage.innerHTML = `
    <div class="magic-card-reveal">
      <div>
        <h2>No unread books found</h2>
        <p>Upload your books or mark some books as Unread.</p>
      </div>
    </div>
  `;

  gameResult.innerHTML = `
    <h3>No unread books</h3>
    <p>All games choose only from your unread books.</p>
  `;
}

function renderBookChoiceCards(books, introText = "Choose one book") {
  if (!gamePlayStage) return;

  if (!books.length) {
    showNoUnreadBooksMessage();
    return;
  }

  gamePlayStage.innerHTML = `
    <div class="book-choice-box">
      <h2>${introText}</h2>
      <div class="book-choice-grid">
        ${books.map((book) => `
          <button class="book-choice-card" data-book-id="${book.id}">
            <strong>${safeText(book.title)}</strong>
            <small>${safeText(book.author) || "Unknown author"}</small>
            <span>${safeText(book.genre) || "Unread book"}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `;

  gamePlayStage.querySelectorAll(".book-choice-card").forEach((button) => {
    button.addEventListener("click", () => {
      const book = books.find((item) => item.id === button.dataset.bookId);

      if (!book) return;

      gameResult.innerHTML = `
        <h3>Your selected book</h3>
        <p><strong>${safeText(book.title)}</strong></p>
        <p>${safeText(book.author) || "Unknown author"}</p>
      `;

      gamePlayStage.innerHTML = `
        <div class="magic-card-reveal">
          <div>
            <h2>${safeText(book.title)}</h2>
            <p>${safeText(book.author) || "Unknown author"}</p>
            <p>Start this unread book next.</p>
          </div>
        </div>
      `;
    });
  });
}

function playGame(gameType) {
  if (!gamePlayStage || !gameResult) return;

  gamePlayStage.innerHTML = "";
  gameResult.innerHTML = "";

  const unread = getUnreadBooks();

  if (unread.length === 0) {
    showNoUnreadBooksMessage();
    return;
  }

  const type = safeText(gameType).toLowerCase();

  if (type.includes("wheel")) {
    playWheelGame();
  } else if (type.includes("jar")) {
    playJarGame();
  } else if (type.includes("dice")) {
    playDiceGame();
  } else if (type.includes("card")) {
    playCardGame();
  } else if (type.includes("crystal")) {
    playCrystalGame();
  } else if (type.includes("truth") || type.includes("dare")) {
    playTruthDareGame();
  } else if (type.includes("mood")) {
    playMoodGame();
  } else if (type.includes("genre")) {
    playGenreGame();
  } else if (type.includes("page")) {
    playPageCountGame();
  } else if (type.includes("blind")) {
    playBlindDateGame();
  }
}

function finishGameResult(book, extraText = "") {
  if (!book || !gameResult) return;

  gameResult.innerHTML = `
    <h3>Your result</h3>
    <p><strong>${safeText(book.title)}</strong></p>
    <p>${safeText(book.author) || "Unknown author"}</p>
    ${extraText ? `<p>${extraText}</p>` : ""}
  `;
}

function playWheelGame() {
  const books = getRandomUnreadBooks(1);

  if (!books.length) {
    showNoUnreadBooksMessage();
    return;
  }

  const book = books[0];

  gamePlayStage.innerHTML = `
    <div class="sparkles"></div>
    <div class="wheel-wrap">
      <div class="wheel-pointer"></div>
      <div class="tbr-wheel"></div>
    </div>
  `;

  const wheel = gamePlayStage.querySelector(".tbr-wheel");
  const degrees = 1440 + Math.floor(Math.random() * 720);

  setTimeout(() => {
    wheel.style.transform = `rotate(${degrees}deg)`;
  }, 100);

  setTimeout(() => {
    gamePlayStage.innerHTML = `
      <div class="magic-card-reveal">
        <div>
          <h2>${safeText(book.title)}</h2>
          <p>${safeText(book.author) || "Unknown author"}</p>
        </div>
      </div>
    `;

    finishGameResult(book, "Wheel picked this unread book.");
  }, 2700);
}

function playJarGame() {
  const books = getRandomUnreadBooks(1);

  if (!books.length) {
    showNoUnreadBooksMessage();
    return;
  }

  const book = books[0];

  gamePlayStage.innerHTML = `
    <div class="sparkles"></div>
    <div class="tbr-jar jar-shake">
      <div class="jar-paper" style="--rotate:-12deg"></div>
      <div class="jar-paper" style="--rotate:18deg"></div>
      <div class="jar-paper" style="--rotate:8deg"></div>
      📚
    </div>
  `;

  setTimeout(() => {
    gamePlayStage.innerHTML = `
      <div class="magic-card-reveal">
        <div>
          <h2>${safeText(book.title)}</h2>
          <p>${safeText(book.author) || "Unknown author"}</p>
        </div>
      </div>
    `;

    finishGameResult(book, "TBR Jar picked this unread book.");
  }, 2300);
}

function playDiceGame() {
  const unread = getUnreadBooks();

  if (!unread.length) {
    showNoUnreadBooksMessage();
    return;
  }

  const diceNumber = Math.floor(Math.random() * 6) + 1;
  const books = getRandomUnreadBooks(diceNumber);

  gamePlayStage.innerHTML = `
    <div class="dice-game-box">
      <div class="dice-face">🎲</div>
      <h2>Rolling...</h2>
    </div>
  `;

  setTimeout(() => {
    gamePlayStage.innerHTML = `
      <div class="dice-game-box">
        <div class="dice-face">${diceNumber}</div>
        <h2>Dice rolled ${diceNumber}</h2>
        <p>Choose one book from these unread books.</p>
      </div>
    `;

    setTimeout(() => {
      renderBookChoiceCards(books, `Dice rolled ${diceNumber}. Pick 1 unread book.`);
    }, 900);
  }, 1500);
}

function playCardGame() {
  const books = getRandomUnreadBooks(3);

  if (!books.length) {
    showNoUnreadBooksMessage();
    return;
  }

  gamePlayStage.innerHTML = `
    <div class="card-game-box">
      <h2>Pick one mystery card</h2>
      <div class="card-grid">
        ${books.map((book, index) => `
          <button class="card-pick" data-book-id="${book.id}">
            ?
          </button>
        `).join("")}
      </div>
    </div>
  `;

  gamePlayStage.querySelectorAll(".card-pick").forEach((card) => {
    card.addEventListener("click", () => {
      const book = books.find((item) => item.id === card.dataset.bookId);

      if (!book) return;

      card.classList.add("flipped");
      card.innerHTML = `<span>${safeText(book.title).slice(0, 18)}</span>`;

      setTimeout(() => {
        gamePlayStage.innerHTML = `
          <div class="magic-card-reveal">
            <div>
              <h2>${safeText(book.title)}</h2>
              <p>${safeText(book.author) || "Unknown author"}</p>
            </div>
          </div>
        `;

        finishGameResult(book, "Your mystery card chose this unread book.");
      }, 700);
    });
  });
}

function playCrystalGame() {
  const books = getRandomUnreadBooks(1);

  if (!books.length) {
    showNoUnreadBooksMessage();
    return;
  }

  const book = books[0];

  const messages = [
    "The crystal ball sees a twisty unread book...",
    "Your next unread read is calling you...",
    "The book spirits picked this one...",
    "A hidden unread story is waiting..."
  ];

  gamePlayStage.innerHTML = `
    <div class="sparkles"></div>
    <div class="crystal-ball">🔮</div>
  `;

  setTimeout(() => {
    gamePlayStage.innerHTML = `
      <div class="magic-card-reveal">
        <div>
          <h2>${safeText(book.title)}</h2>
          <p>${safeText(book.author) || "Unknown author"}</p>
          <p>${randomItem(messages)}</p>
        </div>
      </div>
    `;

    finishGameResult(book, "Crystal Ball picked this unread book.");
  }, 2000);
}

function playTruthDareGame() {
  const books = getRandomUnreadBooks(2);

  if (!books.length) {
    showNoUnreadBooksMessage();
    return;
  }

  gamePlayStage.innerHTML = `
    <div class="choice-box">
      <h2>Truth or Dare</h2>
      <div class="truth-dare-options">
        <button class="truth-dare-option" data-choice="truth">Truth</button>
        <button class="truth-dare-option" data-choice="dare">Dare</button>
      </div>
    </div>
  `;

  gamePlayStage.querySelectorAll(".truth-dare-option").forEach((button) => {
    button.addEventListener("click", () => {
      const choice = button.dataset.choice;

      const truth = [
        "Which unread book have you been avoiding?",
        "Which unread book did you buy only because of the cover?",
        "Which unread book are you scared will disappoint you?",
        "Which unread book has been on your shelf the longest?"
      ];

      const dare = [
        "Read 20 pages from one of these books now.",
        "Pick one book without checking reviews.",
        "Start one of these unread books tonight.",
        "Read the first chapter of one of these books."
      ];

      const prompt = choice === "truth" ? randomItem(truth) : randomItem(dare);

      renderBookChoiceCards(books, `${choice.toUpperCase()}: ${prompt}`);
    });
  });
}

function playMoodGame() {
  const unread = getUnreadBooks();

  if (!unread.length) {
    showNoUnreadBooksMessage();
    return;
  }

  gamePlayStage.innerHTML = `
    <div class="choice-box">
      <h2>What mood do you want?</h2>
      <div class="truth-dare-options">
        <button class="truth-dare-option" data-mood="dark">Dark</button>
        <button class="truth-dare-option" data-mood="fast">Fast Paced</button>
        <button class="truth-dare-option" data-mood="mystery">Mystery</button>
        <button class="truth-dare-option" data-mood="cozy">Cozy</button>
      </div>
    </div>
  `;

  gamePlayStage.querySelectorAll("[data-mood]").forEach((button) => {
    button.addEventListener("click", () => {
      const mood = button.dataset.mood;
      let filtered = unread;

      if (mood === "mystery") {
        filtered = unread.filter((book) =>
          `${book.genre} ${book.title}`.toLowerCase().includes("mystery") ||
          `${book.genre} ${book.title}`.toLowerCase().includes("thriller")
        );
      }

      if (filtered.length === 0) {
        filtered = unread;
      }

      renderBookChoiceCards(getRandomUnreadBooksFromList(filtered, 3), `Mood: ${button.textContent}. Pick one unread book.`);
    });
  });
}

function getRandomUnreadBooksFromList(list, count) {
  return shuffleArray(list).slice(0, Math.min(count, list.length));
}

function playGenreGame() {
  const unread = getUnreadBooks();

  if (!unread.length) {
    showNoUnreadBooksMessage();
    return;
  }

  const genres = [...new Set(unread.map((book) => safeText(book.genre)).filter(Boolean))];

  if (genres.length === 0) {
    renderBookChoiceCards(getRandomUnreadBooks(3), "No genres found. Pick one unread book.");
    return;
  }

  const genre = randomItem(genres);
  const books = unread.filter((book) => safeText(book.genre).toLowerCase() === genre.toLowerCase());

  gamePlayStage.innerHTML = `
    <div class="sparkles"></div>
    <div class="magic-card-reveal">
      <div>
        <h2>Genre Roulette</h2>
        <p>${genre}</p>
      </div>
    </div>
  `;

  setTimeout(() => {
    renderBookChoiceCards(getRandomUnreadBooksFromList(books, 3), `Genre: ${genre}. Pick one unread book.`);
  }, 1200);
}

function playPageCountGame() {
  const unread = getUnreadBooks();

  if (!unread.length) {
    showNoUnreadBooksMessage();
    return;
  }

  gamePlayStage.innerHTML = `
    <div class="choice-box">
      <h2>Choose page count mood</h2>
      <div class="truth-dare-options">
        <button class="truth-dare-option" data-pages="short">Short: under 300</button>
        <button class="truth-dare-option" data-pages="medium">Medium: 300-400</button>
        <button class="truth-dare-option" data-pages="long">Long: 400+</button>
      </div>
    </div>
  `;

  gamePlayStage.querySelectorAll("[data-pages]").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.pages;

      let filtered = unread.filter((book) => {
        const pages = Number(book.pages);

        if (!pages) return false;
        if (type === "short") return pages < 300;
        if (type === "medium") return pages >= 300 && pages <= 400;
        if (type === "long") return pages > 400;

        return false;
      });

      if (filtered.length === 0) {
        filtered = unread;
      }

      renderBookChoiceCards(getRandomUnreadBooksFromList(filtered, 3), `${button.textContent}. Pick one unread book.`);
    });
  });
}

function playBlindDateGame() {
  const books = getRandomUnreadBooks(1);

  if (!books.length) {
    showNoUnreadBooksMessage();
    return;
  }

  const book = books[0];

  gamePlayStage.innerHTML = `
    <div class="magic-card-reveal">
      <div>
        <h2>Blind Date With A Book</h2>
        <p>Genre: ${safeText(book.genre) || "Mystery unread book"}</p>
        <p>Pages: ${safeText(book.pages) || "Unknown pages"}</p>
        <button id="revealBlindDateBtn">Reveal Book</button>
      </div>
    </div>
  `;

  const revealBtn = $("revealBlindDateBtn");

  if (revealBtn) {
    revealBtn.addEventListener("click", () => {
      gamePlayStage.innerHTML = `
        <div class="magic-card-reveal">
          <div>
            <h2>${safeText(book.title)}</h2>
            <p>${safeText(book.author) || "Unknown author"}</p>
          </div>
        </div>
      `;

      finishGameResult(book, "Blind Date picked this unread book.");
    });
  }
}

function renderHomeSearch() {
  if (!searchInput || !searchResults) return;

  const query = searchInput.value.toLowerCase();

  if (!query) {
    searchResults.innerHTML = "Search your books...";
    return;
  }

  const results = ownedBooks.filter((book) =>
    `${book.title} ${book.author}`.toLowerCase().includes(query)
  ).slice(0, 8);

  if (results.length === 0) {
    searchResults.innerHTML = "No books found.";
    return;
  }

  searchResults.innerHTML = results
    .map((book) => `<div><strong>${book.title}</strong><br><small>${book.author}</small></div>`)
    .join("<hr>");
}

function renderAll() {
  renderBooks();
  renderShelves();
  renderJournalSelect();
  renderReadmap();
  renderStats();
  renderChallenges();
}

function setupEvents() {
  if (passwordBtn) passwordBtn.addEventListener("click", unlockApp);

  if (passwordInput) {
    passwordInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") unlockApp();
    });
  }

  if (enterLibraryBtn) enterLibraryBtn.addEventListener("click", enterLibrary);

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      showSection(button.dataset.section);
    });
  });

  document.querySelectorAll(".back-home").forEach((button) => {
    button.addEventListener("click", () => showSection("home"));
  });

  if (searchInput) searchInput.addEventListener("input", renderHomeSearch);

  if (ownedUpload) {
    ownedUpload.addEventListener("change", (event) => {
      readExcelFile(event.target.files[0], (rows) => {
        ownedBooks = rows.map(normalizeBook).filter((book) => book.title);
        saveData();
        renderAll();
        if (libraryMessage) libraryMessage.textContent = `${ownedBooks.length} owned books imported.`;
      });
    });
  }

  if (ratingsUpload) {
    ratingsUpload.addEventListener("change", (event) => {
      readExcelFile(event.target.files[0], (rows) => {
        ratingsBooks = rows.map(normalizeBook).filter((book) => book.title);

        ratingsBooks.forEach((ratingBook) => {
          const match = ownedBooks.find((book) =>
            safeText(book.title).toLowerCase() === safeText(ratingBook.title).toLowerCase()
          );

          if (match) {
            match.rating = ratingBook.rating || match.rating;
            match.status = "Read";
            match.review = ratingBook.review || match.review;
          }
        });

        saveData();
        renderAll();

        if (libraryMessage) libraryMessage.textContent = `${ratingsBooks.length} rating books imported.`;
      });
    });
  }

  if (addBookBtn) {
    addBookBtn.addEventListener("click", () => {
      const title = prompt("Book title:");
      if (!title) return;

      const author = prompt("Author:");
      const genre = prompt("Genre:");

      ownedBooks.push({
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        title,
        author,
        genre,
        status: "Unread",
        pages: "",
        rating: "",
        review: "",
        stickers: [],
        cover: ""
      });

      saveData();
      renderAll();
    });
  }

  [filterSearch, filterStatus, filterGenre].forEach((element) => {
    if (element) element.addEventListener("input", renderBooks);
    if (element) element.addEventListener("change", renderBooks);
  });

  if (journalBookSelect) {
    journalBookSelect.addEventListener("change", () => {
      const book = ownedBooks.find((b) => b.id === journalBookSelect.value);

      if (book) {
        if (journalTitle) journalTitle.value = book.title;
        if (journalAuthor) journalAuthor.value = book.author;
        if (journalReview) journalReview.value = book.review || "";

        selectedRating = Number(book.rating) || 0;
        selectedStickers = Array.isArray(book.stickers) ? book.stickers : [];

        updateSelectedStickers();
        updateJournalPreview();
      }
    });
  }

  document.querySelectorAll(".star-buttons button").forEach((button) => {
    button.addEventListener("click", () => {
      selectedRating = Number(button.dataset.rating || 0);

      document.querySelectorAll(".star-buttons button").forEach((btn) => {
        btn.classList.toggle("active", Number(btn.dataset.rating) <= selectedRating);
      });

      updateJournalPreview();
    });
  });

  [journalTitle, journalAuthor, journalReview].forEach((element) => {
    if (element) element.addEventListener("input", updateJournalPreview);
  });

  if (saveJournalBtn) saveJournalBtn.addEventListener("click", saveJournal);

  document.querySelectorAll(".music-choice").forEach((button) => {
    button.addEventListener("click", () => {
      const file = button.dataset.music;
      playMusic(file);
    });
  });

  if (toggleLightBtn && lightLayer) {
    toggleLightBtn.addEventListener("click", () => {
      lightLayer.classList.toggle("dark");
    });
  }

  if (startTimerBtn) startTimerBtn.addEventListener("click", startTimer);
  if (pauseTimerBtn) pauseTimerBtn.addEventListener("click", pauseTimer);
  if (resetTimerBtn) resetTimerBtn.addEventListener("click", resetTimer);

  document.querySelectorAll(".game-btn").forEach((button) => {
    button.addEventListener("click", () => {
      playGame(button.dataset.game || button.textContent);
    });
  });

  if (saveGoalBtn) {
    saveGoalBtn.addEventListener("click", () => {
      yearlyGoal = Number(yearlyGoalInput.value) || 50;
      saveData();
      renderReadmap();
    });
  }

  document.querySelectorAll("[data-theme]").forEach((button) => {
    button.addEventListener("click", () => {
      document.body.className = button.dataset.theme;
      localStorage.setItem(THEME_KEY, button.dataset.theme);
    });
  });

  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const data = {
        ownedBooks,
        ratingsBooks,
        yearlyGoal,
        currentChallenge,
        completedChallenges,
        rewards,
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "alisas-library-backup.json";
      link.click();

      URL.revokeObjectURL(url);
    });
  }

  if (importBackup) {
    importBackup.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = function () {
        try {
          const data = JSON.parse(reader.result);

          ownedBooks = Array.isArray(data.ownedBooks) ? data.ownedBooks : [];
          ratingsBooks = Array.isArray(data.ratingsBooks) ? data.ratingsBooks : [];
          yearlyGoal = Number(data.yearlyGoal) || 50;
          currentChallenge = data.currentChallenge || null;
          completedChallenges = Array.isArray(data.completedChallenges) ? data.completedChallenges : [];
          rewards = Array.isArray(data.rewards) ? data.rewards : [];

          saveData();
          renderAll();

          alert("Backup imported.");
        } catch (error) {
          alert("Backup file could not be imported.");
        }
      };

      reader.readAsText(file);
    });
  }

  if (clearDataBtn) {
    clearDataBtn.addEventListener("click", () => {
      if (confirm("Clear all saved app data?")) {
        localStorage.removeItem(STORAGE_KEY);

        ownedBooks = [];
        ratingsBooks = [];
        currentChallenge = null;
        completedChallenges = [];
        rewards = [];

        renderAll();
      }
    });
  }

  if (newChallengeBtn) newChallengeBtn.addEventListener("click", createNewChallenge);
  if (completeChallengeBtn) completeChallengeBtn.addEventListener("click", completeCurrentChallenge);

  if (closeModalBtn && bookModal) {
    closeModalBtn.addEventListener("click", () => bookModal.classList.add("hidden"));
  }

  if (closeEditBtn && editModal) {
    closeEditBtn.addEventListener("click", () => editModal.classList.add("hidden"));
  }
}

function init() {
  loadData();

  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) document.body.className = savedTheme;

  setupEvents();
  renderStickerPicker();
  updateTimerDisplay();
  updateJournalPreview();
  renderAll();

  if (passwordScreen) passwordScreen.classList.remove("hidden");
  if (welcomeScreen) welcomeScreen.classList.add("hidden");

  showSection("home");
}

document.addEventListener("DOMContentLoaded", init);
