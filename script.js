const filterButtons = document.querySelectorAll(".filter-pill");
const faqItems = document.querySelectorAll(".faq-item");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const { filter } = button.dataset;

    filterButtons.forEach((pill) => pill.classList.remove("is-active"));
    button.classList.add("is-active");

    faqItems.forEach((item) => {
      const topic = item.dataset.topic;
      item.hidden = !(filter === "all" || topic === filter);
    });
  });
});
