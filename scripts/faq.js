/**
 * FAQ accordion — data-driven, single source of truth for
 * questions/answers. Renders an accessible accordion (button +
 * aria-expanded, panel with aria-hidden) and wires up toggling.
 */

const FAQS = [
  {
    q: "How much does a website cost?",
    a: "Pricing depends on the number of sections, features, content requirements and level of customisation. After a short discovery conversation, you will receive a clear fixed proposal.",
  },
  {
    q: "How long does a website take?",
    a: "A focused one-page website may take a few weeks, while larger or more complex projects require more time. The expected timeline is agreed before work begins.",
  },
  {
    q: "Can you redesign my current website?",
    a: "Yes. Many projects begin with an existing website that no longer reflects the business. The content, structure and goals are reviewed first, then a new design and build are proposed around what the business needs now.",
  },
  {
    q: "Will the website work on mobile?",
    a: "Yes. Every website is designed and tested across mobile, tablet and desktop so it stays clear and easy to use on any screen.",
  },
  {
    q: "Can I update the website myself?",
    a: "That depends on how the website is built. A CMS can be included when regular content editing is required. For simpler websites, updates can be handled through an optional support arrangement.",
  },
  {
    q: "Can a CMS be included?",
    a: "Yes. When regular editing is important, a suitable CMS can be discussed and included in the project scope.",
  },
  {
    q: "Do you provide hosting and domains?",
    a: "FORMA can help select, configure and connect suitable hosting and a domain. Third-party hosting and domain fees are paid separately.",
  },
  {
    q: "What happens after launch?",
    a: "You receive the access details and guidance relevant to your website. Ongoing support, maintenance and content updates can also be arranged.",
  },
  {
    q: "Do you provide ongoing updates?",
    a: "Yes, when it's useful. Some projects are a single build, others include an ongoing arrangement for regular content changes and small improvements — this is agreed separately from the initial project.",
  },
  {
    q: "What do you need from me before starting?",
    a: "A short discovery conversation to cover your business, audience and goals. Existing branding or content is helpful if you have it, but nothing is required before that first conversation.",
  },
];

(function initFaq() {
  const list = document.querySelector("[data-faq-list]");
  if (!list) return;

  // Drives the two-column layout at desktop widths (styles/responsive.css)
  // so items split evenly into two columns regardless of how many there are.
  list.style.setProperty("--faq-rows", String(Math.ceil(FAQS.length / 2)));

  list.innerHTML = FAQS.map((item, i) => {
    const qid = `faq-q-${i}`;
    const pid = `faq-p-${i}`;
    return `
      <div class="faq-item">
        <h3>
          <button type="button" class="faq-item__question" id="${qid}" aria-expanded="false" aria-controls="${pid}" data-faq-trigger>
            <span>${item.q}</span>
            <span class="faq-item__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </span>
          </button>
        </h3>
        <div class="faq-item__panel" id="${pid}" role="region" aria-labelledby="${qid}" data-open="false">
          <div class="faq-item__panel-inner">
            <p class="faq-item__answer">${item.a}</p>
          </div>
        </div>
      </div>`;
  }).join("");

  const triggers = Array.from(list.querySelectorAll("[data-faq-trigger]"));

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const panel = document.getElementById(trigger.getAttribute("aria-controls"));
      const isOpen = trigger.getAttribute("aria-expanded") === "true";

      // Close any other open item so only one is expanded at a time.
      triggers.forEach((t) => {
        if (t !== trigger) {
          t.setAttribute("aria-expanded", "false");
          const p = document.getElementById(t.getAttribute("aria-controls"));
          if (p) p.setAttribute("data-open", "false");
        }
      });

      trigger.setAttribute("aria-expanded", String(!isOpen));
      if (panel) panel.setAttribute("data-open", String(!isOpen));
    });
  });
})();
