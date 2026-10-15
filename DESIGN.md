# The Pond design system

## Overview

The Pond is a reading and discovery interface for people following Identity.md. Its primary content is a sourced collection of tweets. A dark green palette, lime controls, and a custom vector squad of AI-equipped Pepes establish the requested visual identity. The page is a feed with supporting context, rather than a landing page that delays access to the tweets.

The final implementation lives in `src/App.tsx`, `src/components/PostCard.tsx`, `src/components/Modal.tsx`, and `src/styles.css`. The hero illustration is `public/art/pepe-squad.svg`. The frog mark is `public/favicon.svg`.

## Colors

CSS custom properties in `src/styles.css:1` are the shared source of truth. Palette primitives feed semantic roles; a few component-specific tints remain explicit in the stylesheet.

| Semantic token | Actual value | Role |
| --- | --- | --- |
| `--bg-page` | `#0b140f` | Page and header background |
| `--bg-surface` | `#101d15` | Tweet cards and search field |
| `--bg-raised` | `#16251b` | Intro panel and modal |
| `--bg-hover` | `#1d3022` | Interactive hover surfaces |
| `--text` | `#e5ecdf` | Headings, post quotes, primary text |
| `--text-muted` | `#99ad98` | Metadata and secondary copy |
| `--border` | `#29392b` | Card boundaries and separators |
| `--border-interactive` | `#53674e` | Search/control boundaries |
| `--accent` | `#bbeb8f` | Primary action fill, active controls, selected bookmarks |
| `--accent-ink` | `#17230e` | Text on accent-filled controls |
| `--focus` | `#cef6a7` | Two-pixel focus outline, offset four pixels |

The hero has a `#17261a` surface and `#31432b` border. Building, Ideas, and Culture have restrained green, lavender, and sand label tints, always accompanied by category names. Storage failure uses readable sand text and an explicit explanation. Selected topics use a filled surface plus `aria-pressed`; navigation uses an underline; saved bookmarks use a filled icon and an accessible pressed state. Color is never the only state indicator.

The probe measured all tested text at or above the required WCAG ratio. On the final feed, the lowest measured solid-background pair was 6.68:1. Hero text and artwork composition were also inspected in screenshots; the automated contrast check does not certify every pixel over imagery. The requested dark theme is the only theme.

## Typography

The interface uses locally bundled **Manrope Variable** from the pinned npm package, followed by Manrope, UI sans-serif, system UI, and generic sans-serif. The font dependency emits WOFF2 assets into `dist/assets/`; the export needs no font CDN. Only 400, 600, and 700 are used. Synthesis is disabled; there are no intentional italic styles.

| Token | Size at a 16px root | Use |
| --- | --- | --- |
| `--text-xs` | 12px | Timestamps, counts, source links, compact metadata |
| `--text-sm` | 14px | Author names, context paragraphs, desktop filters |
| `--text-base` | 16px | Post excerpts and inputs; mobile sorting select |
| `--text-lg` | 20px | Feed headings and wordmark |
| `--text-xl` | 28px | Mobile hero, statistics, desktop modal title |
| `--text-display` | 48px | Wide-screen hero title |

Headings use 1.08–1.4 line heights according to role. The mobile hero uses 1.15. Reading text uses 1.6–1.7. Hero tracking is −0.045em on desktop and −0.035em on small screens; other headings use −0.025em or −0.02em. Prose has natural spacing. Post text and context cap their measure at 70ch and wrap long values. No post text or author name is ellipsized. Excerpt ellipses are an intentional quotation boundary, with the original post one action away. Counts use tabular numeric styling.

The social PNG is a separate fixed 1200 × 630 composition generated from the same vector art; its generator uses Arial/sans-serif. It does not add another interface font.

## Layout

The centered page is at most 1184px wide. Wide screens reserve 80px total outside the shell; the header has a separate maximum of 1264px. A flexible feed column and 300px sidebar share a 40px gap. Spaces within components generally follow 4/8px steps, with 12, 16, 20, 24, 28, 32, and 40px values for increasing separation. There are no fixed-height containers for post text.

Implemented content breakpoints:

- **64rem / 1024px:** shell gutters become 24px, sidebar 260px, and grid gap 24px. Post actions may wrap.
- **51rem / 816px:** feed becomes one column; supporting sections form a two-column area below it. The headline becomes 28px and the redundant header X link is hidden.
- **34rem / 544px:** 16px shell gutters, 68px header, approximately 170px hero, compact two-line title, and a cropped illustration at the right. Supporting sections stack. Search and native sorting controls use 16px text. Tweet save/copy controls have 44px targets.
- **23rem / 368px:** the illustration narrows and fades further; post actions use two rows so counts and the original-post link stay readable.

The hero crop affects decoration only. All tweet content and actions remain available. Search and filter controls precede the list; secondary context is a native disclosure beneath each excerpt. At 390 × 844, the first original-post link is on the first screen. The content grid was checked at 320, 390, 540, 820, 1024, and 1440px. A separate 200% root-text-size check at 390px preserved reflow. This was not native browser zoom or an RTL test.

## Elevation & Depth

Surfaces use tone and structural borders, with no card shadows or nested card containers. The hero is one flat surface with vector artwork. Native dialogs sit in the browser top layer over a translucent dark backdrop (`rgb(3 10 5 / .82)`). The transient success notice is fixed near the bottom and contains no action or essential error message. Persistent errors remain in the normal flow.

## Shapes

`--radius-sm` is 8px for controls, `--radius-md` is 12px for cards, and `--radius-lg` is 18px for the hero and modal. Filter controls use 6px corners; numeric counters use 5px. Avatars are circular. Images have a subtle one-pixel translucent white inset outline. Artwork is clipped only at the mobile decorative boundary.

## Components

**Application shell and feed — `src/App.tsx`.** Includes semantic header, navigation, one main landmark, aside, and footer. `#discover` and `#saved` select the view. Clicking the logo resets filters. A skip link reaches the main region without changing the saved view. The heading is focusable programmatically after removing a saved item. No history API server rewrites are needed.

**Search/filter/sort controls.** Native labeled search and select elements, native buttons with pressed states, and a live result count. Search is immediate and includes author names/handles, excerpts, summaries, and topics. `/` focuses search except while editing or in a modal. Clearing or changing a filter resets the six-item presentation limit. Empty results offer one clear recovery action.

**PostCard — `src/components/PostCard.tsx`.** Accepts a sourced `post`, visible `rank`, saved/copied states, and save/copy/source callbacks. Author links and X status links are native anchors. Engagement counts are read-only. Native `details` exposes editorial context. Bookmark actions update local storage; copying writes the exact original URL. Icon-only buttons have accessible names and fixed target dimensions. Full excerpts remain selectable.

**Modal — `src/components/Modal.tsx`.** Shared by About, source details, and manual-copy recovery. Native `dialog.showModal()` provides focus containment and background inertness. Escape, the close button, and a click outside the dialog close it. Focus returns to the initiating control. The body stops scrolling while the dialog is open; the dialog itself scrolls within its viewport cap.

**Buttons and links.** `.button-primary` is the lime primary action. `.button` is a bordered secondary control. `.text-button` is a supporting action. `.icon-button` is the standard copy/save/help/close pattern. Hover colors and 120ms transitions are enabled where appropriate; press scaling is 0.96 and occurs only when reduced motion is not requested. There are no load-time or endless animations.

**Persistence and feedback.** Bookmark IDs are validated against the dataset. Corrupt/unavailable storage is caught. Quota or privacy restrictions retain bookmarks for the visit and display that limitation. A failed clipboard write opens a selectable URL instead of claiming success. Transient successful actions use a polite status region; the count is a separate polite region. All data is bundled, so there is no simulated loading, live counter, or networking state.

## Do's and Don'ts

- Reuse semantic color and type tokens and the existing page shell before adding new values.
- Keep tweet reading and original-post access ahead of supporting community content.
- Use the primary fill sparingly; use pressed states and labels for filters and saved items.
- Keep counts sourced and dated. Update the capture date with the records; do not silently imply live data.
- Preserve native links, disclosures, inputs, selects, and dialogs. Do not attach fake engagement actions to static counts.
- Preserve local assets and relative URLs in the static export.
- For another view, reuse the shell, heading, controls, empty-state pattern, and PostCard; add a hash view only if it serves an actual new task.

The six-domain review, corrected findings, actual checks, and unperformed checks are recorded in `artifacts/validation.md`. Guidance attribution and retained license texts are listed in `THIRD_PARTY.md`.
