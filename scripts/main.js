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

  // Where enquiries are delivered. Submissions are sent directly (no
  // email app popup) via FormSubmit.co, a form-relay service that
  // needs no account signup — just a one-time confirmation click from
  // this inbox the first time it receives a submission. See README.md
  // for the activation step and how to swap in a different provider
  // (e.g. Formspree) later if you want a submissions dashboard.
  const DESTINATION_EMAIL = "hello@formastudio.uk";
  const FORM_ENDPOINT = `https://formsubmit.co/ajax/${DESTINATION_EMAIL}`;

  const statusEl = form.querySelector("[data-form-status]");
  const submitBtn = form.querySelector("[data-form-submit]");

  const ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><polyline points="8 12.5 10.5 15 16 9"></polyline></svg>';
  const ICON_ALERT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><line x1="12" y1="7.5" x2="12" y2="13"></line><line x1="12" y1="16.3" x2="12" y2="16.4"></line></svg>';
  const ICON_SPINNER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9" opacity="0.25"></circle><path d="M21 12a9 9 0 0 0-9-9"></path></svg>';

  function setStatus(state, message) {
    if (!statusEl) return;
    statusEl.dataset.state = state;
    const icon = state === "error" ? ICON_ALERT : state === "success" ? ICON_CHECK : state === "loading" ? ICON_SPINNER : "";
    statusEl.innerHTML = `${icon}<span>${message}</span>`;
  }

  function buildPayload() {
    const data = new FormData(form);
    const get = (key) => (data.get(key) || "").toString().trim();

    return {
      name: get("name"),
      business: get("business"),
      email: get("email"),
      current_url: get("current_url") || "—",
      business_description: get("business_description"),
      help_needed: get("help_needed"),
      budget: get("budget") || "Not specified",
      timeframe: get("timeframe") || "Not specified",
      _subject: `New project enquiry — ${get("business") || get("name")}`,
      _template: "table",
      _captcha: "false",
    };
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

  form.addEventListener("submit", async (e) => {
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

    submitBtn && submitBtn.setAttribute("disabled", "true");
    setStatus("loading", "Sending your message…");

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(buildPayload()),
      });

      // FormSubmit returns HTTP 200 even when it hasn't actually delivered
      // the message (e.g. the destination address still needs its one-time
      // activation click) — the real result is in the JSON body, not the
      // status code, so both have to be checked.
      const result = await response.json().catch(() => null);
      if (!response.ok || !result || result.success === "false" || result.success === false) {
        throw new Error((result && result.message) || "Form submission failed");
      }

      form.reset();
      setStatus("success", "Thank you — your message has been sent. I'll be in touch soon.");
    } catch (err) {
      setStatus(
        "error",
        `Something went wrong sending your message. Please try again, or email ${DESTINATION_EMAIL} directly.`
      );
    } finally {
      submitBtn && submitBtn.removeAttribute("disabled");
    }
  });
})();

/* ---------- Footer year ---------- */

(function footerYear() {
  const el = document.querySelector("[data-year]");
  if (el) el.textContent = String(new Date().getFullYear());
})();
