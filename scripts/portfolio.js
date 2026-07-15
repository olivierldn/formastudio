/**
 * Selected Work — project data and gallery rendering.
 *
 * To add, remove or reorder a project, edit the PROJECTS array below.
 * Each entry needs:
 *   name       – project/client name shown on the card
 *   industry   – short industry label
 *   shot       – "desktop" or "mobile", controls which screenshot is
 *                featured on the card (kept mixed intentionally so the
 *                gallery doesn't feel like a row of identical tiles)
 *   size       – "lg" | "md" | "sm", controls the card's width on the
 *                desktop horizontal gallery
 *   desktopImg / mobileImg – filenames inside assets/images/
 */

const PROJECTS = [
  {
    name: "Nemesis Tattoo",
    industry: "Tattoo Studio",
    shot: "desktop",
    size: "lg",
    desktopImg: "project-tattoo-desktop.webp",
    mobileImg: "project-tattoo-mobile.webp",
  },
  {
    name: "Fern & Fork",
    industry: "Restaurant",
    shot: "desktop",
    size: "md",
    desktopImg: "project-restaurant-desktop.webp",
    mobileImg: "project-restaurant-mobile.webp",
  },
  {
    name: "Pampered",
    industry: "Dog Grooming",
    shot: "mobile",
    size: "sm",
    desktopImg: "project-dog-grooming-desktop.webp",
    mobileImg: "project-dog-grooming-mobile.webp",
  },
  {
    name: "Greenhaven",
    industry: "Landscaping",
    shot: "desktop",
    size: "lg",
    desktopImg: "project-landscaping-desktop.webp",
    mobileImg: "project-landscaping-mobile.webp",
  },
  {
    name: "Immaculate",
    industry: "Car Detailing",
    shot: "desktop",
    size: "md",
    desktopImg: "project-car-detailing-desktop.webp",
    mobileImg: "project-car-detailing-mobile.webp",
  },
  {
    name: "Kinetic",
    industry: "Physiotherapy",
    shot: "mobile",
    size: "sm",
    desktopImg: "project-physio-desktop.webp",
    mobileImg: "project-physio-mobile.webp",
  },
  {
    name: "Haven",
    industry: "Coffee Shop",
    shot: "desktop",
    size: "md",
    desktopImg: "project-coffee-desktop.webp",
    mobileImg: "project-coffee-mobile.webp",
  },
  {
    name: "Volt Studio",
    industry: "Electrical Services",
    shot: "desktop",
    size: "lg",
    desktopImg: "project-electrician-desktop.webp",
    mobileImg: "project-electrician-mobile.webp",
  },
  {
    name: "Northcut",
    industry: "Barbers",
    shot: "mobile",
    size: "sm",
    desktopImg: "project-barber-desktop.webp",
    mobileImg: "project-barber-mobile.webp",
  },
  {
    name: "Lumière",
    industry: "Aesthetic Clinic",
    shot: "desktop",
    size: "md",
    desktopImg: "project-aesthetics-desktop.webp",
    mobileImg: "project-aesthetics-mobile.webp",
  },
];

(function initPortfolio() {
  const track = document.querySelector("[data-work-track]");
  if (!track) return;

  const IMG_BASE = "assets/images/";

  const markup = PROJECTS.map((project, i) => {
    const index = String(i + 1).padStart(2, "0");
    const isMobileShot = project.shot === "mobile";
    const img = isMobileShot ? project.mobileImg : project.desktopImg;
    const cardTypeClass = isMobileShot ? "work-card--mobile" : "work-card--desktop";
    const sizeClass = isMobileShot ? "" : `work-card--${project.size}`;
    const loading = i < 3 ? "eager" : "lazy";
    const alt = `${project.name}, a concept ${project.industry.toLowerCase()} website — ${isMobileShot ? "mobile" : "desktop"} view`;

    return `
      <article class="work-card ${cardTypeClass} ${sizeClass}" data-work-card>
        <a href="#contact" class="work-card__link" aria-label="${project.name}, ${project.industry}, concept project">
          <div class="work-card__media">
            <img src="${IMG_BASE}${img}" alt="${alt}" loading="${loading}" width="${isMobileShot ? 1080 : 1920}" height="${isMobileShot ? 1920 : 1200}">
          </div>
          <div class="work-card__meta">
            <div>
              <span class="work-card__index">${index}</span>
              <h3 class="work-card__title">${project.name}</h3>
              <p class="work-card__industry">${project.industry}</p>
              <span class="work-card__tag">Concept Project</span>
            </div>
            <span class="work-card__arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="19" y2="12"></line><polyline points="13 6 19 12 13 18"></polyline></svg>
            </span>
          </div>
        </a>
      </article>`;
  }).join("");

  track.innerHTML = markup;

  // Desktop horizontal navigation
  const prevBtn = document.querySelector("[data-work-prev]");
  const nextBtn = document.querySelector("[data-work-next]");
  if (!prevBtn || !nextBtn) return;

  function scrollAmount() {
    const card = track.querySelector("[data-work-card]");
    return card ? card.getBoundingClientRect().width + 32 : 400;
  }

  function updateNavState() {
    const maxScroll = track.scrollWidth - track.clientWidth - 2;
    prevBtn.disabled = track.scrollLeft <= 0;
    nextBtn.disabled = track.scrollLeft >= maxScroll;
  }

  prevBtn.addEventListener("click", () => {
    track.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
  });

  nextBtn.addEventListener("click", () => {
    track.scrollBy({ left: scrollAmount(), behavior: "smooth" });
  });

  track.addEventListener("scroll", updateNavState, { passive: true });
  window.addEventListener("resize", updateNavState);
  updateNavState();
})();
