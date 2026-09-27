const menuToggle = document.getElementById('menu-toggle');
const mainNav = document.getElementById('main-nav');
const menuIcon = menuToggle ? menuToggle.querySelector('.menu-icon') : null;
const navDropdown = document.getElementById('resources-dropdown');
const navDropdownTrigger = navDropdown ? navDropdown.querySelector('.nav-dropdown-trigger') : null;

function setDropdownOpen(isOpen) {
  if (!navDropdown || !navDropdownTrigger) return;
  navDropdown.classList.toggle('is-open', isOpen);
  navDropdownTrigger.setAttribute('aria-expanded', String(isOpen));
}

function setMenuOpen(isOpen) {
  mainNav.classList.toggle('is-open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Toggle menu');
  if (menuIcon) {
    menuIcon.src = isOpen ? 'assets/icons/close.svg' : 'assets/icons/menu.svg';
  }
  if (!isOpen) {
    setDropdownOpen(false);
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

if (navDropdown && navDropdownTrigger) {
  navDropdownTrigger.addEventListener('click', (event) => {
    event.stopPropagation();
    setDropdownOpen(!navDropdown.classList.contains('is-open'));
  });

  document.addEventListener('click', (event) => {
    if (!navDropdown.contains(event.target)) {
      setDropdownOpen(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setDropdownOpen(false);
    }
  });
}

const viewEngineUnavailable = window.location.protocol === 'file:';
