const DOCS_LANG_KEY = 'thorvg-docs-lang';
const DOCS_LANGS = ['c', 'cpp', 'js'];

function getStoredDocsLang() {
  try {
    const stored = localStorage.getItem(DOCS_LANG_KEY);
    return DOCS_LANGS.includes(stored) ? stored : null;
  } catch (e) {
    return null;
  }
}

function setStoredDocsLang(lang) {
  try {
    localStorage.setItem(DOCS_LANG_KEY, lang);
  } catch (e) {
    // Storage unavailable (private mode, etc.) — the switch still works for this page load.
  }
}

const docsContent = document.querySelector('.docs-content[id="docs-content"]') || document.querySelector('.docs-content');
const docsLangSwitch = document.querySelector('.docs-lang-switch');

if (docsContent && docsLangSwitch) {
  const langButtons = docsLangSwitch.querySelectorAll('.lang-tab');

  function setDocsLang(lang) {
    docsContent.setAttribute('data-lang', lang);
    langButtons.forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.lang === lang);
    });
    setStoredDocsLang(lang);
  }

  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => setDocsLang(btn.dataset.lang));
  });

  setDocsLang(getStoredDocsLang() || docsContent.dataset.lang || 'cpp');
}

// ---------- Sidebar active-link highlighting ----------
const currentPage = window.location.pathname.split('/').pop() || 'docs.html';

const sidebarSubLinks = [];

document.querySelectorAll('.docs-sidebar-link[href]').forEach((link) => {
  const linkPage = link.getAttribute('href').split('#')[0];
  if (linkPage !== currentPage) return;

  if (link.classList.contains('docs-sidebar-sub')) {
    sidebarSubLinks.push(link);
  } else if (!link.closest('.docs-sidebar-item-row')) {
    // Collapsible group headers (e.g. "Basic Programming") stay unstyled —
    // active state is shown on their sub-links instead.
    link.classList.add('is-active');
  }
});

// ---------- Sidebar scroll-spy (per-section sub-links, same page) ----------
if (sidebarSubLinks.length) {
  const sections = sidebarSubLinks
    .map((link) => {
      const heading = document.getElementById(link.getAttribute('href').split('#')[1]);
      return heading ? { link, heading } : null;
    })
    .filter(Boolean);

  const HEADER_OFFSET = 96;

  function updateActiveSidebarLink() {
    if (!sections.length) return;
    const scrollPos = window.scrollY + HEADER_OFFSET;
    let activeIndex = 0;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].heading.offsetTop <= scrollPos) {
        activeIndex = i;
      } else {
        break;
      }
    }
    sections.forEach((section, i) => {
      section.link.classList.toggle('is-active', i === activeIndex);
    });
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveSidebarLink();
        ticking = false;
      });
      ticking = true;
    }
  });

  window.addEventListener('resize', updateActiveSidebarLink);
  updateActiveSidebarLink();
}

// ---------- Sidebar collapsible subsection ("Basic Programming") ----------
const GUIDE_COLLAPSE_KEY = 'thorvg-docs-guide-collapsed';

function getStoredGuideCollapsed() {
  try {
    return localStorage.getItem(GUIDE_COLLAPSE_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

function setStoredGuideCollapsed(collapsed) {
  try {
    localStorage.setItem(GUIDE_COLLAPSE_KEY, String(collapsed));
  } catch (e) {
    // Storage unavailable (private mode, etc.) — the toggle still works for this page load.
  }
}

const guideToggle = document.querySelector('.docs-sidebar-toggle');

if (guideToggle) {
  const guideItem = guideToggle.closest('.docs-sidebar-item');

  function setGuideCollapsed(collapsed) {
    guideItem.classList.toggle('is-collapsed', collapsed);
    guideToggle.setAttribute('aria-expanded', String(!collapsed));
    setStoredGuideCollapsed(collapsed);
  }

  guideToggle.addEventListener('click', () => {
    setGuideCollapsed(!guideItem.classList.contains('is-collapsed'));
  });

  setGuideCollapsed(getStoredGuideCollapsed());
}
