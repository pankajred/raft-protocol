const filterButtons = document.querySelectorAll(".filter-pill");
const faqItems = document.querySelectorAll(".faq-item");
const rotatingRaft = document.getElementById("rotating-raft");
let activeFilter = "all";

const localizedRaftWords = [
  "Raft",
  "Balsa",
  "筏",
  "राफ्ट",
  "Radeau",
  "Floß",
  "ラフト",
  "Jangada",
  "طوف",
  "Плот",
  "래프트"
];

if (rotatingRaft) {
  let raftWordIndex = 0;
  setInterval(() => {
    raftWordIndex = (raftWordIndex + 1) % localizedRaftWords.length;
    rotatingRaft.textContent = localizedRaftWords[raftWordIndex];
  }, 1000);
}

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
