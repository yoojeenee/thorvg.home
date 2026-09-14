const menuToggle = document.getElementById('menu-toggle');
const mainNav = document.getElementById('main-nav');
const menuIcon = menuToggle ? menuToggle.querySelector('.menu-icon') : null;

function setMenuOpen(isOpen) {
  mainNav.classList.toggle('is-open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Toggle menu');
  if (menuIcon) {
    menuIcon.src = isOpen ? 'assets/icons/close.svg' : 'assets/icons/menu.svg';
  }
}

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    setMenuOpen(!mainNav.classList.contains('is-open'));
  });

  mainNav.addEventListener('click', (event) => {
    if (event.target.tagName === 'A') {
      setMenuOpen(false);
    }
  });
}

const viewEngineUnavailable = window.location.protocol === 'file:';
