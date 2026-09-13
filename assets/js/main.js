const menuToggle = document.getElementById('menu-toggle');
const mainNav = document.getElementById('main-nav');
const menuIcon = menuToggle ? menuToggle.querySelector('.menu-icon') : null;

function setMenuOpen(isOpen) {
  mainNav.classList.toggle('is-open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Toggle menu');
  if (menuIcon) {
    menuIcon.src = isOpen ? 'assets/icons/close.svg' : 'assets/icons/menu.svg';
  }
}

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    setMenuOpen(!mainNav.classList.contains('is-open'));
  });

  mainNav.addEventListener('click', (event) => {
    if (event.target.tagName === 'A') {
      setMenuOpen(false);
    }
  });
}

const playgroundFilters = document.getElementById('playground-filters');
const playgroundGrid = document.getElementById('playground-grid');

if (playgroundFilters && playgroundGrid) {
  const chips = playgroundFilters.querySelectorAll('.filter-chip');
  const cards = playgroundGrid.querySelectorAll('.playground-card');

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const filter = chip.dataset.filter;

      chips.forEach((c) => c.classList.toggle('is-active', c === chip));

      cards.forEach((card) => {
        const show = filter === 'All' || card.dataset.category === filter;
        card.hidden = !show;
      });
    });
  });
}

document.querySelectorAll('.lang-group').forEach((group) => {
  const groupButtons = group.querySelectorAll('.lang-tab');

  function setGroupLang(lang, anchorEl) {
    const beforeY = anchorEl ? anchorEl.getBoundingClientRect().top : null;

    group.setAttribute('data-lang', lang);
    groupButtons.forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.lang === lang);
    });

    if (anchorEl) {
      const afterY = anchorEl.getBoundingClientRect().top;
      window.scrollBy(0, afterY - beforeY);
    }
  }

  groupButtons.forEach((btn) => {
    btn.addEventListener('click', () => setGroupLang(btn.dataset.lang, btn));
  });

  setGroupLang(group.dataset.lang === 'js' ? 'js' : 'cpp');
});

const COPY_ICON = '<svg viewBox="0 0 640 640" class="code-copy-icon" aria-hidden="true"><path d="M352 528L128 528C119.2 528 112 520.8 112 512L112 288C112 279.2 119.2 272 128 272L176 272L176 224L128 224C92.7 224 64 252.7 64 288L64 512C64 547.3 92.7 576 128 576L352 576C387.3 576 416 547.3 416 512L416 464L368 464L368 512C368 520.8 360.8 528 352 528zM288 368C279.2 368 272 360.8 272 352L272 128C272 119.2 279.2 112 288 112L512 112C520.8 112 528 119.2 528 128L528 352C528 360.8 520.8 368 512 368L288 368zM224 352C224 387.3 252.7 416 288 416L512 416C547.3 416 576 387.3 576 352L576 128C576 92.7 547.3 64 512 64L288 64C252.7 64 224 92.7 224 128L224 352z" fill="currentColor"/></svg>';
const CHECK_ICON = '<svg viewBox="0 0 640 640" class="code-check-icon" aria-hidden="true"><path d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z" fill="currentColor"/></svg>';

function createCopyButton(getText) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'code-copy-btn';
  button.setAttribute('aria-label', 'Copy to clipboard');
  button.innerHTML = COPY_ICON + CHECK_ICON;

  let resetTimer = null;

  button.addEventListener('click', () => {
    navigator.clipboard.writeText(getText()).then(() => {
      clearTimeout(resetTimer);
      button.classList.add('is-copied');
      resetTimer = setTimeout(() => {
        button.classList.remove('is-copied');
      }, 1800);
    });
  });

  return button;
}

document.querySelectorAll('.code-block').forEach((block) => {
  const code = block.querySelector('code');
  if (!code) return;

  block.classList.toggle('is-single-line', !code.textContent.trim().includes('\n'));

  if (block.closest('.lang-tabs')) return;

  block.appendChild(createCopyButton(() => code.textContent));
});

document.querySelectorAll('.lang-tabs').forEach((tabs) => {
  const header = tabs.querySelector('.lang-tabs-header');
  const group = tabs.closest('.lang-group');
  const cppCode = tabs.querySelector(':scope > .lang-cpp code');
  const jsCode = tabs.querySelector(':scope > .lang-js code');
  if (!header || (!cppCode && !jsCode)) return;

  header.appendChild(createCopyButton(() => {
    const lang = group ? group.dataset.lang : 'cpp';
    const target = lang === 'js' ? jsCode : cppCode;
    return target ? target.textContent : '';
  }));
});
