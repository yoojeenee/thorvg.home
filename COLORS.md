# Color Reference

이 문서는 ThorVG 홈페이지 전반에 적용된 색상(텍스트·배경·테두리 등)을 한눈에 파악하기 위한 표입니다. (`thorvg-view/` 임베드 위젯은 메인 사이트와 별도의 디자인 시스템을 사용하므로 문서 끝에 따로 정리했습니다.)

## 전역 컬러 변수 (`assets/css/common.css`)

| 변수 | 값 | 용도 |
|---|---|---|
| `--color-bg` | `#ffffff` | 페이지/카드 배경, 어두운 배경 위 흰 텍스트 |
| `--color-surface` | `#f5f5f7` | 카드·코드블록 등 표면 배경 |
| `--color-text` | `#000000` | 기본 본문·제목 텍스트 |
| `--color-text-muted` | `rgba(26, 26, 26, 0.5)` | 보조/캡션 텍스트, 헤더 메뉴 활성 상태, `docs-toc-float-list` 비활성 링크 |
| `--color-accent` | `#6c4cf0` | 버튼 등 강조 배경 |
| `--color-accent-strong` | `#5a3ce0` | accent hover |
| `--color-border` | `#e3e5ea` | 테두리, 구분선 |
| `--color-link` | `#3b82f6` | 본문/TOC/캡션 링크, 상태 배지 |
| `--color-placeholder` | `#707070` | View 캔버스 placeholder 텍스트 (라이트) |
| `--color-placeholder-dark` | `#5b6f7b` | View 캔버스 placeholder 텍스트 (다크) |

> 사이트 전역에 dark-mode 토큰 체계는 없습니다. `--color-placeholder-dark`처럼 다크 배경용 값이 필요한 경우 개별적으로 `-dark` 접미사 변수를 추가하는 방식을 쓰고 있습니다.

---

## 공통 (`common.css`)

| 요소 | 속성 | 값 | 용도 |
|---|---|---|---|
| `body` | background / color | `--color-bg` / `--color-text` | 페이지 기본 |
| `.site-header`, `.main-nav` | background / border-bottom | `--color-bg` / `--color-border` | 헤더 |
| `.main-nav a` | color | `--color-text` | 기본 |
| `.main-nav a:hover` | color | `#aaaaaa` | hover 페이드 |
| `.main-nav a.active`, `.nav-dropdown-trigger.active` | color | `--color-text-muted` | 활성(연회색, bold 아님) |
| `.menu-toggle` | background | `--color-bg` | 모바일 메뉴 버튼 |
| `.btn-primary` | background / color | `--color-accent` / `#fff` | 기본 버튼 |
| `.btn-primary:hover` | background | `--color-accent-strong` | hover |
| `.btn-secondary` | border / color | `--color-text` | 보조 버튼 |
| `.btn-secondary:focus-visible` | background / color | `--color-text` / `--color-bg` | 포커스 |
| `.page-content .placeholder-text` | color | `--color-text` | 준비중 문구 |
| `.page-content .page-lede` | color | `--color-text` | 리드 문단 |
| `.page-content .page-lede a` | color | `--color-link` | 리드 문단 링크 |
| `.page-content .page-lede a:hover` | color | `#aaaaaa` | hover |
| `.playground-card-tag` | color / background | `--color-text-muted` / `--color-surface` | 태그 칩 |
| `.code-block` | background / border | `--color-surface` / `--color-border` | 코드블록 |
| `.code-block code` | color | `--color-text` | 코드 텍스트 |
| `.site-footer` | border-top / color | `--color-border` / `--color-text` | 푸터 |

---

## About 전용 (`about.css`)

| 요소 | 속성 | 값 | 비고 |
|---|---|---|---|
| `.callout-card`, `.partner-card`, `.feature-grid .media-placeholder` | border | `--color-border` | 카드 테두리 |
| `.partner-card`, `.partner-logo`, `.feature-grid .media-placeholder` | background | `--color-bg` / `--color-surface` | 카드 배경 |
| `.docs-content p.callout-title`, `p.partner-name`, `table.data-table th/td` | color | `--color-text` | 본문 텍스트 |
| `.callout-link` | color | `#b3273a` | 강조 라벨(빨강 계열, 토큰화 안 됨) |
| `.callout-link:hover` | color | `#aaaaaa` | hover 페이드 |
| `.feature-grid img.bg-white` | background | `#ffffff` | 이미지 여백용 흰 배경 |
| `.perf-chart-legend/ylabels/xlabels text` | fill | `--color-text` | SVG 차트 텍스트 |
| `.perf-chart-grid line` | stroke | `--color-border` | 차트 그리드선 |
| `.perf-chart-axis line` | stroke | `#c9ccd3` | 차트 축선(토큰화 안 됨) |
| `table.data-table thead` | border-bottom | `#d6d7db` | 표 헤더 구분선 |
| `table.data-table tbody tr` | border-bottom | `#ececef` | 표 행 구분선 |

---

## 서브페이지 공통 본문 `.docs-content` (`docs.css`) — About/Showcase/Tutorial 등에서 재사용

| 요소 | 속성 | 값 | 비고 |
|---|---|---|---|
| `.docs-toc-list a`, `.docs-toc-label`, `p`, `li`, `li strong`, `figcaption.caption-text` | color | `--color-text` | 기본 텍스트 |
| `.docs-toc-list a:hover`, `li::marker`, `figcaption a:hover`, `blockquote a:hover` | color | `#aaaaaa` | hover / 마커 |
| `.docs-toc-float-list a` | color | `--color-text-muted` | 기본(비활성) |
| `.docs-toc-float-list a:hover` | color | `rgba(26, 26, 26, 0.7)` | hover(중간 진하기) |
| `.docs-toc-float-list a.is-active`, `.docs-toc-float-list a.is-active:hover` | color | `#1a1a1a` | 활성 |
| `.docs-content blockquote p`, `figcaption` | color | `--color-text-muted` | 보조 텍스트 |
| `blockquote a`, `figcaption a` | color | `--color-link` | 인용/캡션 내 링크 |
| `blockquote code` | background / box-shadow | `rgba(0,0,0,0.04)` / `rgba(0,0,0,0.08)` | 인라인 코드 배경 |
| `.docs-toc-list` | border-left | `#ededed` | TOC 구분선(토큰화 안 됨) |
| `blockquote` | border-left | `#cdcdcd` | 인용구 좌측선(토큰화 안 됨) |
| `figure img/video`, `.media-placeholder` | border | `--color-border` | 미디어 테두리 |
| `.media-placeholder` | background | `--color-surface` | 자리표시자 배경 |

---

## 홈 (`index.css`)

| 요소 | 속성 | 값 |
|---|---|---|
| `.hero-subtitle`, `.hero-body` | color | `--color-text` |

---

## Showcase 전용 (`showcase.css`)

| 요소 | 속성 | 값 |
|---|---|---|
| `#thorvg-demo` | border-top | `--color-border` |
| `.showcase-row-title`, `.showcase-row-desc` | color | `--color-text` |
| `.showcase-row-media` | background | `--color-surface` |

---

## Blogs 목록 (`blogs.css`)

| 요소 | 속성 | 값 | 비고 |
|---|---|---|---|
| `.blog-filter-tabs a` | color | `--color-text-muted` | 기본(비활성) |
| `.blog-filter-tabs a:hover` | color | `#aaaaaa` | hover |
| `.blog-filter-tabs a.is-active`, `.blog-list-category`, `.blog-list-title`, `.blog-list-excerpt` | color | `--color-text` | 활성/본문 |
| `.blog-list-date`, `.blog-empty-state` | color | `--color-text-muted` | 보조 텍스트 |
| `.blog-list-item` | border-bottom | `--color-border` | 구분선 |
| `.blog-list-item:hover` | border-bottom-color | `--color-text` | hover |

---

## Blog 상세 (`blog-post.css`)

| 요소 | 속성 | 값 | 비고 |
|---|---|---|---|
| `.blog-post-meta time`, `.blog-post-body a`, `.code-copy-btn` | color | `--color-text` | 본문/링크 |
| `.blog-post-body a:hover`, `.blog-post-back:hover` | color | `#aaaaaa` | hover |
| `.blog-post-meta span`, `.blog-post-body blockquote`, `figcaption`, `.blog-post-writer-label` | color | `--color-text-muted` | 보조 텍스트 |
| `blockquote`, `hr`, `td` | border | `--color-border` | 구분선 |
| `:not(pre) > code`, `.blog-post-info-inner` | background | `--color-surface` | 코드/정보 박스 배경 |
| `.blog-post-tags li` | background | `rgba(0, 0, 0, 0.05)` | 태그 칩 배경(토큰화 안 됨) |

---

## Tutorial 전용 (`tutorial.css`)

| 요소 | 속성 | 값 | 비고 |
|---|---|---|---|
| `.lang-tab`, `.playground-card:hover .playground-card-link`(공용) | color | `--color-text-muted` | 비활성 탭 |
| `.lang-tab.is-active`, `.code-copy-btn`, `.lang-tabs-header .lang-tab.is-active` | color / border-bottom-color | `--color-text` | 활성 탭 |
| `.lang-tabs`, `.lang-tabs-header`, `.example-window` 등 | border | `--color-border` | 테두리 |
| `.lang-toggle`, `.example-window-header` | background | `#ededed` / `#fafafa` | 배경(토큰화 안 됨) |
| `.example-window-address` | color | `#8f8f8f` | 주소창 텍스트(토큰화 안 됨) |
| `.example-window-dots i:nth-child(1/2/3)` | background | `#ff5f57` / `#febc2e` / `#28c840` | macOS 신호등 아이콘(의도적 고정색) |

---

## Playground 목록 (`playground.css`)

| 요소 | 속성 | 값 | 비고 |
|---|---|---|---|
| `.btn-pill`, `.filter-chip.is-active` | background / color | `--color-text` / `--color-bg` | 반전 버튼 |
| `.btn-pill:hover` | background | `#2b2b2b` | hover(토큰화 안 됨) |
| `.filter-chip` | background / color | `#ededed` / `--color-text` | 필터 칩 |
| `.filter-chip:hover` | background | `#e2e2e2` | hover(토큰화 안 됨) |
| `.playground-card` | border / background | `--color-border` / `--color-bg` | 카드 |
| `.playground-card:hover` | border-color | `#c4c4c4` | hover(토큰화 안 됨) |
| `.playground-card-title` | color | `--color-text` | 제목 |
| `.playground-card-desc`, `.playground-card:hover .playground-card-link` | color | `--color-text-muted` | 설명/hover |
| `.playground-card-link` | color | `#0d0d0d` | 기본(토큰화 안 됨, 사실상 검정) |

---

## Playground 예제 뷰어 (`playground-example.css`)

| 요소 | 속성 | 값 | 비고 |
|---|---|---|---|
| `.example-back-link`, `-header-label`, `-pagination-link`, `-pagination-count`, `-auto-run-toggle`, `.example-copy-code-btn` | color | `--color-text` | 기본 텍스트 |
| `.example-back-link:hover`, `.example-pagination-link:hover` | color | `#aaaaaa` | hover |
| `.example-pagination-title` | color | `--color-text-muted` | 보조 텍스트 |
| `.example-code-panel`, `-header`, `-preview`, `.example-canvas` | border / background | `--color-border` / `--color-bg` | 패널 |
| `.example-zoom-popup`, `.example-copy-toast`, `.example-preview-toast` | background / color | `--color-text` / `--color-bg` | 토스트(반전) |
| `.example-copy-code-btn:hover` | background | `--color-surface` | hover |
| `.example-canvas-preview`, `.example-code-panel .code-block` | background | `#f1f1f1` | 캔버스 배경(토큰화 안 됨) |
| `.example-canvas.is-dark` | background | `#1a1a1a` | 다크 캔버스(토큰화 안 됨) |
| range input thumb/track | background / border / box-shadow | `#e5e5e5`, `#ffffff`, `#ececec`, `rgba(0,0,0,0.25)` | 슬라이더(토큰화 안 됨) |

---

## View 페이지 (`view.css`)

| 요소 | 속성 | 값 | 비고 |
|---|---|---|---|
| `.view-intro-text`, `.view-file-detail-label`, `.view-range-header`, `.view-control-label` 등 | color | `--color-text` | 기본 텍스트 |
| `.view-preview-tab`, `.view-file-detail-value`, `.view-file-entry`, `.view-files-empty` | color | `--color-text-muted` | 보조 텍스트 |
| `.view-preview-tab.is-active` | color / border-bottom-color | `--color-text` | 활성 탭 |
| `.view-canvas-placeholder` | color | `--color-placeholder` | 캔버스 안내 문구(라이트) |
| `.view-canvas.is-dark .view-canvas-placeholder` | color | `--color-placeholder-dark` | 안내 문구(다크) |
| `.view-canvas-status span` | color / background | `--color-link` / `rgba(59,130,246,0.09)` | 상태 배지 |
| `.view-canvas-stats` | color / background | `#7fff6b` / `rgba(0,0,0,0.85)` | FPS 통계 오버레이(토큰화 안 됨) |
| `.view-history-entry` | color | `#d0d0d0` | 히스토리 로그(토큰화 안 됨) |
| `.view-file-entry-size`, `.view-file-entry-remove` | color | `#8a8a8a` | 아이콘/보조(토큰화 안 됨) |
| `.view-card`, 버튼류(`.view-progress-buttons`, `.view-upload/export-buttons`), `select` | background | `#ffffff` | 흰 배경(토큰화 안 됨, `--color-bg`와 동일값) |
| `.view-canvas`, `-preview-tabs-header` | background | `#f8f8f8` / `#ffffff` | 캔버스 영역 |
| `.view-canvas.is-dark`, `.view-canvas.is-dark .view-preview-tabs-header` | background | `#1b2124` | 다크 캔버스(토큰화 안 됨) |
| `.view-canvas.is-dark .view-preview-tab` | color | `#9a9a9a` | 다크 탭(토큰화 안 됨) |
| `.view-canvas.is-dark .view-preview-tab.is-active` | color / border-bottom-color | `#f6f6f6` | 다크 활성 탭(토큰화 안 됨) |
| 다수 요소 | border | `rgba(0, 0, 0, 0.12)` | 캔버스/컨트롤 테두리(토큰화 안 됨) |
| hover 배경류 | background | `rgba(0,0,0,0.06~0.08)`, `rgba(255,255,255,0.1~0.15)` | 아이콘 버튼 hover(라이트/다크) |

---

## 반복적으로 쓰이지만 아직 토큰화되지 않은 값 (정리 후보)

이번 세션에서 `--color-text-muted`, `--color-link`, `--color-placeholder(-dark)`를 정리했습니다. 같은 기준으로 다음 값들도 변수화할 여지가 있습니다.

| 값 | 대략적 사용처 수 | 용도 | 비고 |
|---|---|---|---|
| `#aaaaaa` | 10곳 이상 (common, docs, blog-post, blogs, playground-example, about) | 어두운 텍스트/링크의 hover 페이드 색 | 이미 사실상 전역 컨벤션이라 `--color-text-hover` 등으로 토큰화하기 좋은 후보 |
| `#ffffff` / `#fff` (배경으로) | view.css, tutorial.css, playground-example.css 다수 | 카드/버튼/입력 배경 | `--color-bg`와 값이 같아 그대로 교체 가능 |
| `rgba(0, 0, 0, 0.0x~0.1x)` | view.css, docs.css, blog-post.css, thorvg-view | 오버레이/그림자/약한 배경 틴트 | 용도가 제각각이라 하나로 묶기보다 개별 검토 필요 |
| `#999999` | blogs.css `.blog-filter-tabs a` (비활성 탭, 현재는 `--color-text-muted`로 대체됨) | — | 이번 세션에서 제거됨 (참고용) |

---

## `thorvg-view/` 임베드 위젯 (`thorvg-view/style.css`) — 별도 디자인 시스템

메인 사이트와 독립된 컴포넌트로, 자체 컬러 변수를 사용합니다.

| 변수 | 값 | 용도 |
|---|---|---|
| `--ctrl-background-color` | `#171717` | 컨트롤 패널 배경 |
| `--ctrl-surface-color` | `#242424` | 패널 표면 |
| `--ctrl-primary-color` | `#FFF` | 기본 텍스트/아이콘 |
| `--ctrl-secondary-color` | `#6B6B6B` | 보조 텍스트 |
| `--ctrl-tertiary-color` | `#a8a8a8` | 3차 텍스트 |
| `--ctrl-title-color` | `rgba(255,255,255,0.89)` | 타이틀 텍스트 |
| `--ctrl-hover-color` | `rgb(66, 66, 66)` | hover 배경 |
| `--ctrl-border-color` | `rgba(255,255,255,0.125)` | 테두리 |
| `--scrollbar-color` / `--ctrl-scrollbar-color` | `color-mix(...)` 기반 | 스크롤바 |
| `--popup-focused-color` | `#E5FF39` | 포커스 강조(노랑) |
| `--popup-border-color` | `#000` | 팝업 테두리 |

### 주요 하드코딩 값 (토큰 미사용)

| 값 | 용도 |
|---|---|
| `#B71C1C` / `#E53935` | 콘솔 에러 텍스트/선택 강조 (빨강 계열) |
| `#b38a29` / `#FFF176` | 콘솔 경고 텍스트/선택 강조 (노랑/황토 계열) |
| `#5a8be4` | 게시글 텍스트(`.posttext`) 내 링크 |
| `#1b2124` / `#f6f6f6` | 다크 모드 이미지 영역 배경/텍스트 — `assets/css/view.css`의 다크 캔버스와 동일 값이지만 별도 변수 |
| `#5b6f7b` | 다크 모드 placeholder 텍스트 — `assets/css/common.css`의 `--color-placeholder-dark`와 값은 같지만 별도 시스템이라 공유하지 않음 |
| `#e5e7ec` / `#aab3bb` | 콘솔 하단 스크롤 버튼 기본/hover |
| `#000` / `#fff` (다수) | 업로드 팝업(`.popup`)의 텍스트/배경 |

