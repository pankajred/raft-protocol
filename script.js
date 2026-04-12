const filterButtons = document.querySelectorAll(".filter-pill");
const faqItems = document.querySelectorAll(".faq-item");
const searchInput = document.getElementById("faq-search");
const searchStatus = document.getElementById("faq-search-status");
let activeFilter = "all";

function applyFilters() {
  const query = (searchInput?.value || "").trim().toLowerCase();
  let visibleCount = 0;

  faqItems.forEach((item) => {
    const topic = item.dataset.topic;
    const matchesTopic = activeFilter === "all" || topic === activeFilter;
    const haystack = item.textContent.toLowerCase();
    const matchesQuery = !query || haystack.includes(query);

    item.hidden = !(matchesTopic && matchesQuery);

    if (!item.hidden) {
      visibleCount += 1;
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
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    filterButtons.forEach((pill) => pill.classList.remove("is-active"));
    button.classList.add("is-active");
    applyFilters();
  });
});

searchInput?.addEventListener("input", applyFilters);

applyFilters();
