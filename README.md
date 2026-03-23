# Portfolio — FAO

Personal portfolio website for **Farouk Ahmed (FAO)** — a full-stack developer showcase built with **Angular 18**, **Server-Side Rendering (SSR)** via Express, and a Mono-inspired static front-end (Elementor/Qi Addons asset paths under `public/`).

**Repository:** [github.com/Farouk-Ahmed/Portfolio](https://github.com/Farouk-Ahmed/Portfolio)

## Features

- **Single-page layout** with anchor navigation: Home, Services, Creative Works, About, Contact
- **Hero** with animated headline, intro copy, CV download (PDF), and **Vanta NET** background on `#home`
- **Creative Works** — project galleries using **Swiper**; image lists load from `manifest.json` for `proj-1` and `proj-2` (fallback images if manifests fail)
- **Contact form** — submits via [FormSubmit](https://formsubmit.co/) (no custom backend); first submission requires inbox activation
- **Magnific Popup** image gallery, **WOW.js** / **Qi Addons** re-initialization after Angular renders
- **Scroll-to-top** control and responsive header / mobile sidebar menu

## Tech stack

| Area | Details |
|------|---------|
| Framework | Angular 18 (standalone components) |
| SSR | `@angular/ssr` + Express (`server.ts`) |
| Styling | SCSS + theme CSS in `public/wp-content/themes/mono/` |
| HTTP | `HttpClient` for manifests and form POST |
| Tooling | Angular CLI 18.2.x, TypeScript ~5.5 |

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended, compatible with Angular 18)
- npm

## Scripts

```bash
npm install
npm start                 # Dev server → http://localhost:4200/
npm run build             # Production build → dist/newv/
npm run serve:ssr:newv    # Run SSR (after build): node dist/newv/server/server.mjs
npm test                  # Unit tests (Karma)
```

### Regenerate project image manifests

After adding or changing images under `public/wp-content/uploads/2024/Projects/<proj-id>/`:

```bash
npm run proj1:manifest
npm run proj2:manifest
npm run proj4:manifest
```

## Project structure (short)

- `src/app/` — root `AppComponent` (template, contact handler, Swiper/Vanta/Qi re-init)
- `src/app/components/` — e.g. `custom-popup`
- `public/` — static assets (images, fonts, legacy theme/plugin paths)
- `scripts/generate-project-manifest.mjs` — writes `manifest.json` per project folder

## Development notes

- Static assets are served from `public/` as configured in `angular.json`.
- Contact endpoint and subject line are defined in `app.component.ts`; adjust email/FormSubmit URL for your deployment.
- Generated output and caches are ignored via `.gitignore` (`dist/`, `node_modules/`, `.angular/cache`).

## License

Personal portfolio project — use and adapt for your own site as needed.
