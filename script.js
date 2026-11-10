const galleryGrid = document.querySelector("#galleryGrid");
const cards = [...document.querySelectorAll(".gallery-card")];
const filterButtons = [...document.querySelectorAll(".filter-btn")];
const searchInput = document.querySelector("#searchInput");
const imageCount = document.querySelector("#imageCount");
const emptyState = document.querySelector("#emptyState");
const themeToggle = document.querySelector("#themeToggle");

const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const lightboxCategory = document.querySelector("#lightboxCategory");
const lightboxTitle = document.querySelector("#lightboxTitle");
const lightboxLocation = document.querySelector("#lightboxLocation");
const lightboxDescription = document.querySelector("#lightboxDescription");
const lightboxCounter = document.querySelector("#lightboxCounter");

let activeFilter = "all";
let visibleCards = cards;
let currentIndex = 0;
let lastFocusedElement = null;

function updateGallery() {
  const query = searchInput.value.trim().toLowerCase();

  visibleCards = cards.filter((card) => {
    const matchesCategory =
      activeFilter === "all" || card.dataset.category === activeFilter;
    const searchableText =
      `${card.dataset.title} ${card.dataset.location} ${card.dataset.category}`.toLowerCase();
    const matchesSearch = searchableText.includes(query);
    const isVisible = matchesCategory && matchesSearch;
    card.hidden = !isVisible;
    return isVisible;
  });

  imageCount.textContent = String(visibleCards.length).padStart(2, "0");
  emptyState.hidden = visibleCards.length !== 0;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("filter-btn--active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    updateGallery();
  });
});

searchInput.addEventListener("input", updateGallery);

// Press "/" to focus search, unless the user is already typing in a field.
document.addEventListener("keydown", (event) => {
  const target = event.target;
  const isTyping =
    target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
  if (event.key === "/" && !isTyping && !lightbox.open) {
    event.preventDefault();
    searchInput.focus();
  }
});

function openLightbox(card) {
  const index = visibleCards.indexOf(card);
  if (index < 0) return;
  currentIndex = index;
  lastFocusedElement = document.activeElement;
  renderLightbox();
  if (typeof lightbox.showModal === "function") {
    lightbox.showModal();
  } else {
    lightbox.setAttribute("open", "");
  }
  document.querySelector("#closeLightbox").focus();
}

function renderLightbox() {
  const card = visibleCards[currentIndex];
  const image = card.querySelector("img");
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightboxCategory.textContent = card.dataset.category;
  lightboxTitle.textContent = card.dataset.title;
  lightboxLocation.textContent = card.dataset.location;
  lightboxDescription.textContent = card.dataset.description;
  lightboxCounter.textContent = `${currentIndex + 1} / ${visibleCards.length}`;
}

function moveLightbox(direction) {
  if (!visibleCards.length) return;
  currentIndex =
    (currentIndex + direction + visibleCards.length) % visibleCards.length;
  renderLightbox();
}

cards.forEach((card) => {
  card
    .querySelector(".gallery-card__button")
    .addEventListener("click", () => openLightbox(card));
});

document
  .querySelector("#prevImage")
  .addEventListener("click", () => moveLightbox(-1));
document
  .querySelector("#nextImage")
  .addEventListener("click", () => moveLightbox(1));

document
  .querySelector("#closeLightbox")
  .addEventListener("click", () => lightbox.close());

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

lightbox.addEventListener("close", () => {
  if (lastFocusedElement) lastFocusedElement.focus();
});

document.addEventListener("keydown", (event) => {
  if (!lightbox.open) return;
  if (event.key === "ArrowRight") moveLightbox(1);
  if (event.key === "ArrowLeft") moveLightbox(-1);
});

// Theme preference is saved locally in the browser.
const savedTheme = localStorage.getItem("frame-theme");
if (savedTheme === "light" || savedTheme === "dark") {
  document.documentElement.dataset.theme =
    savedTheme === "light" ? "light" : "dark";
}
themeToggle.addEventListener("click", () => {
  const nextTheme =
    document.documentElement.dataset.theme === "light" ? "dark" : "light";
  if (nextTheme === "dark") {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = "light";
  }
  localStorage.setItem("frame-theme", nextTheme);
  themeToggle.setAttribute(
    "aria-label",
    nextTheme === "light" ? "Switch to dark theme" : "Switch to light theme",
  );
});

updateGallery();
