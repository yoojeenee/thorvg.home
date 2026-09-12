# thorvg.home

ThorVG's new homepage — source and design notes.

## Stack

Plain HTML/CSS/JS. No framework (Astro/Next.js/React/Vue were considered but
ruled out — the site doesn't need complex UI, and a framework would add a
learning/build-tooling cost with no real benefit here).

## Structure

Each top-level nav item is its own static HTML page (not a section on one
page), built up incrementally:

| Page      | File               | Notes                                         |
|-----------|--------------------|------------------------------------------------|
| Home      | `index.html`       | Landing page                                    |
| About     | `about.html`        | Section frame done (headings only, no copy yet) |
| Showcase  | `showcase.html`     | Section frame done (headings only, no copy yet) |
| Tutorial  | `tutorial.html`     | Section frame done (headings only, no copy yet) |
| APIs      | `apis.html`         | TODO                                            |
| DeepWiki  | external link       | https://deepwiki.com/thorvg/thorvg              |
| Blogs     | `blogs.html`        | TODO                                            |
| Releases  | external link       | https://github.com/thorvg/thorvg/releases       |
| Playground| `playground.html`   | TODO                                            |
| View      | `view.html`         | TODO                                            |

```
thorvg.home/
├── index.html
├── assets/
│   ├── css/style.css   # design tokens + shared styles
│   ├── js/main.js      # mobile nav toggle
│   ├── icons/          # UI icons (menu, close, external-link — Font Awesome Free)
│   └── images/         # logo, etc.
└── .claude/launch.json # local preview server config
```

## Design

- **Theme**: light, single accent color (violet, used sparingly — e.g. the
  primary button). Tokens defined as CSS custom properties in
  `assets/css/style.css` (`:root`) — reuse these instead of hardcoding
  colors/spacing on new pages. All body/muted text is pure black
  (`--color-text` / `--color-text-muted` both `#000000`) — no grays in
  running text.
- **Typography**:
  - Headings (`h1`–`h3`) and section titles: **Poppins**
  - Body text (nav, paragraphs, buttons): **Google Sans Flex** (variable
    font, free/open — SIL OFL — despite the "Google" name; not the same as
    the proprietary "Google Sans" used in Google's own products)
  - Korean text always renders in **Noto Sans KR** — this isn't a separate
    rule to maintain, it falls out of the font stack automatically since
    neither Poppins nor Google Sans Flex ship Hangul glyphs, so the browser
    falls back to Noto Sans KR wherever Korean characters appear.
  - Loaded via Google Fonts in each page's `<head>`. `--font-heading` and
    `--font-body` are kept as separate CSS variables (even when they
    temporarily point to the same family) so either can be swapped
    independently later.
- **Navigation**: horizontal nav bar above 860px width; below that, it
  collapses into a hamburger button that opens a right-aligned dropdown
  (slide-down animation). External links (DeepWiki, Releases) get a small
  arrow icon that sits outside the text's own right edge so link labels
  still align with the rest of the nav.
- **Docs pages** (About / Showcase / Tutorial): a 2-column layout — main
  content on the left, a sticky "On this page" anchor list on the right
  (`.docs-layout` / `.docs-content` / `.docs-toc` in `style.css`). Below
  960px both collapse to a single column. Sub-level entries in the "On this
  page" list are indented rather than color-differentiated.

### Breakpoints

Only two `@media (max-width: ...)` rules exist in `style.css`; no other
widths should be introduced without a reason:

| Width    | What changes                                                          |
|----------|-------------------------------------------------------------------------|
| `860px`  | Header nav switches from the horizontal bar to the hamburger button + dropdown (`.menu-toggle` / `.main-nav`). Logo also shrinks slightly to balance the button. |
| `960px`  | Docs pages (`.docs-layout`) drop from 2 columns to 1 — the "On this page" sidebar (`.docs-toc`) is hidden and content goes full-width. |

These two are independent (960px doesn't affect the nav, 860px doesn't
affect the docs layout), so between 861px–959px a docs page shows the full
horizontal nav *and* the 2-column layout, while below 860px it shows the
hamburger *and* (until 960px) still the 2-column docs layout.

## Local preview

A dev server config lives at `.claude/launch.json` (`python3 -m http.server`
on port 4174) — used to preview pages with working relative asset paths
instead of opening files directly via `file://`.

## Open items

- Write actual body copy for About / Showcase / Tutorial (currently just
  heading structure, no paragraph content).
- Build out remaining pages (APIs, Blogs, Playground, View).
