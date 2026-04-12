const filterButtons = document.querySelectorAll(".filter-pill");
const faqItems = document.querySelectorAll(".faq-item");
const searchInput = document.getElementById("faq-search");
const searchStatus = document.getElementById("faq-search-status");
const searchForm = document.getElementById("faq-search-form");
const clearButton = document.getElementById("faq-clear");
let activeFilter = "all";

const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "can",
  "does",
  "do",
  "for",
  "how",
  "in",
  "is",
  "of",
  "or",
  "the",
  "to",
  "what",
  "when",
  "why"
]);

function normalizeWord(word) {
  let normalized = word.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (normalized.endsWith("ing") && normalized.length > 5) {
    normalized = normalized.slice(0, -3);
  } else if (normalized.endsWith("ed") && normalized.length > 4) {
    normalized = normalized.slice(0, -2);
  } else if (normalized.endsWith("es") && normalized.length > 4) {
    normalized = normalized.slice(0, -2);
  } else if (normalized.endsWith("s") && normalized.length > 3) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

function tokenize(text) {
  return text
    .toLowerCase()
    .split(/\s+/)
    .map(normalizeWord)
    .filter((word) => word && !stopWords.has(word));
}

function matchesSearch(item, query) {
  if (!query) {
    return true;
  }

  const rawHaystack = item.textContent.toLowerCase();
  if (rawHaystack.includes(query)) {
    return true;
  }

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return true;
  }

  const haystackTokens = tokenize(item.textContent);

  return queryTokens.every((queryToken) =>
    haystackTokens.some(
      (hayToken) =>
        hayToken === queryToken ||
        hayToken.startsWith(queryToken) ||
        queryToken.startsWith(hayToken)
    )
  );
}

function applyFilters(scrollToFirst = false) {
  const query = (searchInput?.value || "").trim().toLowerCase();
  let visibleCount = 0;
  let firstVisibleItem = null;

  faqItems.forEach((item) => {
    const topic = item.dataset.topic;
    const matchesTopic = activeFilter === "all" || topic === activeFilter;
    const matchesQuery = matchesSearch(item, query);

    item.hidden = !(matchesTopic && matchesQuery);
    item.open = Boolean(query) && !item.hidden;

    if (!item.hidden) {
      visibleCount += 1;
      if (!firstVisibleItem) {
        firstVisibleItem = item;
      }
    }
  });

  if (!searchStatus) {
    return;
  }

  if (query) {
    searchStatus.textContent =
      visibleCount > 0
        ? `${visibleCount} matching question${visibleCount === 1 ? "" : "s"} found for "${query}".`
        : `No matches found for "${query}". Try terms like leader election, quorum, split-brain, or YugabyteDB.`;
  } else {
    searchStatus.textContent =
      "Search across questions and answers to quickly find the topic you need.";
  }

  if (scrollToFirst && firstVisibleItem) {
    firstVisibleItem.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    filterButtons.forEach((pill) => pill.classList.remove("is-active"));
    button.classList.add("is-active");
    applyFilters();
  });
});

searchInput?.addEventListener("input", () => applyFilters(false));

searchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  applyFilters(true);
});

clearButton?.addEventListener("click", () => {
  if (searchInput) {
    searchInput.value = "";
  }
  applyFilters(false);
});

applyFilters();
