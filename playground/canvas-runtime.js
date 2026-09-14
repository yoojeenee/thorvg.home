// Vanilla-JS adaptation of thorvg.web's playground/components/CanvasPreview.tsx.
// No React: exposes a small init/run API that assets/js/main.js drives directly.

import { transformCodeForExecution } from './code-transformer.js';

let TVG = null;
let canvas = null;
let animationId = null;
const fetchCache = new Map();

async function cachedFetch(url, requestInit) {
  const method = requestInit && requestInit.method ? requestInit.method.toUpperCase() : 'GET';
  if (method !== 'GET') return fetch(url, requestInit);

  const key = url.toString();
  const cached = fetchCache.get(key);
  if (cached) {
    return new Response(cached.data, { status: cached.status, statusText: cached.statusText, headers: cached.headers });
  }

  const response = await fetch(url, requestInit);
  const data = await response.arrayBuffer();
  fetchCache.set(key, { data, status: response.status, statusText: response.statusText, headers: response.headers });
  return new Response(data, { status: response.status, statusText: response.statusText, headers: response.headers });
}

export async function initEngine(renderer, canvasSelector, { onStatus, onError } = {}) {
  if (onStatus) onStatus(`Initializing ThorVG with ${renderer.toUpperCase()} renderer...`, 'info');

  const { init } = await import('./webcanvas.esm.js');

  TVG = await init({
    renderer,
    locateFile: () => 'playground/thorvg.wasm',
    onError: (error, context) => {
      console.error(error.message, 'operation:', context.operation);
      if (onError) onError(error, context);
    },
  });

  canvas = new TVG.Canvas(canvasSelector, { width: 600, height: 600 });

  if (onStatus) onStatus('Ready', 'success');
  return TVG;
}

export async function run(code, { onStatus } = {}) {
  if (!TVG || !canvas) {
    if (onStatus) onStatus('ThorVG not initialized yet', 'error');
    return;
  }

  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  canvas.clear();

  const wrappedRAF = (callback) => {
    animationId = requestAnimationFrame(callback);
    return animationId;
  };

  try {
    const executableCode = transformCodeForExecution(code);
    const executeFunction = new Function(
      'TVG',
      'canvas',
      'requestAnimationFrame',
      'performance',
      'console',
      'fetch',
      executableCode
    );

    await executeFunction(TVG, canvas, wrappedRAF, performance, console, cachedFetch);

    if (onStatus) onStatus('Code executed successfully', 'success');
  } catch (error) {
    console.error('Error executing code:', error);
    if (onStatus) onStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
  }
}

export function clearCanvas() {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (canvas) canvas.clear();
}

export { extractInitConfig } from './code-transformer.js';
