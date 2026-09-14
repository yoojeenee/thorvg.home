const exampleTitle = document.getElementById('example-title');

if (exampleTitle && typeof PLAYGROUND_EXAMPLES !== 'undefined') {
  const exampleCategory = document.getElementById('example-category');
  const exampleDescription = document.getElementById('example-description');
  const exampleCopyCodeBtn = document.getElementById('example-copy-code-btn');
  const exampleCopyToast = document.getElementById('example-copy-toast');
  const exampleRunCodeBtn = document.getElementById('example-run-code-btn');
  const exampleResetCodeBtn = document.getElementById('example-reset-code-btn');
  const exampleAutoRunCheckbox = document.getElementById('example-auto-run-checkbox');
  const examplePreviewClearBtn = document.getElementById('example-preview-clear-btn');
  const examplePreviewRunBtn = document.getElementById('example-preview-run-btn');
  const examplePreviewToast = document.getElementById('example-preview-toast');
  const exampleCodePanel = document.getElementById('example-code-panel');
  const exampleCodeContent = document.getElementById('example-code-content');
  const examplePrevLink = document.getElementById('example-prev-link');
  const examplePrevTitle = document.getElementById('example-prev-title');
  const exampleNextLink = document.getElementById('example-next-link');
  const exampleNextTitle = document.getElementById('example-next-title');
  const exampleCount = document.getElementById('example-count');
  const exampleLineNumbers = document.getElementById('example-line-numbers');
  const exampleCanvas = document.getElementById('example-canvas');

  function updateExampleLineNumbers() {
    if (!exampleLineNumbers) return;
    const lineCount = exampleCodeContent.textContent.split('\n').length;
    exampleLineNumbers.textContent = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');
  }

  let canvasRuntimePromise = null;
  let engineRenderer = null;

  function setCanvasStatus(message, type) {
    if (message === 'Code executed successfully') return;
    showPreviewToast(message);
  }

  let lastAppliedCode = '';

  function setPreviewCleared(cleared) {
    if (examplePreviewClearBtn) examplePreviewClearBtn.disabled = cleared;
    if (examplePreviewRunBtn) examplePreviewRunBtn.disabled = !cleared;
  }

  function showPreviewToast(message) {
    if (!examplePreviewToast) return;
    examplePreviewToast.textContent = message;
    examplePreviewToast.classList.add('is-visible');
    clearTimeout(previewToastHideTimer);
    previewToastHideTimer = setTimeout(() => {
      examplePreviewToast.classList.remove('is-visible');
    }, 1200);
  }

  let previewToastHideTimer = null;

  function runOnCanvas(code) {
    if (viewEngineUnavailable || !exampleCanvas) return;

    lastAppliedCode = code;
    setPreviewCleared(false);

    if (!canvasRuntimePromise) {
      canvasRuntimePromise = import('../../playground/canvas-runtime.js');
    }

    canvasRuntimePromise.then(async (runtime) => {
      const renderer = runtime.extractInitConfig(code).renderer || 'gl';

      if (!engineRenderer) {
        engineRenderer = renderer;
        await runtime.initEngine(renderer, '#example-canvas', {
          onStatus: setCanvasStatus,
          onError: (error) => setCanvasStatus(error.message, 'error'),
        });
        exampleCanvas.hidden = false;
      } else if (renderer !== engineRenderer) {
        setCanvasStatus(
          `This example uses the ${renderer.toUpperCase()} renderer — reload the page to switch from ${engineRenderer.toUpperCase()}.`,
          'error'
        );
        return;
      }

      runtime.run(code, { onStatus: setCanvasStatus });
    });
  }

  let runDebounceTimer = null;

  function scheduleRunOnCanvas(code) {
    clearTimeout(runDebounceTimer);
    runDebounceTimer = setTimeout(() => runOnCanvas(code), 400);
  }

  function syncRunBtnState() {
    if (!exampleAutoRunCheckbox || !exampleRunCodeBtn) return;
    const checked = exampleAutoRunCheckbox.checked;
    exampleRunCodeBtn.disabled = checked || exampleCodeContent.textContent === lastAppliedCode;
  }

  exampleCodeContent.addEventListener('input', () => {
    updateExampleLineNumbers();
    if (!exampleAutoRunCheckbox || exampleAutoRunCheckbox.checked) {
      scheduleRunOnCanvas(exampleCodeContent.textContent);
    } else {
      syncRunBtnState();
    }
  });

  if (exampleAutoRunCheckbox && exampleRunCodeBtn) {
    exampleAutoRunCheckbox.addEventListener('change', () => {
      syncRunBtnState();
      showCodeToast(
        exampleAutoRunCheckbox.checked
          ? 'Code changes are applied automatically'
          : 'Click Run to apply your changes'
      );
    });
    syncRunBtnState();
  }

  if (examplePreviewClearBtn) {
    examplePreviewClearBtn.addEventListener('click', () => {
      if (!canvasRuntimePromise) return;
      canvasRuntimePromise.then((runtime) => runtime.clearCanvas());
      setPreviewCleared(true);
      showPreviewToast('Canvas cleared');
    });
  }

  if (examplePreviewRunBtn) {
    examplePreviewRunBtn.addEventListener('click', () => {
      runOnCanvas(exampleCodeContent.textContent);
      showPreviewToast('Code executed successfully');
    });
  }

  let copyResetTimer = null;
  let codeToastHideTimer = null;
  let originalExampleCode = '';

  function showCodeToast(message) {
    if (!exampleCopyToast) return;
    exampleCopyToast.textContent = message;
    exampleCopyToast.classList.add('is-visible');
    clearTimeout(codeToastHideTimer);
    codeToastHideTimer = setTimeout(() => {
      exampleCopyToast.classList.remove('is-visible');
    }, 1200);
  }

  exampleCopyCodeBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(exampleCodeContent.textContent).then(() => {
      clearTimeout(copyResetTimer);
      exampleCopyCodeBtn.disabled = true;
      copyResetTimer = setTimeout(() => {
        exampleCopyCodeBtn.disabled = false;
      }, 1200);

      showCodeToast('Code copied to clipboard');
    });
  });

  if (exampleRunCodeBtn) {
    exampleRunCodeBtn.addEventListener('click', () => {
      runOnCanvas(exampleCodeContent.textContent);
      syncRunBtnState();
    });
  }

  if (exampleResetCodeBtn) {
    exampleResetCodeBtn.addEventListener('click', () => {
      exampleCodeContent.textContent = originalExampleCode;
      updateExampleLineNumbers();
      exampleCodeContent.closest('.code-block').classList.toggle('is-single-line', !originalExampleCode.trim().includes('\n'));
      runOnCanvas(originalExampleCode);
      syncRunBtnState();
      showCodeToast('Code reset to original');
    });
  }

  const params = new URLSearchParams(window.location.search);
  const exampleId = params.get('id');
  const exampleIndex = PLAYGROUND_EXAMPLES.findIndex((item) => item.id === exampleId);
  const example = exampleIndex !== -1 ? PLAYGROUND_EXAMPLES[exampleIndex] : null;

  if (example) {
    document.title = example.title + ' — Playground — ThorVG';
    exampleTitle.textContent = example.title;
    exampleCategory.textContent = example.category;
    exampleDescription.textContent = example.description;

    if (exampleCanvas && example.useDarkCanvas) {
      exampleCanvas.classList.add('is-dark');
    }

    function setExampleCode(text) {
      exampleCodeContent.textContent = text;
      updateExampleLineNumbers();
      exampleCodeContent.closest('.code-block').classList.toggle('is-single-line', !text.trim().includes('\n'));
    }

    if (viewEngineUnavailable) {
      setExampleCode('Opening this page directly from disk (file://) blocks loading example source files.\nRun this site through a local server (e.g. `python3 -m http.server`) to view the code.');
      setCanvasStatus('Live preview isn’t available when opened directly from disk (file://). Run this site through a local server to see it.', 'error');
    } else {
      fetch(example.file)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load example source');
          return res.text();
        })
        .then((code) => {
          originalExampleCode = code;
          setExampleCode(code);
          runOnCanvas(code);
          syncRunBtnState();
        })
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

    if (!viewEngineUnavailable) {
      runOnCanvas('');
      syncRunBtnState();
    } else {
      setCanvasStatus('Live preview isn’t available when opened directly from disk (file://). Run this site through a local server to try it.', 'error');
    }
  }
}

const exampleCodePanelForSticky = document.getElementById('example-code-panel');
const siteHeaderForAutoHide = document.querySelector('.site-header');

if (exampleCodePanelForSticky && siteHeaderForAutoHide) {
  const revealHotzone = 10;

  const showHeader = () => {
    siteHeaderForAutoHide.classList.remove('is-hidden');
    exampleCodePanelForSticky.classList.remove('is-pinned-top');
  };
  const hideHeader = () => {
    siteHeaderForAutoHide.classList.add('is-hidden');
    exampleCodePanelForSticky.classList.add('is-pinned-top');
  };

  window.addEventListener('mousemove', (event) => {
    if (event.clientY <= revealHotzone) {
      showHeader();
    }
  }, { passive: true });

  siteHeaderForAutoHide.addEventListener('mouseleave', hideHeader);
}
