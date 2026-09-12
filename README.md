# thorvg.home

ThorVG's new homepage — source and design notes.

## Stack

Plain HTML/CSS/JS. No framework (Astro/Next.js/React/Vue were considered but
ruled out — the site doesn't need complex UI, and a framework would add a
learning/build-tooling cost with no real benefit here).

## Structure

Each top-level nav item is its own static HTML page (not a section on one
page), built up incrementally:

| Page      | File            | Notes                          |
|-----------|-----------------|---------------------------------|
| Home      | `index.html`    | Landing page                    |
| About     | `about.html`    | TODO                             |
| Showcase  | `showcase.html` | TODO                             |
| Tutorial  | `tutorial.html` | TODO                             |
| APIs      | `apis.html`     | TODO                             |
| DeepWiki  | external link   | URL TBD                         |
| Blogs     | `blogs.html`    | TODO                             |
| Releases  | external link   | URL TBD                         |
| Playground| `playground.html` | TODO                          |
| View      | `view.html`     | TODO                             |

```
thorvg.home/
├── index.html
├── assets/
│   ├── css/style.css   # design tokens + shared styles
│   ├── js/main.js
│   └── images/
└── .claude/launch.json # local preview server config
```

## Design

- **Theme**: dark, single accent color (violet). Tokens defined as CSS
  custom properties in `assets/css/style.css` (`:root`) — reuse these
  instead of hardcoding colors/spacing on new pages.
- **Typography**:
  - Headings (`h1`–`h3`, logo): **Montserrat**
  - Body text: **Noto Sans**
  - Korean text always renders in **Noto Sans KR** — this isn't a separate
    rule to maintain, it falls out of the font stack automatically since
    neither Montserrat nor Noto Sans ship Hangul glyphs, so the browser
    falls back to Noto Sans KR wherever Korean characters appear.
  - Loaded via Google Fonts in each page's `<head>`.

## Local preview

A dev server config lives at `.claude/launch.json` (`python3 -m http.server`
on port 4173) — used to preview pages with working relative asset paths
instead of opening files directly via `file://`.

## Open items

- Confirm DeepWiki and Releases target URLs.
- Build out remaining pages (About, Showcase, Tutorial, APIs, Blogs,
  Playground, View).
