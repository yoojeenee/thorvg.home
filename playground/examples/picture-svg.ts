// Native example: PictureSvg.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => 'playground/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

//Load SVG from file
(async () => {
  const response = await fetch('playground/assets/images/tiger.svg');
  const tigerSvg = await response.text();

  const tiger = new TVG.Picture();
  tiger.load(tigerSvg, { type: 'svg' })
    .size(600, 600);

  canvas.add(tiger);
  canvas.render();
})();
