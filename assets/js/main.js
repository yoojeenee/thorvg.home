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
  // Playground example code blocks handle their own copy button in the panel header.
  if (block.querySelector('#example-code-content')) return;

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

const viewCanvas = document.getElementById('view-canvas');
const viewFileInput = document.getElementById('view-file-input');
const viewEngineUnavailable = window.location.protocol === 'file:';

if (viewCanvas && viewFileInput && !viewEngineUnavailable) {
  viewCanvas.addEventListener('click', (event) => {
    if (event.target.closest('.view-preview-panel')) {
      viewFileInput.click();
    }
  });

  viewCanvas.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      viewFileInput.click();
    }
  });
}

const viewPreviewTabs = document.querySelector('.view-preview-tabs');

if (viewPreviewTabs) {
  const tabButtons = viewPreviewTabs.querySelectorAll('.view-preview-tab');
  const panels = viewPreviewTabs.querySelectorAll('.view-preview-panel');

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();

      const view = btn.dataset.view;

      tabButtons.forEach((b) => b.classList.toggle('is-active', b === btn));
      panels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.panel === view));
    });
  });

  viewPreviewTabs.querySelectorAll('.view-canvas-action').forEach((btn) => {
    btn.addEventListener('click', (event) => event.stopPropagation());
  });
}

const viewActionDark = document.getElementById('view-action-dark');

if (viewActionDark && viewCanvas) {
  viewActionDark.addEventListener('click', () => {
    const isDark = viewCanvas.classList.toggle('is-dark');
    viewActionDark.classList.toggle('is-active', isDark);
  });
}

const viewActionStats = document.getElementById('view-action-stats');
const viewCanvasStats = document.getElementById('view-canvas-stats');

if (viewActionStats && viewCanvasStats) {
  viewActionStats.addEventListener('click', () => {
    const isVisible = viewCanvasStats.hidden;
    viewCanvasStats.hidden = !isVisible;
    viewActionStats.classList.toggle('is-active', isVisible);
  });
}

const viewActionHistory = document.getElementById('view-action-history');
const viewHistoryPanel = document.getElementById('view-history-panel');

if (viewActionHistory && viewHistoryPanel) {
  viewActionHistory.addEventListener('click', () => {
    const isVisible = viewHistoryPanel.hidden;
    viewHistoryPanel.hidden = !isVisible;
    viewActionHistory.classList.toggle('is-active', isVisible);
  });
}

const viewUploadFile = document.getElementById('view-upload-file');

if (viewUploadFile && viewFileInput && !viewEngineUnavailable) {
  viewUploadFile.addEventListener('click', () => viewFileInput.click());
}

const viewRendererSelect = document.getElementById('view-renderer-select');
const viewQualitySelect = document.getElementById('view-quality-select');
const viewCanvasStatusRenderer = document.getElementById('view-canvas-status-renderer');
const viewCanvasStatusQuality = document.getElementById('view-canvas-status-quality');

if (viewRendererSelect && viewQualitySelect && viewCanvasStatusRenderer && viewCanvasStatusQuality) {
  const rendererLabels = { sw: 'Software', gl: 'WebGL', wg: 'WebGPU' };
  const qualityLabels = { low: 'Low', medium: 'Medium', high: 'High' };

  function renderCanvasStatus() {
    viewCanvasStatusRenderer.textContent = rendererLabels[viewRendererSelect.value] || viewRendererSelect.value;
    viewCanvasStatusQuality.textContent = qualityLabels[viewQualitySelect.value] || viewQualitySelect.value;
  }

  viewRendererSelect.addEventListener('change', renderCanvasStatus);
  viewQualitySelect.addEventListener('change', renderCanvasStatus);

  renderCanvasStatus();
}

const exampleTitle = document.getElementById('example-title');

if (exampleTitle && typeof PLAYGROUND_EXAMPLES !== 'undefined') {
  const exampleCategory = document.getElementById('example-category');
  const exampleDescription = document.getElementById('example-description');
  const exampleCopyCodeBtn = document.getElementById('example-copy-code-btn');
  const exampleCopyCodeLabel = document.getElementById('example-copy-code-label');
  const exampleCodePanel = document.getElementById('example-code-panel');
  const exampleCodeContent = document.getElementById('example-code-content');
  const examplePrevLink = document.getElementById('example-prev-link');
  const examplePrevTitle = document.getElementById('example-prev-title');
  const exampleNextLink = document.getElementById('example-next-link');
  const exampleNextTitle = document.getElementById('example-next-title');
  const exampleCount = document.getElementById('example-count');
  const exampleLineNumbers = document.getElementById('example-line-numbers');

  function updateExampleLineNumbers() {
    if (!exampleLineNumbers) return;
    const lineCount = exampleCodeContent.textContent.split('\n').length;
    exampleLineNumbers.textContent = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');
  }

  exampleCodeContent.addEventListener('input', updateExampleLineNumbers);

  let copyResetTimer = null;

  exampleCopyCodeBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(exampleCodeContent.textContent).then(() => {
      clearTimeout(copyResetTimer);
      exampleCopyCodeBtn.classList.add('is-copied');
      exampleCopyCodeLabel.textContent = 'Copied';
      copyResetTimer = setTimeout(() => {
        exampleCopyCodeBtn.classList.remove('is-copied');
        exampleCopyCodeLabel.textContent = 'Copy Code';
      }, 1800);
    });
  });

  const params = new URLSearchParams(window.location.search);
  const exampleId = params.get('id');
  const exampleIndex = PLAYGROUND_EXAMPLES.findIndex((item) => item.id === exampleId);
  const example = exampleIndex !== -1 ? PLAYGROUND_EXAMPLES[exampleIndex] : null;

  if (example) {
    document.title = example.title + ' — Playground — ThorVG';
    exampleTitle.textContent = example.title;
    exampleCategory.textContent = example.category;
    exampleDescription.textContent = example.description;

    function setExampleCode(text) {
      exampleCodeContent.textContent = text;
      updateExampleLineNumbers();
      exampleCodeContent.closest('.code-block').classList.toggle('is-single-line', !text.trim().includes('\n'));
    }

    if (viewEngineUnavailable) {
      setExampleCode('Opening this page directly from disk (file://) blocks loading example source files.\nRun this site through a local server (e.g. `python3 -m http.server`) to view the code.');
    } else {
      fetch(example.file)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load example source');
          return res.text();
        })
        .then((code) => setExampleCode(code))
        .catch(() => setExampleCode('Unable to load example source.'));
    }

    const prev = exampleIndex > 0 ? PLAYGROUND_EXAMPLES[exampleIndex - 1] : null;
    const next = exampleIndex < PLAYGROUND_EXAMPLES.length - 1 ? PLAYGROUND_EXAMPLES[exampleIndex + 1] : null;

    if (prev) {
      examplePrevLink.href = 'playground-example.html?id=' + prev.id;
      examplePrevTitle.textContent = prev.title;
      examplePrevLink.hidden = false;
    }

    if (next) {
      exampleNextLink.href = 'playground-example.html?id=' + next.id;
      exampleNextTitle.textContent = next.title;
      exampleNextLink.hidden = false;
    }

    exampleCount.textContent = (exampleIndex + 1) + ' / ' + PLAYGROUND_EXAMPLES.length;
  } else if (exampleId) {
    exampleTitle.textContent = 'Example not found';
    exampleDescription.textContent = 'The requested example could not be found. Go back to the Playground to pick one.';
    exampleCategory.hidden = true;
    exampleCodePanel.hidden = true;
  } else {
    exampleTitle.textContent = 'Try your code';
    exampleDescription.textContent = 'Paste your own ThorVG WebCanvas or native code below, or pick an example from the Playground.';
    exampleCategory.hidden = true;
    exampleCodeContent.textContent = '';
    updateExampleLineNumbers();
    document.querySelector('.example-pagination').hidden = true;
  }
}
