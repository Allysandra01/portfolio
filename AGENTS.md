# MyPortfolio

Allsandra Camacho — Frontend Developer portfolio site.

Built with vanilla HTML, CSS (vanilla), and JavaScript (vanilla). No frameworks, no build step.

## Tech Stack

- **HTML5** — Semantic markup, SEO meta tags, JSON-LD structured data
- **CSS3** — Custom properties (design tokens), light/dark mode, glassmorphism, responsive layouts
- **JavaScript (ES2021)** — Vanilla JS, IntersectionObserver, DOM manipulation, Fetch API

## Project Structure

```
myportfolio/
├── index.html               # Main entry point (single page)
├── AGENTS.md                # This file
├── package.json             # Scripts + dev dependencies
├── .editorconfig            # Editor formatting
├── .eslintrc.json           # JS linting config
├── .prettierrc.json         # Code formatting config
├── .gitignore
├── css/
│   ├── variables.css        # Design tokens (colors, fonts, spacing, breakpoints)
│   ├── reset.css            # CSS reset, scrollbar, reduced motion
│   ├── layout.css           # All section styles + media queries
│   ├── components.css       # Buttons, tech badges
│   └── animations.css       # Scroll animations, keyframes, delay modifiers
├── js/
│   ├── main.js              # Data fetching, rendering, typewriter, counters, form
│   ├── navigation.js        # Theme toggle, mobile menu, scroll effects, progress bar
│   ├── projects.js          # Project card rendering + filter system
│   └── scroll-animations.js # IntersectionObserver for fade/slide animations
└── data/
    └── portfolio.json       # All content (edit this to customize)
```

## Data Model

All content lives in `data/portfolio.json`. The page renders dynamically from this file.

```json
{
  "personal": { "name", "title", "tagline", "email", "social", "stats" },
  "about":    { "bio", "skills": [{ "category", "items" }] },
  "experience": [{ "role", "company", "period", "description", "highlights" }],
  "projects": [{ "title", "description", "tags", "image", "liveUrl", "repoUrl", "featured" }],
  "testimonials": [{ "quote", "author", "role" }]
}
```

## Scripts

| Command                | Description                                 |
| ---------------------- | ------------------------------------------- |
| `npm run dev`          | Start dev server at `http://localhost:3000` |
| `npm run lint`         | Run ESLint on `js/`                         |
| `npm run format`       | Auto-format all files with Prettier         |
| `npm run format:check` | Check formatting without writing            |

## Architecture Decisions

- **No framework.** The site is a single HTML page served statically. No React, no build step, no bundler.
- **Data-driven rendering.** `main.js` fetches `portfolio.json` on load and renders all sections via string template interpolation.
- **CSS custom properties** for theming. Light/dark mode toggled by `[data-theme]` on `<html>`, persisted in `localStorage`.
- **Animations use classes + CSS transitions.** The `[data-animate]` attribute is observed by an IntersectionObserver which adds `.animated` to trigger the transition.
- **No CSS preprocessor.** Plain CSS with `@import` for organization.

## Coding Conventions

- **No comments in code** unless absolutely necessary for clarification
- **CSS:** BEM-like naming (`.block__element--modifier`), custom properties in `:root`, section-specific styles in `layout.css`
- **JS:** Function declarations (not arrow functions for top-level), camelCase, no classes (plain objects/functions)
- **Formatting:** 2-space indent, single quotes, trailing commas, 100 char width (enforced by Prettier)

## Accessibility

- Skip-to-content link at top of page
- `aria-label`, `aria-labelledby`, `role` attributes on interactive/structure elements
- `aria-expanded` on hamburger menu button
- `aria-live="polite"` on form banner
- `prefers-reduced-motion` respected in both CSS and JS
- Focus-visible outlines on all interactive elements

## Editing the Portfolio

1. Edit `data/portfolio.json` to update name, bio, projects, skills, experience, testimonials, social links
2. Update the Formspree form action in `index.html` (line 165) with your real form endpoint
3. Replace `#` URLs in projects with real links
4. Add project screenshots by filling the `image` field in portfolio.json
5. Update the favicon in `index.html` to your initials or logo
