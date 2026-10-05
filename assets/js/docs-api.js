(() => {
  const content = document.querySelector('.docs-content');
  const root = document.getElementById('api-root');
  const sidebar = document.getElementById('api-sidebar');
  if (!sidebar) return;
  const onApiPage = Boolean(content && root);

  const DATA_DIR = 'assets/data/api';
  const LANG_FOLDERS = { c: 'c', cpp: 'cpp', js: 'js' };
  const KIND_LABELS = {
    class: 'Class', struct: 'Struct', enum: 'Enum', handle: 'Handle', alias: 'Type alias',
    functions: 'Functions', interface: 'Interface', type: 'Type', function: 'Function', const: 'Constant',
  };

  const NOTE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 9 1.6714 C 13.0371 1.6714 16.3286 4.9629 16.3286 9 C 16.3286 13.0371 13.0371 16.3286 9 16.3286 C 7.0574 16.3252 5.1953 15.552 3.8217 14.1783 C 2.448 12.8047 1.6748 10.9426 1.6714 9 C 1.6714 4.9629 4.9629 1.6714 9 1.6714 Z M 9 0 C 4.0371 0 0 4.0371 0 9 C 0 13.9629 4.0371 18 9 18 C 13.9629 18 18 13.9629 18 9 C 18 4.0371 13.9629 0 9 0 Z M 10.2857 3.8571 H 7.7143 V 10.2857 H 10.2857 V 3.8571 Z M 10.2857 11.5714 H 7.7143 V 14.1429 H 10.2857 V 11.5714 Z" fill="currentColor" stroke="none" fill-rule="evenodd" clip-rule="evenodd"></path></svg>';
  const WARNING_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M 9 6.75 v 1.5 m 0 3 h 0.0075 m -5.2035 3 h 10.392 c 1.155 0 1.8765 -1.2503 1.299 -2.25 L 10.299 3 c -0.5775 -0.9997 -2.0205 -0.9997 -2.598 0 L 2.505 12 c -0.5775 0.9997 0.144 2.25 1.299 2.25 z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
  const indexCache = {};
  const entityCache = {};
  let renderToken = 0;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const API_NAME_RE = /\b(?:[A-Za-z_]\w*::)+\w+(?:\(\))?|\btvg_\w+(?:\(\))?|\bTvg_\w+|\bTVG_\w+/g;

  function inline(text) {
    return escapeHtml(text)
      .split(/(`[^`]+`)/)
      .map((part) => (part.startsWith('`')
        ? `<code>${part.slice(1, -1)}</code>`
        : part.replace(API_NAME_RE, '<code>$&</code>')))
      .join('')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }

  function paragraph(text, className) {
    return `<p${className ? ` class="${className}"` : ''}>${inline(text)}</p>`;
  }

  function anchorId(...parts) {
    return parts.join('-').replace(/[^A-Za-z0-9_-]+/g, '_');
  }

  function table(headers, rows) {
    if (!rows.length) return '';
    const head = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('');
    const body = rows.map((cells) => `<tr>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('');
    return `<div class="api-table-wrap"><table class="api-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  }

  function codeBlock(code) {
    return `<pre class="code-block"><code>${escapeHtml(code)}</code></pre>`;
  }

  function badges(item) {
    const out = [];
    if (item.experimental) out.push('<span class="api-badge is-experimental">Experimental</span>');
    if (item.since) out.push(`<span class="api-badge">Since ${escapeHtml(item.since)}</span>`);
    return out.join('');
  }

  function trimPleaseNote(text) {
    const trimmed = text.replace(/^please note( that)?\s*/i, '');
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }

  function noteCallout(text) {
    return `<div class="api-callout" role="note"><span class="api-callout-icon" aria-hidden="true">${NOTE_ICON}</span><div class="api-callout-body">${paragraph(text)}</div></div>`;
  }

  function sectionBody(item) {
    const parts = [];
    if (item.deprecated) parts.push(`<p class="api-deprecated"><strong>Deprecated.</strong> ${inline(item.deprecated)}</p>`);
    if (item.description && item.description.length) {
      parts.push(...item.description.map((p) => (/^please note\b/i.test(p) ? noteCallout(trimPleaseNote(p)) : paragraph(p))));
    }
    if (item.notes && item.notes.length) {
      parts.push(...item.notes.filter((n) => !/^experimental api\.?$/i.test(n.trim())).map((n) => noteCallout(n)));
    }
    if (item.warnings && item.warnings.length) {
      parts.push(...item.warnings.map((w) => `<div class="api-callout is-warning" aria-label="Warning"><span class="api-callout-icon" aria-hidden="true">${WARNING_ICON}</span><div class="api-callout-body">${paragraph(w)}</div></div>`));
    }
    return parts.join('');
  }

  function paramsTable(params) {
    if (!params || !params.length) return '';
    return table(['Parameter', 'Description'], params.map((p) => [
      `<code>${escapeHtml(p.name)}</code>${p.direction ? ` <span class="api-direction">${escapeHtml(p.direction)}</span>` : ''}`,
      inline(p.description || ''),
    ]));
  }

  function retvalsTable(retvals) {
    if (!retvals || !retvals.length) return '';
    return table(['Return value', 'Description'], retvals.map((r) => [
      `<code>${escapeHtml(r.value)}</code>`, inline(r.description || ''),
    ]));
  }

  function seeList(see) {
    if (!see || !see.length) return '';
    return `<p class="api-see"><strong>See also:</strong> ${see.map((s) => `<code>${escapeHtml(s)}</code>`).join(', ')}</p>`;
  }

  function examples(list) {
    if (!list || !list.length) return '';
    return list.map((code) => codeBlock(code)).join('');
  }

  function renderMember(entity, member, idx) {
    const id = anchorId(entity.name, member.name, idx);
    const heading = `<h3 id="${id}">${escapeHtml(member.name)}</h3>`;
    const signature = member.signature ? codeBlock(member.signature) : '';
    const brief = member.brief ? paragraph(member.brief) : '';
    const returns = member.returns ? `<p class="api-returns"><strong>Returns.</strong> ${inline(member.returns)}</p>` : '';
    const meta = badges(member);
    return `<section class="api-member">${heading}${meta ? `<p class="api-member-meta">${meta}</p>` : ''}${signature}${brief}${sectionBody(member)}${paramsTable(member.params)}${returns}${retvalsTable(member.retvals)}${examples(member.examples)}${seeList(member.see)}</section>`;
  }

  function renderEnumerators(members) {
    const rows = members.map((m) => [
      `<code>${escapeHtml(m.name)}</code>`,
      m.value ? `<code>${escapeHtml(m.value)}</code>` : '',
      inline(m.brief || '') + (m.experimental ? ' <span class="api-badge is-experimental">Experimental</span>' : ''),
    ]);
    return table(['Name', 'Value', 'Description'], rows);
  }

  function renderFields(members) {
    const rows = members.map((m) => [
      `<code>${escapeHtml(m.name)}</code>`,
      m.type ? `<code>${escapeHtml(m.type)}</code>` : '',
      inline(m.brief || '') + (m.experimental ? ' <span class="api-badge is-experimental">Experimental</span>' : ''),
    ]);
    return table(['Name', 'Type', 'Description'], rows);
  }

  function renderEntity(entity) {
    const parts = [];
    parts.push(`<h1>${escapeHtml(entity.name)}</h1>`);

    const metaBits = [KIND_LABELS[entity.kind] || entity.kind];
    if (entity.base) metaBits.push(`extends <code>${escapeHtml(entity.base)}</code>`);
    if (entity.category) metaBits.push(escapeHtml(entity.category));
    const meta = `<p class="api-meta">${metaBits.join(' · ')} ${badges(entity)}</p>`;
    parts.push(meta);

    if (entity.brief) parts.push(paragraph(entity.brief, 'api-brief'));
    parts.push(sectionBody(entity));
    parts.push(examples(entity.examples));
    parts.push(seeList(entity.see));

    if (entity.underlying) {
      parts.push(`<p class="api-meta">Underlying type: <code>${escapeHtml(entity.underlying)}</code></p>`);
    }
    if (entity.kind === 'enum') {
      parts.push(renderEnumerators(entity.members));
    } else {
      const fields = entity.members.filter((m) => !m.signature);
      const methods = entity.members.filter((m) => m.signature);
      if (fields.length) parts.push(entity.kind === 'enum' ? '' : renderFields(fields));
      methods.forEach((m, i) => parts.push(renderMember(entity, m, i)));
    }

    if (entity.nested && entity.nested.length) {
      entity.nested.forEach((n) => {
        parts.push(`<h2 id="${anchorId(entity.name, n.name)}">${escapeHtml(entity.name)}::${escapeHtml(n.name)}</h2>`);
        if (n.brief) parts.push(paragraph(n.brief));
        parts.push(renderFields(n.members.filter((m) => !m.signature)));
      });
    }

    if (entity.source) {
      parts.push(`<p class="api-source">Source: <code>${escapeHtml(entity.source)}</code></p>`);
    }
    return parts.join('');
  }

  async function loadJson(path, cache) {
    if (!cache[path]) {
      cache[path] = fetch(path).then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
        return res.json();
      });
    }
    return cache[path];
  }

  function currentLang() {
    if (!onApiPage) return (typeof getStoredDocsLang === 'function' && getStoredDocsLang()) || 'cpp';
    return LANG_FOLDERS[content.dataset.lang] ? content.dataset.lang : 'cpp';
  }

  function findItem(index, name) {
    for (const group of index.groups) {
      const item = group.items.find((i) => i.name === name);
      if (item) return item;
    }
    return null;
  }

  const CARET_SVG = '<svg class="docs-sidebar-caret" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 6" fill="none" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="m.646 1.352.707-.707 3.65 3.646L8.647.651l.707.707-4.35 4.347z" clip-rule="evenodd"></path></svg>';

  function buildSidebar(index, activeName) {
    sidebar.textContent = '';
    index.groups.forEach((group, groupIndex) => {
      const subId = `api-group-${groupIndex}-subnav`;

      const list = document.createElement('ul');
      list.className = 'docs-sidebar-list';

      const item = document.createElement('li');
      item.className = 'docs-sidebar-item';

      const row = document.createElement('div');
      row.className = 'docs-sidebar-item-row';

      const label = document.createElement('span');
      label.className = 'docs-sidebar-link';
      label.textContent = group.title;

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'docs-sidebar-toggle';
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-controls', subId);
      toggle.setAttribute('aria-label', `Toggle ${group.title} subsections`);
      toggle.innerHTML = CARET_SVG;

      row.append(label, toggle);

      const sub = document.createElement('ul');
      sub.className = 'docs-sidebar-sublist';
      sub.id = subId;
      group.items.forEach((entry) => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.className = 'docs-sidebar-link docs-sidebar-sub';
        link.href = `${onApiPage ? '' : 'docs-api.html'}#${encodeURIComponent(entry.name)}`;
        link.textContent = entry.name;
        if (entry.name === activeName) link.classList.add('is-active');
        li.appendChild(link);
        sub.appendChild(li);
      });

      item.append(row, sub);
      list.appendChild(item);
      sidebar.appendChild(list);
    });
  }

  sidebar.addEventListener('click', (event) => {
    const toggle = event.target.closest('.docs-sidebar-toggle');
    if (!toggle) return;
    const item = toggle.closest('.docs-sidebar-item');
    const collapsed = item.classList.toggle('is-collapsed');
    toggle.setAttribute('aria-expanded', String(!collapsed));
  });

  function showMessage(text) {
    root.textContent = '';
    const p = document.createElement('p');
    p.className = 'api-loading';
    p.textContent = text;
    root.appendChild(p);
  }

  async function render(scrollIntoView, selectFirst = false) {
    const token = ++renderToken;
    const lang = currentLang();
    try {
      const index = await loadJson(`${DATA_DIR}/${LANG_FOLDERS[lang]}/index.json`, indexCache);
      if (token !== renderToken) return;

      if (!onApiPage) {
        buildSidebar(index, null);
        return;
      }

      const requested = decodeURIComponent(location.hash.slice(1));
      const item = (!selectFirst && findItem(index, requested)) || index.groups[0].items[0];
      if (selectFirst) history.replaceState(null, '', `#${encodeURIComponent(item.name)}`);
      buildSidebar(index, item.name);

      const entity = await loadJson(`${DATA_DIR}/${LANG_FOLDERS[lang]}/${item.file}`, entityCache);
      if (token !== renderToken) return;

      root.innerHTML = renderEntity(entity);
      root.querySelectorAll('.code-block').forEach((block) => {
        const code = block.querySelector('code');
        block.classList.toggle('is-single-line', !code.textContent.includes('\n'));
        block.appendChild(createCopyButton(() => code.textContent));
      });
      if (scrollIntoView) root.scrollIntoView({ block: 'start' });
    } catch (error) {
      if (token !== renderToken) return;
      if (onApiPage) showMessage('The API reference data could not be loaded. Serve the site over HTTP (e.g. python3 -m http.server) and make sure assets/data/api exists.');
      console.error(error);
    }
  }

  if (onApiPage) {
    window.addEventListener('hashchange', () => render(true));
  }

  if (content) {
    new MutationObserver(() => render(false, onApiPage)).observe(content, {
      attributes: true,
      attributeFilter: ['data-lang'],
    });
  }

  render(false);
})();
