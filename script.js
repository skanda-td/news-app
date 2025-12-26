/* =========================
   CONFIG
========================= */

const FEEDS = {
  india: "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en",
  karnataka: "https://news.google.com/rss/search?q=Karnataka+OR+Bengaluru&hl=en-IN&gl=IN&ceid=IN:en",
  world: "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en",
  cricket: "https://news.google.com/rss/search?q=Cricket&hl=en-IN&gl=IN&ceid=IN:en",
  football: "https://news.google.com/rss/search?q=Football+Soccer&hl=en-IN&gl=IN&ceid=IN:en"
};

const SECTION_IMAGES = {
  india: ["images/india/1.jpg", "images/india/2.jpg", "images/india/3.jpg"],
  karnataka: ["images/karnataka/1.jpg", "images/karnataka/2.jpg", "images/karnataka/3.jpg"],
  world: ["images/world/1.jpg", "images/world/2.jpg", "images/world/3.jpg"],
  cricket: ["images/cricket/1.jpg", "images/cricket/2.jpg", "images/cricket/3.jpg"],
  football: ["images/football/1.jpg", "images/football/2.jpg", "images/football/3.jpg"]
};

const CACHE_KEY = "daily_brief_cache";
const CACHE_DATE_KEY = "daily_brief_date";

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  loadTheme();
  loadCachedFirst();
  refreshOncePerDay();
  bindUI();
});

/* =========================
   UI CONTROLS
========================= */

function bindUI() {
  themeToggle.onclick = () => {
    document.body.classList.toggle("dark");
    document.body.classList.toggle("light");
    localStorage.setItem("theme", document.body.className);
  };

  readingToggle.onclick = () => {
    document.body.classList.toggle("reading");
  };
}

function loadTheme() {
  const theme = localStorage.getItem("theme");
  if (theme) document.body.className = theme;
}

/* =========================
   CACHE FIRST
========================= */

function loadCachedFirst() {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    renderAll(JSON.parse(cached));
  }
}

/* =========================
   DAILY REFRESH
========================= */

async function refreshOncePerDay() {
  const today = new Date().toDateString();
  if (localStorage.getItem(CACHE_DATE_KEY) === today) return;

  const data = {};
  let success = false;

  for (const [section, url] of Object.entries(FEEDS)) {
    const items = await fetchRSS(url);
    if (items.length) {
      data[section] = items;
      success = true;
    }
    await sleep(900); // proxy protection
  }

  if (!success) return; // keep cached data

  const payload = {
    lastUpdated: new Date().toISOString(),
    data
  };

  localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  localStorage.setItem(CACHE_DATE_KEY, today);

  renderAll(payload);
}

/* =========================
   FETCH + PARSE RSS
========================= */

async function fetchRSS(url) {
  try {
    const res = await fetch(
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    );
    if (!res.ok) throw new Error();
    const xml = await res.text();
    return parseRSS(xml);
  } catch {
    return [];
  }
}

function parseRSS(xml) {
  const doc = new DOMParser().parseFromString(xml, "text/xml");

  return [...doc.querySelectorAll("item")]
    .slice(0, 3)
    .map(item => {
      const link = item.querySelector("link")?.textContent || "";
      return {
        title: cleanTitle(item.querySelector("title")?.textContent || ""),
        link,
        source: extractSource(link)
      };
    });
}

/* =========================
   RENDER
========================= */

function renderAll(payload) {
  Object.entries(payload.data).forEach(([section, items]) => {
    const container = document.getElementById(`${section}-news`);
    if (!container) return;
    renderSection(container, items, section);
  });

  updateFooter(payload.lastUpdated);
}

function renderSection(container, items, section) {
  container.innerHTML = "";

  const images = shuffle(SECTION_IMAGES[section] || []);

  items.forEach((item, i) => {
    container.innerHTML += `
      <article class="news-card">
        <div>
          <h3>
            <a href="${item.link}" target="_blank" rel="noopener">
              ${item.title}
            </a>
          </h3>
          <p class="news-source">
            Source: ${item.source}
          </p>
        </div>
        <img src="${images[i % images.length]}" alt="news image" />
      </article>
    `;
  });
}

/* =========================
   HELPERS
========================= */

function cleanTitle(title) {
  return title.split(" - ")[0].trim();
}

function extractSource(link) {
  try {
    return new URL(link).hostname.replace("www.", "").toUpperCase();
  } catch {
    return "GOOGLE NEWS";
  }
}

function updateFooter(ts) {
  let el = document.getElementById("lastUpdated");
  if (!el) {
    el = document.createElement("span");
    el.id = "lastUpdated";
    document.querySelector(".footer-text")?.append(el);
  }
  el.textContent = ` · Updated ${new Date(ts).toLocaleDateString()}`;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}