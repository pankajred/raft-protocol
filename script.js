const filterButtons = document.querySelectorAll(".filter-pill");
const faqItems = document.querySelectorAll(".faq-item");
let activeFilter = "all";
function applyFilters() {
  let visibleCount = 0;

  faqItems.forEach((item) => {
    const topic = item.dataset.topic;
    const matchesTopic = activeFilter === "all" || topic === activeFilter;

    item.hidden = !matchesTopic;
    item.open = false;

    if (!item.hidden) {
      visibleCount += 1;
    }
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    filterButtons.forEach((pill) => pill.classList.remove("is-active"));
    button.classList.add("is-active");
    applyFilters();
  });
});

applyFilters();
