/**
 * Hero plate carousel.
 * Crossfades a set of project screenshots inside the framed "plate",
 * with a caption naming the project and clickable pagination dots.
 * Pauses on hover and when the tab is hidden; disables autoplay
 * entirely under reduced motion.
 */

(function initHeroCarousel() {
  const screen = document.querySelector("[data-hero-screen]");
  if (!screen) return;

  const IMG_BASE = "assets/images/";
  const SLIDES = [
    { file: "project-restaurant-desktop.webp", name: "Fern & Fork", industry: "Restaurant" },
    { file: "project-tattoo-desktop.webp", name: "Nemesis Tattoo", industry: "Tattoo Studio" },
    { file: "project-dog-grooming-desktop.webp", name: "Pampered", industry: "Dog Grooming" },
    { file: "project-landscaping-desktop.webp", name: "Greenhaven", industry: "Landscaping" },
    { file: "project-physio-desktop.webp", name: "Kinetic", industry: "Physiotherapy" },
    { file: "project-coffee-desktop.webp", name: "Haven", industry: "Coffee Shop" },
  ];

  // Subtle per-slide tilt, as if each print had been set down by hand.
  const TILTS = [-0.6, 0.5, -0.35, 0.65, -0.5, 0.4];

  const INTERVAL = 4000;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  screen.innerHTML = SLIDES.map((slide, i) => `
    <img
      src="${IMG_BASE}${slide.file}"
      alt="${i === 0 ? slide.name + ", a concept " + slide.industry.toLowerCase() + " website" : ""}"
      class="hero-plate__slide${i === 0 ? " is-active" : ""}"
      loading="${i === 0 ? "eager" : "lazy"}"
      width="1920" height="1200"
    >`).join("");

  const dotsWrap = document.querySelector("[data-hero-dots]");
  if (dotsWrap) {
    dotsWrap.innerHTML = SLIDES.map((slide, i) => `
      <button type="button" aria-current="${i === 0 ? "true" : "false"}" aria-label="Show ${slide.name}, ${slide.industry}">
        <span></span>
      </button>`).join("");
  }

  const frame = document.querySelector("[data-hero-frame]");
  const caption = document.querySelector("[data-hero-caption]");
  const slideEls = Array.from(screen.querySelectorAll(".hero-plate__slide"));
  const dotEls = dotsWrap ? Array.from(dotsWrap.querySelectorAll("button")) : [];

  function renderCaption(index) {
    if (!caption) return;
    const slide = SLIDES[index];
    caption.innerHTML = `<span class="hero-plate__caption-name">${slide.name}</span>${slide.industry}`;
  }

  function applyTilt(index) {
    if (!frame || prefersReducedMotion) return;
    frame.style.transform = `rotate(${TILTS[index % TILTS.length]}deg)`;
  }

  renderCaption(0);
  applyTilt(0);

  let current = 0;
  let timer = null;
  let isHovered = false;
  let isHidden = document.hidden;

  function goTo(index) {
    if (index === current) return;
    slideEls[current].classList.remove("is-active");
    dotEls[current] && dotEls[current].setAttribute("aria-current", "false");
    current = index;
    slideEls[current].classList.add("is-active");
    dotEls[current] && dotEls[current].setAttribute("aria-current", "true");
    renderCaption(current);
    applyTilt(current);
  }

  function next() {
    goTo((current + 1) % SLIDES.length);
  }

  function start() {
    if (prefersReducedMotion || timer) return;
    timer = window.setInterval(() => {
      if (!isHovered && !isHidden) next();
    }, INTERVAL);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  const plate = screen.closest(".hero-plate") || screen;
  plate.addEventListener("mouseenter", () => { isHovered = true; });
  plate.addEventListener("mouseleave", () => { isHovered = false; });

  document.addEventListener("visibilitychange", () => {
    isHidden = document.hidden;
  });

  dotEls.forEach((dot, i) => {
    dot.addEventListener("click", () => goTo(i));
  });

  if (!prefersReducedMotion) start();
})();
