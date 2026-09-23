# Typography Reference

이 문서는 ThorVG 홈페이지 전반에 적용된 폰트 패밀리, 텍스트 크기, font-weight를 한눈에 파악하기 위한 표입니다. (`thorvg-view/` 임베드 위젯은 메인 사이트와 별도의 디자인 시스템을 사용하므로 문서 끝에 따로 정리했습니다.)

## 전역 폰트 변수 (`assets/css/common.css`)

| 변수 | 값 | 용도 |
|---|---|---|
| `--font-heading` | `"Poppins", "Noto Sans KR", -apple-system, BlinkMacSystemFont, sans-serif` | `h1`~`h4` |
| `--font-body` | `"Google Sans Flex", "Noto Sans KR", -apple-system, BlinkMacSystemFont, sans-serif` | `body` 및 본문 텍스트 |
| `--font-mono` | `"SF Mono", SFMono-Regular, ui-monospace, Consolas, "Liberation Mono", Menlo, monospace` | 코드 블록, 파일 상세값 등 |

---

## 공통 (`common.css`)

| 요소 | Font | Size | Weight |
|---|---|---|---|
| `body` | font-body | 기본값 | 400 |
| `h1`~`h4` | font-heading | 요소별 상이 | 요소별 상이 |
| `.main-nav a` | 상속 | 0.8rem | 300 |
| `.main-nav a.active` | 상속 | 0.8rem | 500 |
| `.btn` | 상속 | 0.95rem | 600 |
| `.page-content h1` | font-heading | `clamp(1.75rem, 3vw, 2.5rem)` | 600 |
| `.page-content .placeholder-text` | 상속 | 0.95rem | 400(미지정) |
| `.page-content .page-lede` | 상속 | 0.95rem | 300 |
| `.playground-card-tag` | 상속 | 0.68rem | 400 |
| `.code-block code` | font-mono | 0.8rem | 400 |
| `.site-footer` | 상속 | 0.8rem | 300 |

---

## 페이지별 `h1` 적용 현황

| 페이지 | 적용 셀렉터 | Size | Weight |
|---|---|---|--------|
| [index.html](index.html:38) `Thor Vector Graphics` | `.hero h1` (`index.css`) | `clamp(2rem, 4vw, 3rem)` | 700    |
| [about.html](about.html:39), [showcase.html](showcase.html:38), [tutorial.html](tutorial.html:39) | `.docs-content h1` (`docs.css`) | `clamp(1.75rem, 3vw, 2.5rem)` | 600    |
| [api.html](api.html:37), [playground.html](playground.html:39), [blogs.html](blogs.html:38) | `.page-content h1` (`common.css`) | `clamp(1.75rem, 3vw, 2.5rem)` | 600    |
| [blog-post.html](blog-post.html:42) (동적 제목) | `.blog-post-title` (`blog-post.css`) | `clamp(2rem, 5vw, 3.2rem)` | 500    |
| [blog-post.html](blog-post.html:45) 게시글 본문 중 `# ` (마크다운, `blog-post/*.md`를 JS가 런타임 렌더링) | `.blog-post-body h1` (`blog-post.css`, font-size 미지정 → 브라우저 기본값 약 2em) | ~2.125rem(추정) | 500    |

---

## 페이지별 `h2` 적용 현황

| 페이지 | 위치/용도 | 적용 셀렉터 | Size | Weight |
|---|---|---|---|---|
| [index.html:39](index.html:39) `Open · Lightweight · Fast · Everywhere` | 히어로 태그라인 | `.hero-subtitle` (`index.css`) | 1.35rem | 600 |
| [about.html](about.html:40) (About ThorVG, Design Principles, Rendering Engine, Platforms & Formats, Community) | 섹션 제목 | `.docs-content h2` (`docs.css`) | 1.4rem | 600 |
| [showcase.html](showcase.html:40) (In Practice, ThorVG Demo) | 섹션 제목 | `#in-practice`, `#thorvg-demo` (`showcase.css`, `.docs-content h2` 오버라이드) | 1.2rem | 600 |
| [tutorial.html](tutorial.html:42) (Build and install, Basic Programming, More examples) | 섹션 제목 | `.docs-content h2` (`docs.css`) | 1.4rem | 600 |
| [playground-example.html:44](playground-example.html:44) `#example-title` | 예제 타이틀 | `.example-header-top h2` (`playground-example.css`) | `clamp(1rem, 1.4vw, 1.15rem)` | 500 |
| [blog-post.html](blog-post.html:45) 게시글 본문 중 `## ` (마크다운, `blog-post/*.md`를 JS가 런타임 렌더링) | 섹션 제목 | `.blog-post-body h2` (`blog-post.css`) | 1.725rem | 500 |

---

## 페이지별 `h3` 적용 현황

| 페이지                                                                                          | 위치/용도 | 적용 셀렉터 | Size | Weight |
|----------------------------------------------------------------------------------------------|---|---|---|---|
| [showcase.html](showcase.html:41) (Camtasia, Canva iOS, dotLottie, Espressif, ..., Other Projects, Thor Janitor) | 카드/서브섹션 제목 | `.showcase-row-title` (`showcase.css`, `.docs-content h3` 오버라이드) | `clamp(1.5rem, 2.4vw, 1.8rem)` | 600 |
| [tutorial.html](tutorial.html:102) (Initialization, Shape, Path, Fill, Stroke, ...)          | 서브섹션 제목 | `.docs-content h3` (`docs.css`) | 1.05rem | 600 |
| [about.html](about.html:132) (LightWeight Design, Broad Portability, CPU Rasterization, ...) | 서브섹션 제목 | `.docs-content h3` (`docs.css`) | 1.05rem | 600 |
| [blog-post.html](blog-post.html:45) 게시글 본문 중 `### ` (마크다운, `blog-post/*.md`를 JS가 런타임 렌더링)    | 서브섹션 제목 | `.blog-post-body h3` (`blog-post.css`) | 1.3rem | 500 |

---

## 페이지별 `h4` 적용 현황

| 페이지 | 위치/용도 | 적용 셀렉터 | Size | Weight |
|---|---|---|---|---|
| [tutorial.html](tutorial.html:59) (Build with Visual Studio, Build with Xcode, Install via NPM, Install via CDN) | 세부 항목 제목 | `.docs-content h4` (`docs.css`) | 0.8rem | 600 |
| [about.html](about.html:190) (Performance Overview ×2, Expressions) | 세부 항목 제목 | `.docs-content h4` (`docs.css`) | 0.8rem | 600 |

---

## 홈 (`index.css`)

| 요소 | Font | Size | Weight |
|---|---|---|---|
| `.hero-body` | 상속 | 1rem | 300 |

---

## 서브페이지 공통 본문 `.docs-content` (`docs.css`) — About/Showcase/Tutorial/API 등에서 재사용

| 요소 | Font | Size | Weight |
|---|---|---|---|
| `p`, `li` | 상속 | 0.9rem | 300 |
| `p strong`, `li strong` | 상속 | 0.9rem | 500 |
| `p code`, `li code`, `blockquote code` | font-mono | 0.85rem | 400 |
| `figcaption` | 상속 | 0.8rem | 300 |
| `figcaption.caption-text` | 상속 | 0.9rem | 300 |
| `.docs-toc-list a` | 상속 | 0.78rem | 300 |
| `.docs-toc-label` | 상속 | 0.75rem | 600 |

---

## About 전용 (`about.css`)

| 요소 | Font | Size | Weight |
|---|---|---|---|
| `p.callout-title` | 상속 | 0.875rem | 400 |
| `.callout-link` | 상속 | 0.75rem | 500 |
| `p.partner-name` | 상속 | 1rem | 500 |
| `table.data-table` | `"Inter", var(--font-body)` | 0.78rem | th 500 / td 300 |
| `.perf-chart` 텍스트(SVG) | `"Inter", var(--font-body)` | 10.5~12px | 미지정 |

---

## Showcase 전용 (`showcase.css`)

`.docs-content h2`/`h3` (`docs.css`)를 이 페이지에서만 오버라이드합니다.

| 요소 | Font | Size | Weight | 비고 |
|---|---|---|---|---|
| `#in-practice`, `#thorvg-demo` | 상속 | 1.2rem | 600 | `text-transform: uppercase` (In Practice 전체, ThorVG Demo는 `.uppercase`로 감싼 "Demo"만) |
| `.showcase-row-title` (h3) | 상속 | `clamp(1.5rem, 2.4vw, 1.8rem)` | 600 | |
| `.showcase-row-desc` | 상속 | 0.85rem | 300 | |

---

## Blogs 목록 (`blogs.css`)

| 요소 | Font | Size | Weight |
|---|---|---|---|
| `.blog-filter-tabs a` | 상속 | 0.875rem | 400 |
| `.blog-list-category` | 상속 | 0.875rem | 500 |
| `.blog-list-date` | 상속 | 0.875rem | 300 |
| `.blog-list-title` | font-body | 1.075rem | 400 |
| `.blog-list-excerpt` | 상속 | 0.875rem | 300 |
| `.blog-empty-state` | 상속 | 0.9rem | 300 |

---

## Blog 상세 (`blog-post.css`)

| 요소 | Font | Size | Weight |
|---|---|---|---|
| `.blog-post-meta` | 상속 | 0.875rem | 400 |
| `.blog-post-body` (기본) | 상속 | 1.0625rem | 400 |
| `.blog-post-body p` | 상속 | 1.0625rem | 300 |
| `.blog-post-body strong` | 상속 | 1.0625rem | 500 |
| `.blog-post-body li` | 상속 | 1.0625rem | 300 |
| `.blog-post-body blockquote` | 상속 | 0.95rem | 미지정 |
| `.blog-post-body figcaption` | `"Inter", var(--font-body)` | 13px | 300 |
| `.blog-post-body :not(pre) > code` | font-mono | 0.85em | 미지정 |
| `.blog-post-body table` | 상속 | 0.9rem | th 500 |
| `.blog-post-tags li` | 상속 | 0.875rem | 400 |
| `.blog-post-writer-label` | font-body | 0.875rem | 400 |
| `.blog-post-writer-name` | 상속 | 0.875rem | 400 |
| `.blog-post-back` | 상속 | 0.875rem | 300 |

---

## Tutorial 전용 (`tutorial.css`)

| 요소 | Font | Size | Weight |
|---|---|---|---|
| `.lang-tab` | font-body | 0.8rem | 400 |
| `.lang-tabs-header .lang-tab` | font-body | 0.8rem(상속) | 400 |
| `.example-window-address` | font-mono | 0.7rem | 미지정 |

---

## Playground 목록 (`playground.css`)

| 요소 | Font | Size | Weight |
|---|---|---|---|
| `.btn-pill` | 상속 | 0.9rem | 400 |
| `.filter-chip` | font-body | 0.78rem | 300 |
| `.playground-card-title` | 상속 | 1rem | 500 |
| `.playground-card-desc` | 상속 | 0.85rem | 300 |
| `.playground-card-link` | 상속 | 0.78rem | 400 |

---

## Playground 예제 뷰어 (`playground-example.css`)

| 요소 | Font | Size | Weight |
|---|---|---|---|
| `.example-back-link` | 상속 | 0.85rem | 300 |
| `.example-description` | 상속 | 12px | 미지정 |
| `.example-code-panel-header-label` | 상속 | 0.82rem | 400 |
| `.example-zoom-popup` | 상속 | 0.7rem | 500 |
| `.example-copy-toast` / `.example-preview-toast` | font-body | 0.85rem | 500 |
| `.example-auto-run-toggle` | 상속 | 11px | 400 |
| `.example-copy-code-btn` | font-body | 0.75rem | 500 |
| `.example-copy-code-label` | 상속 | 11px | 400 |
| `.example-pagination-link` | 상속 | 0.8rem | 미지정 |
| `.example-pagination-label` | 상속 | 0.7rem | 미지정 |
| `.example-pagination-title` | 상속 | 0.9rem | 400 |
| `.example-pagination-count` | 상속 | 0.78rem | 300 |

---

## View 페이지 (`view.css`)

| 요소 | Font | Size | Weight |
|---|---|---|---|
| `.view-intro-text` | 상속 | 0.9rem | 300 |
| `.view-preview-tab` | font-body | 0.8rem | 400 |
| `.view-history-entry` | font-mono | 0.7rem | 미지정 |
| `.view-file-detail-row` | 상속 | 0.78rem | 미지정 |
| `.view-file-detail-value` | 상속 | 상속 | 300 |
| `.view-file-entry` | 상속 | 0.72rem | 300 |
| `.view-canvas-stats` | font-mono | 0.65rem | 미지정 |
| `.view-canvas-placeholder` | 상속 | 0.85rem | 200 |
| `.view-canvas-status span` | 상속 | 0.69rem | 400 |
| `.view-range-header` | 상속 | 0.78rem | 미지정 |
| `.view-range-header label`, `.view-select-control label`, `.view-control-label` | 상속 | 0.78rem | 300 |
| `.view-range-header output`, `.view-files-empty` | 상속 | 0.78rem | 300 |
| `.view-select-control select` | 상속(`font-family: inherit`) | 0.7rem | 300 |
| `.view-upload-buttons/.view-export-buttons button` | 상속 | 0.7rem | 300 |

---

## `thorvg-view/` 임베드 위젯 (`thorvg-view/style.css`) — 별도 디자인 시스템

메인 사이트와 독립된 컴포넌트로, 자체 폰트 변수를 사용합니다.

| 변수 | 값 |
|---|---|
| `--font-sans` | `"Open Sans", 'Noto Mono', 'DejaVu Sans Mono', monospace` |
| `--font-mono` | `"JetBrains Mono", Roboto Mono, monospace` |

| 요소(대략적 라인) | Font | Size | Weight |
|---|---|---|---|
| L251 (`p.ctrl-title`) | font-sans | 0.85rem | 700 |
| L263 | font-sans | 0.9rem | 600 |
| L280 | 상속 | 0.875rem | — |
| L287 | 상속 | — | 600 |
| L375~376 | 상속 | 0.875rem | 600 |
| L408~413 | font-sans | 0.8rem | 600 |
| L420~421, L459~460 | 상속 | 1.05rem | 400 |
| L465~466 | 상속 | 0.8rem | 600 |
| L532~534 | font-sans | 1.15rem | 500 |
| L599~600 | font-mono | 12px | — |
| L675~676 | font-sans | 13px | — |
| L709~710 | 상속 | 18px | 600 |
| L735~736 | 상속 | 14px | 500 |
| L744~745 | 상속 | 15px | 500 |
| L771~772 | font-sans | 16px | — |
| L801~802 | 상속 | 14px | 500 |
| L849~851, L896~898 | font-sans | 1rem | 500 |

> ⚠️ [style.css:511](thorvg-view/style.css:511)에 `font-weight: var(--font-sans);`가 있습니다. weight 속성에 폰트 변수를 넣은 오타로 보이며, 유효하지 않은 값이라 브라우저가 무시합니다.
