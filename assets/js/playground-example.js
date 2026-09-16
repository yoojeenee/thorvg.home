const exampleTitle = document.getElementById('example-title');

const MONACO_VERSION = '0.52.2';
const MONACO_BASE = 'https://cdn.jsdelivr.net/npm/monaco-editor@' + MONACO_VERSION + '/min/vs';

function loadMonaco() {
  return new Promise((resolve) => {
    if (window.monaco) {
      resolve(window.monaco);
      return;
    }
    const script = document.createElement('script');
    script.src = MONACO_BASE + '/loader.js';
    script.onload = () => {
      window.require.config({ paths: { vs: MONACO_BASE } });
      window.require(['vs/editor/editor.main'], () => resolve(window.monaco));
    };
    document.head.appendChild(script);
  });
}

async function createExampleEditor(container) {
  const monaco = await loadMonaco();

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    allowNonTsExtensions: true,
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    noLib: false,
    skipLibCheck: true,
    lib: ['es2020', 'es2019', 'es2018', 'es2017', 'es2016', 'es2015', 'dom', 'dom.iterable', 'webworker', 'scripthost'],
  });

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    diagnosticCodesToIgnore: [
      1375, // 'await' expressions are only allowed at the top level of a file
      1378, // Top-level 'await' expressions are only allowed when...
      2304, // Cannot find name (for global variables like TVG, canvas)
      2339, // Property does not exist (too strict for playground)
      2552, // Cannot find name. Did you mean...
      2792, // Cannot find module '@thorvg/webcanvas'
      6133, // Variable is declared but never used
      7016, // Could not find a declaration file
      80001, // File is a CommonJS module
      80005, // 'require' call may be converted to an import
    ],
  });

  try {
    const webcanvasTypes = await fetch('playground/webcanvas.d.ts').then((res) => res.text());
    const thorvgTypes = "declare module '@thorvg/webcanvas' {\n" + webcanvasTypes + "\n}\n\n" +
      "declare const TVG: import('@thorvg/webcanvas').ThorVGNamespace;\n" +
      "declare const canvas: import('@thorvg/webcanvas').Canvas;\n";
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      thorvgTypes,
      'file:///node_modules/@types/thorvg-webcanvas/index.d.ts'
    );
  } catch (err) {
    // Autocomplete types are a nice-to-have; editing still works without them.
  }

  monaco.editor.defineTheme('thorvg-light', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#f1f1f1',
      'editor.lineHighlightBackground': '#eaeaea',
    },
  });

  return monaco.editor.create(container, {
    value: '',
    language: 'typescript',
    theme: 'thorvg-light',
    minimap: { enabled: false },
    fontFamily: '"SF Mono", SFMono-Regular, ui-monospace, Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: 13,
    lineHeight: 21,
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'on',
    folding: true,
    bracketPairColorization: { enabled: true },
    padding: { top: 20, bottom: 20 },
  });
}

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
  const exampleZoomSlider = document.getElementById('example-zoom-slider');
  const exampleZoomPopup = document.getElementById('example-zoom-popup');
  const exampleCodePanel = document.getElementById('example-code-panel');
  const exampleMonacoContainer = document.getElementById('example-monaco-container');
  const examplePrevLink = document.getElementById('example-prev-link');
  const examplePrevTitle = document.getElementById('example-prev-title');
  const exampleNextLink = document.getElementById('example-next-link');
  const exampleNextTitle = document.getElementById('example-next-title');
  const exampleCount = document.getElementById('example-count');
  const exampleCanvas = document.getElementById('example-canvas');

  let canvasRuntimePromise = null;
  let engineRenderer = null;

  function setCanvasStatus(message, type) {
    if (message === 'Code executed successfully' || message === 'Ready') return;
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

  if (exampleZoomSlider && exampleZoomPopup && exampleCanvas) {
    let zoomPopupHideTimer = null;

    const positionZoomPopup = () => {
      const min = Number(exampleZoomSlider.min);
      const max = Number(exampleZoomSlider.max);
      const ratio = (Number(exampleZoomSlider.value) - min) / (max - min);
      exampleZoomPopup.style.left = (ratio * 100) + '%';
    };

    const updateZoom = () => {
      const value = Number(exampleZoomSlider.value);
      exampleZoomPopup.textContent = value + '%';
      positionZoomPopup();
      exampleCanvas.style.transform = 'scale(' + (value / 100) + ')';
    };

    exampleZoomSlider.addEventListener('input', () => {
      updateZoom();
      exampleZoomPopup.classList.add('is-visible');
      clearTimeout(zoomPopupHideTimer);
      zoomPopupHideTimer = setTimeout(() => {
        exampleZoomPopup.classList.remove('is-visible');
      }, 1200);
    });

    updateZoom();
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

  (async () => {
    const editor = exampleMonacoContainer ? await createExampleEditor(exampleMonacoContainer) : null;
    if (!editor) return;

    function getCode() {
      return editor.getValue();
    }

    function setCode(text) {
      editor.setValue(text);
    }

    function syncRunBtnState() {
      if (!exampleAutoRunCheckbox || !exampleRunCodeBtn) return;
      const checked = exampleAutoRunCheckbox.checked;
      exampleRunCodeBtn.disabled = checked || getCode() === lastAppliedCode;
    }

    editor.onDidChangeModelContent(() => {
      if (!exampleAutoRunCheckbox || exampleAutoRunCheckbox.checked) {
        scheduleRunOnCanvas(getCode());
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

    if (examplePreviewRunBtn) {
      examplePreviewRunBtn.addEventListener('click', () => {
        runOnCanvas(getCode());
        showPreviewToast('Code executed successfully');
      });
    }

    if (examplePreviewClearBtn) {
      examplePreviewClearBtn.addEventListener('click', () => {
        if (!canvasRuntimePromise) return;
        canvasRuntimePromise.then((runtime) => runtime.clearCanvas());
        setPreviewCleared(true);
        showPreviewToast('Canvas cleared');
      });
    }

    exampleCopyCodeBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(getCode()).then(() => {
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
        runOnCanvas(getCode());
        syncRunBtnState();
      });
    }

    if (exampleResetCodeBtn) {
      exampleResetCodeBtn.addEventListener('click', () => {
        setCode(originalExampleCode);
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

      if (viewEngineUnavailable) {
        setCode('Opening this page directly from disk (file://) blocks loading example source files.\nRun this site through a local server (e.g. `python3 -m http.server`) to view the code.');
        setCanvasStatus('Live preview isn’t available when opened directly from disk (file://).\nRun this site through a local server to see it.', 'error');
      } else {
        fetch(example.file)
          .then((res) => {
            if (!res.ok) throw new Error('Failed to load example source');
            return res.text();
          })
          .then((code) => {
            originalExampleCode = code;
            setCode(code);
            runOnCanvas(code);
            syncRunBtnState();
          })
          .catch(() => setCode('Unable to load example source.'));
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
      const starterCode = "import { init } from '@thorvg/webcanvas';\n\nconst TVG = await init({\n  renderer: 'gl',\n  locateFile: (path) => 'playground/' + path.split('/').pop()\n});\n\nconst canvas = new TVG.Canvas('#canvas', {\n  width: 600,\n  height: 600,\n});\n\n// Write your code here\n";
      originalExampleCode = starterCode;
      setCode(starterCode);
      document.querySelector('.example-pagination').hidden = true;

      if (!viewEngineUnavailable) {
        runOnCanvas(starterCode);
        syncRunBtnState();
      } else {
        setCanvasStatus('Live preview isn’t available when opened directly from disk (file://). Run this site through a local server to try it.', 'error');
      }
    }
  })();
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
