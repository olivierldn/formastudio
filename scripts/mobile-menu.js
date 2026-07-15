/**
 * Accessible full-viewport mobile menu.
 * Locks body scroll while open, traps focus, closes on Escape or
 * backdrop link click, and restores focus to the toggle button.
 */

(function initMobileMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");
  const closeBtn = document.querySelector("[data-menu-close]");
  if (!toggle || !menu || !closeBtn) return;

  const focusableSelector = 'a[href], button:not([disabled])';
  let lastFocused = null;

  function getFocusable() {
    return Array.from(menu.querySelectorAll(focusableSelector));
  }

  function openMenu() {
    lastFocused = document.activeElement;
    menu.classList.add("is-open");
    document.body.classList.add("menu-open");
    toggle.setAttribute("aria-expanded", "true");
    menu.removeAttribute("inert");
    closeBtn.focus();
    document.addEventListener("keydown", onKeydown);
  }

  function closeMenu() {
    menu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    menu.setAttribute("inert", "");
    document.removeEventListener("keydown", onKeydown);
    if (lastFocused) lastFocused.focus();
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
      return;
    }
    if (e.key === "Tab") {
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.contains("is-open");
    if (isOpen) closeMenu(); else openMenu();
  });

  closeBtn.addEventListener("click", closeMenu);

  menu.querySelectorAll("[data-menu-link]").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024 && menu.classList.contains("is-open")) {
      closeMenu();
    }
  });
})();
