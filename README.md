# The Pond

A dark green, responsive website for discovering standout tweets about Identity.md. The visual theme is a squad of Pepes equipped with AI tools. Built with Vite, React, and TypeScript.

The finished static site is **`dist/index.html`**, with its complete local asset tree. Source, `package.json`, `package-lock.json`, configuration, and the export are included for submission. Repository metadata was left untouched as required by the assignment; the network handles committing and publishing the submitted tree.

## What works

- Nine real public posts from six accounts, with exact short excerpts and original X status links.
- Most-liked, most-reposted, and newest sorting within this collection.
- Search across authors, excerpts, topics, and editorial context; topic filters and clear empty-state recovery.
- Bookmarks stored on this browser/device, including graceful operation when browser storage is unavailable.
- Copy-original-link controls, with a manual-copy dialog when clipboard access is denied.
- Expandable context, per-post source/count dialogs, keyboard navigation, reduced-motion support, and hash navigation for saved posts.

The collection and engagement figures are a **static snapshot captured on 15 October 2026**. “Top” means ranked within these nine selected posts. It does not claim to rank all of X. Full sourcing and update instructions are in [SOURCES.md](SOURCES.md); the same limitation is visible in the interface. There is no backend, login, wallet, analytics, or live API dependency.

## Install, develop, and preview

Use Node.js 22 with npm. Install the exact versions from the lockfile:

```sh
npm ci --cache test/scratch/npm-cache
npm run dev
```

For the production export:

```sh
npm run typecheck
npm run build
npm run check:export
npm run preview
```

Open the local preview URL printed by Vite. Alternatively, serve the existing `dist/` directory using any static HTTP server. Vite uses `base: './'`; runtime assets are relative, and navigation uses URL hashes. The validation suite loads the export under `/preview/` to exercise subpath hosting. Opening `index.html` directly through `file://` is not the supported preview path for ES modules.

`npm run build` rebuilds the complete export. It copies artwork, avatars, social image, and license notices from `public/` and bundles the local font and JavaScript/CSS. No network requests are made by the built site until a visitor follows an external link. Installing dependencies requires network access or an existing npm cache.

## Validation actually performed

Validation date: 15 October 2026, on the final source and production export.

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed, TypeScript reported no errors |
| `npm run build` | Passed, Vite production export generated |
| `npm run check:export` | Passed, entry assets and local avatars exist; relative entry URLs; unique valid post IDs; deliverable below 8 MiB |
| `npm run test:interaction` with the supplied Playwright module | 22 Chromium checks passed |
| Pinned `taste@1` probe, offline | 16/16 checks passed at 320, 390, and 1440 pixels |
| Axe accessibility scans | Zero violations in the default feed and About dialog |
| Additional layout checks | No horizontal overflow at 540, 820, and 1024 pixels, or at 390 pixels with 200% root text size |
| First screen at 390 × 844 | Tweet excerpt, search, topic filters, save/copy controls, and the first “View on X” link are visible |
| Console and local resources | No page exceptions or missing files during interaction checks; external requests blocked |

The interaction suite checks ranking, search, topics, load more, expandable context, persistence, saved empty state, dialog focus/escape/restoration, source details, clipboard success/failure, keyboard search, outbound post URLs, reduced motion, long queries, corrupt storage, and blocked storage. It starts and stops its own preview server within a single foreground invocation.

On the supplied validation runtime, the command was:

```sh
IMD_PLAYWRIGHT=/opt/imd-tools/playwright-mcp/node_modules/playwright/index.mjs PLAYWRIGHT_BROWSERS_PATH=/opt/imd-tools/ms-playwright npm run test:interaction
```

For another environment, point `IMD_PLAYWRIGHT` at an available Playwright `index.mjs` and `PLAYWRIGHT_BROWSERS_PATH` at its browser installation. The checker does not install browsers. Run `npm run build` before interaction checks.

During this assignment, the pinned probe was run before the final build with:

```sh
IMD_PLAYWRIGHT=/opt/imd-tools/playwright-mcp/node_modules/playwright/index.mjs PLAYWRIGHT_BROWSERS_PATH=/opt/imd-tools/ms-playwright node .imd/reads/skills/design-critic/scripts/taste.mjs --out test/scratch/taste --offline
```

The pinned inputs are removed by the network after submission. The project's own `scripts/validate.mjs` and `scripts/check-export.mjs` remain available. Detailed coverage, corrected findings, and limitations are recorded in [artifacts/validation.md](artifacts/validation.md). [DESIGN.md](DESIGN.md) documents the final design system.

## Limits of verification

WebKit could not launch from the supplied browser runtime; Safari and physical iPhone behavior remain unverified. The browser connector returned “Transport closed,” so rendered inspection used the installed Playwright Chromium directly and its screenshots. No browser was installed. These are tooling limitations, not claims that Safari passed.

Native screen-reader sessions, native browser 200% zoom, forced-colors rendering, and RTL localization were not tested. The text-enlargement test is distinct from native zoom. Automated accessibility results do not establish full accessibility compliance. X may require a login or change/remove a post; external destination availability was not certified. Social metadata is present, with a real local 1200 × 630 PNG; actual social-platform unfurling awaits the final hosted URL.

## Updating the site

Edit interface components under `src/`, color/type/layout tokens in `src/styles.css`, and the curated records in `src/posts.json`. Update the capture date and provenance whenever refreshing the figures. Re-run typecheck, build, interaction validation, and export checks.

The original SVG illustration and favicon are in `public/`. `scripts/create-share.mjs` can regenerate the social image from those vector assets with `npm run build:share` and the same Playwright variables above; rebuild afterward. Profile images and quote excerpts remain attributed to their original authors. See [THIRD_PARTY.md](THIRD_PARTY.md).

## Submission path budget

The explicit `.gitignore` budget is zero submitted bytes for generated `node_modules/`, npm/pnpm caches, Vite caches, coverage, and TypeScript build-info files at every nesting level, plus temporary `test/scratch/`. The complete `dist/`, `public/`, source, scripts, docs, manifests, and lockfile remain included. No package archives, vendor registry, submodules, or dependency cache are deliverables. The final export and submission sizes are recorded in the validation report; `npm run check:export` recalculates them locally without reading repository metadata.
