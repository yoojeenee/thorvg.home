(function () {
  const canvas = document.getElementById('view-canvas');
  const previewPanel = document.querySelector('.view-preview-panel[data-panel="preview"]');
  const detailsContainer = document.getElementById('view-file-detail');
  const placeholder = document.getElementById('view-canvas-placeholder');
  const fileInput = document.getElementById('view-file-input');
  const uploadUrlBtn = document.getElementById('view-upload-url');
  const filesListEl = document.getElementById('view-files-list');

  const zoomSlider = document.getElementById('view-zoom-slider');
  const zoomValue = document.getElementById('view-zoom-value');
  const progressSlider = document.getElementById('view-progress-slider');
  const progressValue = document.getElementById('view-progress-value');
  const progressPlay = document.getElementById('view-progress-play');
  const progressPause = document.getElementById('view-progress-pause');
  const progressStop = document.getElementById('view-progress-stop');
  const rendererSelect = document.getElementById('view-renderer-select');
  const qualitySelect = document.getElementById('view-quality-select');
  const exportPngBtn = document.getElementById('view-export-png');
  const exportGifBtn = document.getElementById('view-export-gif');

  if (!canvas || !previewPanel || !fileInput || typeof customElements === 'undefined' || !customElements.get('lottie-player')) {
    return;
  }

  if (window.location.protocol === 'file:') {
    if (placeholder) {
      placeholder.innerHTML = 'Live rendering isn&rsquo;t available when this page is opened directly (file://).<br>Run the local server and open it from http://localhost instead.';
    }
    // The WASM engine can't fetch over file://, so none of the loading/rendering
    // logic below can work — skip wiring it up entirely rather than failing later.
    return;
  }

  const allowedExtensionList = ['svg', 'json', 'png', 'jpg', 'jpeg', 'lot', 'webp'];
  const qualityValues = { low: 30, medium: 60, high: 90 };

  let player = null;
  let size = 800;
  let renderer = rendererSelect ? rendererSelect.value : 'gl';
  let filename = '';
  let filetype = '';
  let filedata = null;
  const filesList = [];

  function allowedFileExtension(name) {
    const ext = name.split('.').pop().toLowerCase();
    return allowedExtensionList.includes(ext);
  }

  function bytesToSize(bytes) {
    if (bytes <= 0) return '0 byte';
    const sizes = ['bytes', 'kB', 'MB'];
    const i = bytes > 1024 ? (bytes > 1048576 ? 2 : 1) : 0;
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  }

  function initPlayer() {
    if (player) return;
    player = document.createElement('lottie-player');
    player.autoPlay = true;
    player.loop = true;
    player.wasmUrl = 'thorvg-view/thorvg.wasm';
    player.renderConfig = { renderer };
    player.classList.add('is-hidden');
    player.addEventListener('frame', refreshProgressValue);
    previewPanel.appendChild(player);
  }

  function showPlayer() {
    if (placeholder) placeholder.classList.add('is-hidden');
    if (player) player.classList.remove('is-hidden');
  }

  function enableZoomContainer(enable) {
    if (zoomSlider) zoomSlider.disabled = !enable;
  }

  function enableProgressContainer(enable) {
    if (progressSlider) {
      progressSlider.disabled = !enable;
      progressSlider.value = 0;
    }
    if (progressValue) progressValue.textContent = '0 / ' + Math.floor(player.totalFrame || 0);
  }

  function refreshProgressValue() {
    if (!player || !progressSlider || !progressValue) return;
    const total = player.totalFrame || 0;
    progressSlider.value = total ? (player.currentFrame / total) * 100 : 0;
    progressValue.textContent = Math.round(player.currentFrame || 0) + ' / ' + Math.floor(total);
  }

  function refreshZoomValue() {
    if (!player || !zoomValue) return;
    const canvasEl = player.querySelector('canvas');
    if (!canvasEl) return;
    zoomValue.textContent = Math.round(canvasEl.width) + ' x ' + Math.round(canvasEl.height);
  }

  function resize(width, height) {
    player.style.width = width + 'px';
    player.style.height = height + 'px';
    player.resize(width, height);
  }

  function renderFileDetail() {
    if (!detailsContainer || !player) return;
    const dims = player.size || [size, size];
    const sizeText = Math.round(dims[0]) + ' x ' + Math.round(dims[1]);
    detailsContainer.innerHTML = '';

    const nameRow = document.createElement('div');
    nameRow.className = 'view-file-detail-row';
    nameRow.innerHTML = '<span class="view-file-detail-label">File Name</span><span class="view-file-detail-value"></span>';
    nameRow.querySelector('.view-file-detail-value').textContent = filename;

    const resRow = document.createElement('div');
    resRow.className = 'view-file-detail-row';
    resRow.innerHTML = '<span class="view-file-detail-label">Resolution</span><span class="view-file-detail-value"></span>';
    resRow.querySelector('.view-file-detail-value').textContent = sizeText;

    detailsContainer.appendChild(nameRow);
    detailsContainer.appendChild(resRow);
  }

  function renderFilesList() {
    if (!filesListEl) return;
    filesListEl.innerHTML = '';

    if (filesList.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'view-files-empty';
      empty.textContent = 'No files added yet';
      filesListEl.appendChild(empty);
      return;
    }

    filesList.forEach((file) => {
      const li = document.createElement('li');
      li.className = 'view-file-entry';

      const name = document.createElement('span');
      name.className = 'view-file-entry-name';
      name.textContent = file.name;
      name.title = 'Click to load this file';
      name.addEventListener('click', () => loadFile(file));

      const fileSize = document.createElement('span');
      fileSize.className = 'view-file-entry-size';
      fileSize.textContent = bytesToSize(file.size);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'view-file-entry-remove';
      remove.setAttribute('aria-label', 'Remove file');
      remove.innerHTML = '<svg viewBox="0 0 448 512"><path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0L284.2 0c12.1 0 23.2 6.8 28.6 17.7L320 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 7.2-14.3zM32 128l384 0 0 320c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-320zm96 64c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16z"/></svg>';
      remove.addEventListener('click', (event) => {
        event.stopPropagation();
        const index = filesList.indexOf(file);
        if (index !== -1) filesList.splice(index, 1);
        renderFilesList();
      });

      li.appendChild(name);
      li.appendChild(fileSize);
      li.appendChild(remove);
      filesListEl.appendChild(li);
    });
  }

  function loadData(data, fileExtension) {
    filedata = data;
    initPlayer();

    requestAnimationFrame(async () => {
      player.style.width = size + 'px';
      player.style.height = size + 'px';
      try {
        await player.load(data, fileExtension);
      } catch (err) {
        console.error('ThorVG View: failed to load file', err);
        if (window.location.protocol === 'file:') {
          alert('Live rendering isn\'t available when this page is opened directly (file://).\nRun the local server and open it from http://localhost instead.');
        } else {
          alert('Unable to render this file.' + (err && err.message ? '\n\n' + err.message : ''));
        }
        return;
      }
      showPlayer();
      renderFileDetail();
      renderFilesList();
      enableZoomContainer(true);
      enableProgressContainer(true);
      if (qualitySelect) player.setQuality(qualityValues[qualitySelect.value] || 30);
      requestAnimationFrame(() => refreshZoomValue());
    });
  }

  function loadFile(file) {
    filename = file.name;
    filetype = filename.split('.').pop().toLowerCase();
    const isLottie = filetype === 'json' || filetype === 'lot';
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = isLottie ? JSON.parse(event.target.result) : event.target.result;
      loadData(data, filetype);
    };

    if (isLottie) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  }

  function loadUrl(url) {
    filename = url.split('/').pop();
    filetype = url.split('.').pop().toLowerCase();
    initPlayer();
    player.load(url, filetype).then(() => {
      showPlayer();
      renderFileDetail();
      enableZoomContainer(true);
      enableProgressContainer(true);
      if (qualitySelect) player.setQuality(qualityValues[qualitySelect.value] || 30);
      requestAnimationFrame(() => refreshZoomValue());
    }).catch((err) => {
      console.error('ThorVG View: failed to load URL', err);
      alert('Unable to load a file from that URL.' + (err && err.message ? '\n\n' + err.message : ''));
    });
  }

  function handleFiles(fileList) {
    let supported = false;
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!allowedFileExtension(file.name)) continue;
      filesList.push(file);
      supported = true;
    }
    if (!supported) {
      alert('Please use file(s) of a supported format.');
      return;
    }
    loadFile(filesList[filesList.length - 1]);
  }

  fileInput.addEventListener('change', () => {
    handleFiles(fileInput.files);
    fileInput.value = '';
  });

  canvas.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
  });

  canvas.addEventListener('drop', (event) => {
    event.preventDefault();
    event.stopPropagation();
    handleFiles(event.dataTransfer.files);
  });

  if (uploadUrlBtn) {
    uploadUrlBtn.addEventListener('click', () => {
      const url = window.prompt('Enter a URL to an SVG or Lottie file:');
      if (!url) return;
      if (!allowedFileExtension(url)) {
        alert('Please use a URL to a supported file format.');
        return;
      }
      loadUrl(url);
    });
  }

  if (zoomSlider) {
    zoomSlider.addEventListener('input', () => {
      if (!player) return;
      size = Math.floor(1500 * (Number(zoomSlider.value) / 300));
      resize(size, size);
      requestAnimationFrame(() => refreshZoomValue());
    });
  }

  if (progressSlider) {
    progressSlider.addEventListener('input', () => {
      if (!player) return;
      player.seek((Number(progressSlider.value) / 100) * player.totalFrame);
      refreshProgressValue();
    });
  }

  if (progressPlay) {
    progressPlay.addEventListener('click', () => {
      if (player) player.play();
    });
  }

  if (progressPause) {
    progressPause.addEventListener('click', () => {
      if (player) player.pause();
    });
  }

  if (progressStop) {
    progressStop.addEventListener('click', () => {
      if (!player) return;
      player.stop();
      if (progressSlider) progressSlider.value = 0;
      if (progressValue) progressValue.textContent = '0 / ' + Math.floor(player.totalFrame || 0);
    });
  }

  if (rendererSelect) {
    rendererSelect.addEventListener('change', () => {
      renderer = rendererSelect.value;
      if (player) {
        player.destroy();
        player.remove();
        player = null;
      }
      if (filedata) loadData(filedata, filetype);
    });
  }

  if (qualitySelect) {
    qualitySelect.addEventListener('change', () => {
      if (player) player.setQuality(qualityValues[qualitySelect.value] || 30);
    });
  }

  if (exportPngBtn) {
    exportPngBtn.addEventListener('click', async () => {
      if (!player) return;
      try {
        await player.save2png();
      } catch (err) {
        alert('Unable to save the Png data.');
      }
    });
  }

  if (exportGifBtn) {
    exportGifBtn.addEventListener('click', () => {
      if (!player || !filedata) return;
      try {
        player.save2gif(filedata);
      } catch (err) {
        alert('Unable to save the Gif data.');
      }
    });
  }
})();
