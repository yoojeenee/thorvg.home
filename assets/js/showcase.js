const showcaseFilters = document.getElementById('showcase-filters');

if (showcaseFilters) {
  const chips = showcaseFilters.querySelectorAll('.filter-chip');
  const sections = document.querySelectorAll('.showcase-list');

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const filter = chip.dataset.filter;

      chips.forEach((c) => c.classList.toggle('is-active', c === chip));

      sections.forEach((section) => {
        section.hidden = section.id !== filter;
      });
    });
  });
}
