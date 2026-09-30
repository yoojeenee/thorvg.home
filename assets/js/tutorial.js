document.querySelectorAll('.lang-group').forEach((group) => {
  const groupButtons = group.querySelectorAll('.lang-tab');

  function setGroupLang(lang, anchorEl) {
    const beforeY = anchorEl ? anchorEl.getBoundingClientRect().top : null;

    group.setAttribute('data-lang', lang);
    groupButtons.forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.lang === lang);
    });

    if (anchorEl) {
      const afterY = anchorEl.getBoundingClientRect().top;
      window.scrollBy(0, afterY - beforeY);
    }
  }

  groupButtons.forEach((btn) => {
    btn.addEventListener('click', () => setGroupLang(btn.dataset.lang, btn));
  });

  setGroupLang(group.dataset.lang === 'js' ? 'js' : 'cpp');
});

// createCopyButton() and the generic .code-block copy-button wiring live in code-copy.js,
// loaded before this file.

document.querySelectorAll('.lang-tabs').forEach((tabs) => {
  const header = tabs.querySelector('.lang-tabs-header');
  const group = tabs.closest('.lang-group');
  const cppCode = tabs.querySelector(':scope > .lang-cpp code');
  const jsCode = tabs.querySelector(':scope > .lang-js code');
  if (!header || (!cppCode && !jsCode)) return;

  header.appendChild(createCopyButton(() => {
    const lang = group ? group.dataset.lang : 'cpp';
    const target = lang === 'js' ? jsCode : cppCode;
    return target ? target.textContent : '';
  }));
});
