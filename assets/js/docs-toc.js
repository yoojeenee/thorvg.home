const tocFloatList = document.querySelector('.docs-toc-float-list');
const tocFloatRail = document.querySelector('.docs-toc-float-rail');
const tocFloatIndicator = document.querySelector('.docs-toc-float-indicator');

if (tocFloatList) {
  const tocLinks = Array.from(tocFloatList.querySelectorAll('a[href^="#"]'));
  const sections = tocLinks
    .map((link) => {
      const heading = document.getElementById(link.getAttribute('href').slice(1));
      return heading ? { link, li: link.closest('li'), heading } : null;
    })
    .filter(Boolean);

  const HEADER_OFFSET = 96;

  function updateActiveTocLink() {
    if (!sections.length) return;
    const scrollPos = window.scrollY + HEADER_OFFSET;
    let activeIndex = 0;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].heading.offsetTop <= scrollPos) {
        activeIndex = i;
      } else {
        break;
      }
    }
    sections.forEach((section, i) => {
      section.link.classList.toggle('is-active', i === activeIndex);
    });

    if (tocFloatIndicator && tocFloatRail) {
      const activeLi = sections[activeIndex].li;
      const railRect = tocFloatRail.getBoundingClientRect();
      const liRect = activeLi.getBoundingClientRect();
      tocFloatIndicator.style.transform = `translateY(${liRect.top - railRect.top}px)`;
      tocFloatIndicator.style.height = `${liRect.height}px`;
    }
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveTocLink();
        ticking = false;
      });
      ticking = true;
    }
  });

  window.addEventListener('resize', updateActiveTocLink);
  updateActiveTocLink();
}
