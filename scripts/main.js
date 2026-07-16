/**
 * FORMA Studio — shared site behaviour:
 * header scroll state, scroll-reveal, hero branch-shadow parallax,
 * and the contact form.
 */

/* ---------- Header scroll state ---------- */

(function headerScroll() {
  const header = document.querySelector("[data-site-header]");
  if (!header) return;

  function update() {
    if (window.scrollY > 24) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  update();
  window.addEventListener("scroll", update, { passive: true });
})();

/* ---------- Fast smooth-scroll for in-page anchor links ---------- */

(function smoothAnchorScroll() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DURATION = 450; // ms — quick and deliberate rather than a slow drift
  const HEADER_OFFSET = 110; // clears the fixed header with a little breathing room

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  // Full <section> elements have a lot of their own top padding (part of
  // the page's general vertical rhythm), which would otherwise leave a
  // big empty gap between the header and the section's actual heading
  // when jumped to directly. Scroll to the section's inner .container
  // instead, so we land right at the content rather than the padding.
  function resolveScrollTarget(el) {
    if (el.tagName === "SECTION") {
      return el.querySelector(".container") || el;
    }
    return el;
  }

  function animateScrollTo(targetY) {
    const startY = window.scrollY;
    const distance = targetY - startY;

    if (prefersReducedMotion || Math.abs(distance) < 1) {
      window.scrollTo(0, targetY);
      return;
    }

    const startTime = performance.now();

    function step(now) {
      const progress = Math.min((now - startTime) / DURATION, 1);
      window.scrollTo(0, startY + distance * easeOutQuart(progress));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;

    const target = document.querySelector(hash);
    if (!target) return;

    e.preventDefault();
    const scrollTarget = resolveScrollTarget(target);
    const targetY = scrollTarget.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    animateScrollTo(Math.max(targetY, 0));

    if (history.pushState) history.pushState(null, "", hash);
  });
})();

/* ---------- Scroll reveal ---------- */

(function scrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  items.forEach((el) => observer.observe(el));
})();

/* ---------- Hero branch shadow — subtle pointer + scroll drift ---------- */

(function branchShadowMotion() {
  const branch = document.querySelector("[data-hero-branch]");
  if (!branch) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.matchMedia("(max-width: 1023px)").matches) return; // static on mobile

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let raf = null;

  function apply() {
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;
    branch.style.transform = `translate(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px)`;
    raf = requestAnimationFrame(apply);
  }

  window.addEventListener("pointermove", (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    targetX = nx * 14;
    targetY = ny * 10;
  });

  window.addEventListener(
    "scroll",
    () => {
      targetY = -window.scrollY * 0.03;
    },
    { passive: true }
  );

  raf = requestAnimationFrame(apply);
  window.addEventListener("pagehide", () => raf && cancelAnimationFrame(raf));
})();

/* ---------- Contact form ---------- */

(function contactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  // Where enquiries are delivered. This opens the visitor's own email
  // app with the message pre-filled (mailto) — no backend or
  // third-party account required, so it works the moment the site is
  // deployed anywhere (or opened locally).
  //
  // For a fully automatic, silent submission (no email app popup on
  // the visitor's side), replace this with a real form-handling
  // service instead — see README.md for Formspree / Netlify Forms
  // setup steps.
  const DESTINATION_EMAIL = "rynkiewicz.olivier@gmail.com";

  const statusEl = form.querySelector("[data-form-status]");
  const submitBtn = form.querySelector("[data-form-submit]");

  const ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><polyline points="8 12.5 10.5 15 16 9"></polyline></svg>';
  const ICON_ALERT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><line x1="12" y1="7.5" x2="12" y2="13"></line><line x1="12" y1="16.3" x2="12" y2="16.4"></line></svg>';

  function setStatus(state, message) {
    if (!statusEl) return;
    statusEl.dataset.state = state;
    const icon = state === "error" ? ICON_ALERT : state === "success" ? ICON_CHECK : "";
    statusEl.innerHTML = `${icon}<span>${message}</span>`;
  }

  function buildMailto() {
    const data = new FormData(form);
    const get = (key) => (data.get(key) || "").toString().trim();

    const lines = [
      `Name: ${get("name")}`,
      `Business name: ${get("business")}`,
      `Email: ${get("email")}`,
      `Current website: ${get("current_url") || "—"}`,
      "",
      "What does your business do?",
      get("business_description"),
      "",
      "What would you like help with?",
      get("help_needed"),
      "",
      `Estimated budget: ${get("budget") || "Not specified"}`,
      `Preferred launch timeframe: ${get("timeframe") || "Not specified"}`,
    ];

    const subject = `New project enquiry — ${get("business") || get("name")}`;
    return `mailto:${DESTINATION_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
  }

  const requiredFields = Array.from(form.querySelectorAll("[required]"));

  function setFieldError(field, message) {
    const wrap = field.closest(".form-field");
    if (!wrap) return;
    const errorEl = wrap.querySelector(".form-error");
    if (message) {
      wrap.classList.add("has-error");
      if (errorEl) errorEl.textContent = message;
      field.setAttribute("aria-invalid", "true");
    } else {
      wrap.classList.remove("has-error");
      if (errorEl) errorEl.textContent = "";
      field.removeAttribute("aria-invalid");
    }
  }

  function validateField(field) {
    if (field.type === "email") {
      const value = field.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) {
        setFieldError(field, "Email is required.");
        return false;
      }
      if (!emailPattern.test(value)) {
        setFieldError(field, "Enter a valid email address.");
        return false;
      }
      setFieldError(field, "");
      return true;
    }

    if (!field.value || !field.value.trim()) {
      setFieldError(field, "This field is required.");
      return false;
    }

    setFieldError(field, "");
    return true;
  }

  requiredFields.forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Honeypot: if this hidden field has a value, silently drop the
    // submission — it was almost certainly filled in by a bot.
    const honeypot = form.querySelector('[name="_gotcha"]');
    if (honeypot && honeypot.value) {
      form.reset();
      return;
    }

    let isValid = true;
    requiredFields.forEach((field) => {
      if (!validateField(field)) isValid = false;
    });

    if (!isValid) {
      setStatus("error", "Please check the highlighted fields and try again.");
      const firstError = form.querySelector(".has-error input, .has-error textarea, .has-error select");
      if (firstError) firstError.focus();
      return;
    }

    // Opens the visitor's email app with the message pre-filled, addressed
    // to DESTINATION_EMAIL above. This is instant and needs no network
    // request, so there's no loading state to show here.
    window.location.href = buildMailto();

    setStatus(
      "success",
      "Your email app should now open with this message ready to send — just hit send there to reach FORMA. If nothing opened, email hello@formastudio.co.uk directly."
    );
    form.reset();
  });
})();

/* ---------- Footer year ---------- */

(function footerYear() {
  const el = document.querySelector("[data-year]");
  if (el) el.textContent = String(new Date().getFullYear());
})();
