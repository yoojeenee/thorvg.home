const playgroundFilters = document.getElementById('playground-filters');
const playgroundGrid = document.getElementById('playground-grid');

if (playgroundFilters && playgroundGrid) {
  const chips = playgroundFilters.querySelectorAll('.filter-chip');
  const cards = Array.from(playgroundGrid.querySelectorAll('.playground-card'));

  cards
    .sort((a, b) => {
      const titleA = a.querySelector('.playground-card-title').textContent;
      const titleB = b.querySelector('.playground-card-title').textContent;
      return titleA.localeCompare(titleB, undefined, { sensitivity: 'base' });
    })
    .forEach((card) => playgroundGrid.appendChild(card));

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
