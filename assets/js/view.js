const viewCanvas = document.getElementById('view-canvas');
const viewFileInput = document.getElementById('view-file-input');

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

const siteHeaderForAutoHide = document.querySelector('.site-header');

if (siteHeaderForAutoHide) {
  const revealHotzone = 10;

  const showHeader = () => siteHeaderForAutoHide.classList.remove('is-hidden');
  const hideHeader = () => siteHeaderForAutoHide.classList.add('is-hidden');

  window.addEventListener('mousemove', (event) => {
    if (event.clientY <= revealHotzone) {
      showHeader();
    }
  }, { passive: true });

  siteHeaderForAutoHide.addEventListener('mouseleave', hideHeader);
}
