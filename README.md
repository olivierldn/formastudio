# FORMA Studio — Website

A one-page portfolio website for FORMA Studio, a small, design-led web studio. Built with plain HTML, CSS and vanilla JavaScript — no build step, no framework.

## Running locally

This site has no build step and no dependencies. Any static file server works:

```bash
# Option 1 — Python
python -m http.server 8080

# Option 2 — Node
npx serve .
```

Then open `http://localhost:8080`. You can also open `index.html` directly in a browser, though a local server is recommended so `fetch`/module-style paths and relative asset loading behave exactly as they will in production.

## Folder structure

```
/
├── index.html            Main one-page site
├── privacy.html           Privacy policy
├── terms.html             Terms and conditions
├── README.md
├── styles/
│   ├── reset.css          Minimal CSS reset
│   ├── variables.css      Colour system, type scale, spacing, motion tokens
│   ├── main.css            Mobile-first component and layout styles
│   └── responsive.css      min-width breakpoint overrides (768 / 1024 / 1280px)
├── scripts/
│   ├── main.js             Header scroll state, scroll-reveal, hero branch parallax, contact form
│   ├── hero-carousel.js    Hero plate crossfade carousel
│   ├── portfolio.js        Selected Work project data + gallery rendering
│   ├── mobile-menu.js      Accessible full-viewport mobile menu
│   └── faq.js              FAQ data + accessible accordion
└── assets/
    ├── images/             Photography and project screenshots (see below)
    └── icons/               Standalone SVG source icons (menu, close, arrows, social)
```

The `assets/images/` folder also contains organised duplicate copies under `hero-assets/`, `project-desktop/`, `project-mobile/` and `supporting-assets/` from the original image pack. The site itself only references the flat files directly inside `assets/images/` — the subfolders are just for reference and can be deleted if you don't need them.

## Replacing portfolio projects

All "Selected Work" content lives in a single array in [`scripts/portfolio.js`](scripts/portfolio.js):

```js
const PROJECTS = [
  {
    name: "Nemesis Tattoo",
    industry: "Tattoo Studio",
    shot: "desktop",       // "desktop" or "mobile" — which screenshot the card features
    size: "lg",             // "lg" | "md" | "sm" — desktop card width
    desktopImg: "project-tattoo-desktop.webp",
    mobileImg: "project-tattoo-mobile.webp",
  },
  // ...
];
```

To add, remove or reorder a project, edit this array — the gallery markup, alt text and numbering are generated from it automatically. Drop new screenshots into `assets/images/` first and reference them by filename.

The **hero plate carousel** has its own separate slide list in [`scripts/hero-carousel.js`](scripts/hero-carousel.js) (`SLIDES`, with a matching `TILTS` array), since it intentionally only rotates through a subset of desktop screenshots and pairs each one with a name/industry caption.

## Adjusting the hero visual

The hero shows project screenshots as a single framed "plate", rather than a device mockup — this avoids the perspective/skew problems device mockups have when overlaying arbitrary screenshots. The relevant markup is `.hero-plate` in `index.html`, with styling in `styles/main.css`:

- `.hero-plate__frame` is the matted, shadowed "print" — its `aspect-ratio` (1920/1200) matches the desktop screenshots exactly, so nothing needs to be skewed or clipped to a perspective shape.
- `.hero-plate__slide` images crossfade inside it; `scripts/hero-carousel.js` also nudges `.hero-plate__frame`'s rotation by a degree or so per slide (the `TILTS` array) for a hand-set feel.

If you want to swap in a different aspect ratio of screenshot, update the `aspect-ratio` on `.hero-plate__inner` to match — no percentage/clip-path re-measuring needed, since the plate is a flat rectangle rather than a masked shape inside another photo.

## Changing the contact email

The email address `hello@formastudio.uk` appears in a few places — update all of them:

- `index.html`: mobile menu footer, final CTA section, footer
- `privacy.html` and `terms.html`: contact sections
- `scripts/main.js`: the fallback message shown if the form submission fails

## Configuring the contact form

The form (`#contact-form` in `index.html`) submits directly (no email app popup) via [FormSubmit.co](https://formsubmit.co), a form-relay service that needs no account signup. Configured in `scripts/main.js`:

```js
// scripts/main.js
const DESTINATION_EMAIL = "hello@formastudio.uk";
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${DESTINATION_EMAIL}`;
```

**One-time activation step:** the first submission FormSubmit receives for a given destination address doesn't get delivered — instead it sends a confirmation email to that address with an activation link. Someone with access to that inbox needs to click it once. After that, every future submission is delivered automatically and silently (no email app, no redirect). If you change `DESTINATION_EMAIL`, you'll need to repeat this activation step for the new address.

**Changing to a different provider:**

**Formspree** (adds a submissions dashboard, spam filtering)
1. Create a form at [formspree.io](https://formspree.io) and copy your endpoint URL.
2. Replace `FORM_ENDPOINT` in `scripts/main.js` with that URL, and change the `fetch` body from `JSON.stringify(buildPayload())` to `new FormData(form)` (drop the `Content-Type` header so the browser sets the correct multipart one).

**Netlify Forms** (only if deployed on Netlify)
1. Add `data-netlify="true"` and a hidden `form-name` input to the `<form>` in `index.html`.
2. Point `FORM_ENDPOINT` at `/` and send `body: new URLSearchParams(new FormData(form)).toString()` with `Content-Type: application/x-www-form-urlencoded`, or let Netlify's build-time form detection handle it natively instead of intercepting in JS.

The form already includes:
- A hidden honeypot field (`_gotcha`) as a basic spam trap, checked client-side before any request is sent
- Client-side validation with accessible, per-field error messages
- Loading, success and error states surfaced via `[data-form-status]`

No credentials or API keys are stored in this codebase — only a public destination email address.

## Deployment

The site is fully static, so any of the following work with no configuration changes:

**GitHub Pages**
1. Push this folder to a GitHub repository.
2. In the repo settings, enable Pages and point it at the `main` branch, root folder.
3. Your site will be available at `https://<username>.github.io/<repo>/`.

**Netlify**
1. Drag-and-drop the project folder into Netlify, or connect the Git repository.
2. Build command: none. Publish directory: `/` (the project root).

**Vercel**
1. Import the Git repository in the Vercel dashboard.
2. Framework preset: "Other" / static. Build command: none. Output directory: `/`.

## Notes on the image pack

- Desktop project screenshots: 1920×1200.
- Mobile project screenshots: 1080×1920.
- Decorative/hero assets (`forma-*.webp`): 2000×1333, WebP-compressed.
- All portfolio work is concept work created for demonstration purposes and is labelled as such throughout the site — see `privacy.html`/`terms.html` and the "Selected Work" section copy if you ever add real client projects, so that labelling stays accurate.
