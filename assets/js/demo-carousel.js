const demoTrack = document.getElementById('demo-carousel-track');

function demoCardHTML(demo) {
  return `
    <li class="demo-card">
      <a href="${demo.href}" class="demo-card-link">
        <div class="demo-card-media"><img src="${demo.image}" alt="${demo.title}"></div>
        <p class="demo-card-title">${demo.title}</p>
      </a>
    </li>`;
}

if (demoTrack && typeof HOME_DEMOS !== 'undefined' && HOME_DEMOS.length > 0) {
  const demos = HOME_DEMOS;
  const count = demos.length;
  const loop = count > 1;

  const stage = demoTrack.closest('.demo-carousel-stage');
  const viewport = demoTrack.parentElement;
  const prevBtn = document.getElementById('demo-carousel-prev');
  const nextBtn = document.getElementById('demo-carousel-next');
  const dotsWrap = document.getElementById('demo-carousel-dots');
  const dotsTrack = document.getElementById('demo-carousel-dots-track');

  prevBtn.hidden = !loop;
  nextBtn.hidden = !loop;
  dotsWrap.hidden = !loop;

  function centerArrowsOnMedia() {
    const media = demoTrack.querySelector('.demo-card-media');
    if (!media) return;
    const stageRect = stage.getBoundingClientRect();
    const mediaRect = media.getBoundingClientRect();
    const top = mediaRect.top - stageRect.top + mediaRect.height / 2;
    prevBtn.style.top = `${top}px`;
    nextBtn.style.top = `${top}px`;
  }

  if (!loop) {
    demoTrack.innerHTML = demos.map(demoCardHTML).join('');
    centerArrowsOnMedia();
  } else {
    // For a seamless loop, render three back-to-back copies of the demo
    // list. The middle copy (indices count..count*2-1) is the "real" one
    // shown at rest; scrolling into either cloned copy on the sides
    // silently jumps back into the middle once the scroll settles, so the
    // carousel always has a neighbor to peek at in both directions.
    demoTrack.innerHTML = [demos, demos, demos].map((set) => set.map(demoCardHTML).join('')).join('');

    const cards = Array.from(demoTrack.querySelectorAll('.demo-card'));

    // The dots deliberately do NOT loop the way the cards do — they always
    // represent the real, linear demo order (0..count-1), so the window
    // reaching demo 1 or the last demo reads as an actual start/end rather
    // than "somewhere in an endless loop". One set is enough.
    dotsTrack.innerHTML = demos
      .map((_, i) => `<button type="button" class="demo-carousel-dot" data-index="${i}" aria-label="Go to demo ${i + 1}"></button>`)
      .join('');
    const dots = Array.from(dotsTrack.querySelectorAll('.demo-carousel-dot'));

    const cardCenterX = (card) => {
      const r = card.getBoundingClientRect();
      return r.left + r.width / 2;
    };
    const viewportCenterX = () => {
      const r = viewport.getBoundingClientRect();
      return r.left + r.width / 2;
    };

    function nearestCardIndex() {
      const target = viewportCenterX();
      let best = 0;
      let bestDist = Infinity;
      cards.forEach((card, i) => {
        const dist = Math.abs(cardCenterX(card) - target);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      return best;
    }

    function scrollToCardIndex(index, behavior) {
      const card = cards[index];
      if (!card) return;
      viewport.scrollBy({ left: cardCenterX(card) - viewportCenterX(), behavior });
    }

    function oneSetWidth() {
      // Distance from the first card to its equivalent one set over —
      // includes the trailing gap so consecutive copies tile exactly.
      return cards[count].getBoundingClientRect().left - cards[0].getBoundingClientRect().left;
    }

    function normalizeIfNeeded() {
      const idx = nearestCardIndex();
      if (idx < count) {
        viewport.scrollBy({ left: oneSetWidth(), behavior: 'auto' });
      } else if (idx >= count * 2) {
        viewport.scrollBy({ left: -oneSetWidth(), behavior: 'auto' });
      }
    }

    // "Dynamic bullets" pagination (the Swiper.js style referenced): a
    // fixed-width window shows only a handful of dots, the active one is
    // full-size, and dots shrink the further they sit from it (no wrap —
    // distance is plain, linear |realIndex - active|). The window's
    // position clamps at both ends instead of always centering the active
    // dot, so index 0 sits at the window's own left edge (nothing to its
    // left) and the last index sits at its right edge (nothing to its
    // right) — that's what reads as "start" and "end".
    const rootStyle = getComputedStyle(document.documentElement);
    // Read the size/gap (plain px values) and add them in JS rather than
    // reading --demo-dot-step directly — it's declared via calc() in CSS,
    // and getPropertyValue() returns custom properties as unevaluated
    // strings, so parseFloat() on a calc() expression would come out NaN.
    const dotStep = parseFloat(rootStyle.getPropertyValue('--demo-dot-size'))
      + parseFloat(rootStyle.getPropertyValue('--demo-dot-gap'));
    const dotVisible = parseFloat(rootStyle.getPropertyValue('--demo-dot-visible'));
    const centerSlot = Math.floor(dotVisible / 2);

    function updateDots() {
      const active = nearestCardIndex() % count;

      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === active);
        const dist = Math.abs(i - active);
        const scale = dist === 0 ? 1 : dist === 1 ? 0.66 : dist === 2 ? 0.33 : 0;
        dot.style.transform = `scale(${scale})`;
      });

      const firstVisible = Math.min(Math.max(active - centerSlot, 0), Math.max(count - dotVisible, 0));
      dotsTrack.style.transform = `translateX(${-firstVisible * dotStep}px)`;
    }

    let settleTimer = null;
    function onScroll() {
      updateDots();
      clearTimeout(settleTimer);
      settleTimer = setTimeout(normalizeIfNeeded, 120);
    }

    prevBtn.addEventListener('click', () => scrollToCardIndex(nearestCardIndex() - 1, 'smooth'));
    nextBtn.addEventListener('click', () => scrollToCardIndex(nearestCardIndex() + 1, 'smooth'));

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const target = Number(dot.dataset.index);
        // Jump to whichever of the three on-screen copies of that demo is
        // closest, so the scroll distance (and animation) stays short.
        const candidates = [target, target + count, target + count * 2];
        let best = candidates[0];
        let bestDist = Infinity;
        candidates.forEach((i) => {
          const dist = Math.abs(cardCenterX(cards[i]) - viewportCenterX());
          if (dist < bestDist) {
            bestDist = dist;
            best = i;
          }
        });
        scrollToCardIndex(best, 'smooth');
      });
    });

    viewport.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      centerArrowsOnMedia();
      scrollToCardIndex(nearestCardIndex(), 'auto');
    });

    centerArrowsOnMedia();
    // Start centered on the first real demo, with the last demo peeking
    // immediately to its left via the leading clone copy.
    scrollToCardIndex(count, 'auto');
    updateDots();
  }
}
