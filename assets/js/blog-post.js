const COPY_ICON = '<svg viewBox="0 0 640 640" class="code-copy-icon" aria-hidden="true"><path d="M352 528L128 528C119.2 528 112 520.8 112 512L112 288C112 279.2 119.2 272 128 272L176 272L176 224L128 224C92.7 224 64 252.7 64 288L64 512C64 547.3 92.7 576 128 576L352 576C387.3 576 416 547.3 416 512L416 464L368 464L368 512C368 520.8 360.8 528 352 528zM288 368C279.2 368 272 360.8 272 352L272 128C272 119.2 279.2 112 288 112L512 112C520.8 112 528 119.2 528 128L528 352C528 360.8 520.8 368 512 368L288 368zM224 352C224 387.3 252.7 416 288 416L512 416C547.3 416 576 387.3 576 352L576 128C576 92.7 547.3 64 512 64L288 64C252.7 64 224 92.7 224 128L224 352z" fill="currentColor"/></svg>';
const CHECK_ICON = '<svg viewBox="0 0 640 640" class="code-check-icon" aria-hidden="true"><path d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z" fill="currentColor"/></svg>';

function createCopyButton(getText) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'code-copy-btn';
  button.setAttribute('aria-label', 'Copy to clipboard');
  button.innerHTML = COPY_ICON + CHECK_ICON;

  let resetTimer = null;

  button.addEventListener('click', () => {
    navigator.clipboard.writeText(getText()).then(() => {
      clearTimeout(resetTimer);
      button.classList.add('is-copied');
      resetTimer = setTimeout(() => {
        button.classList.remove('is-copied');
      }, 1800);
    });
  });

  return button;
}

const blogPostBody = document.getElementById('blog-post-body');

if (blogPostBody && typeof BLOG_POSTS !== 'undefined') {
  const blogPostTitle = document.getElementById('blog-post-title');
  const blogPostDate = document.getElementById('blog-post-date');
  const blogPostCategory = document.getElementById('blog-post-category');

  const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  function formatDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    return dateFormatter.format(new Date(year, month - 1, day));
  }

  function parseFrontMatter(text) {
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (!match) return { meta: {}, body: text };

    const meta = {};
    match[1].split(/\r?\n/).forEach((line) => {
      const index = line.indexOf(':');
      if (index > 0) {
        meta[line.slice(0, index).trim()] = line.slice(index + 1).trim().replace(/^["']|["']$/g, '');
      }
    });

    return { meta, body: text.slice(match[0].length) };
  }

  // Resolve relative media paths against the markdown file's folder, not the page's.
  function resolveMediaPaths(container, fileUrl) {
    container.querySelectorAll('img[src], video[src], source[src]').forEach((el) => {
      el.setAttribute('src', new URL(el.getAttribute('src'), fileUrl).href);
    });
  }

  // Turn images with a markdown title (![alt](src "caption")) into figure + figcaption.
  function addImageCaptions(container) {
    container.querySelectorAll('img[title]').forEach((img) => {
      const figure = document.createElement('figure');
      const figcaption = document.createElement('figcaption');
      figcaption.textContent = img.getAttribute('title');
      img.removeAttribute('title');

      const parent = img.parentElement;
      const isOnlyChildOfParagraph = parent.tagName === 'P' && parent.children.length === 1 && parent.textContent.trim() === '';

      (isOnlyChildOfParagraph ? parent : img).replaceWith(figure);
      figure.append(img, figcaption);
    });
  }

  function showPost(title, date, category) {
    document.title = title + ' — ThorVG';
    blogPostTitle.textContent = title;
    if (date) {
      blogPostDate.textContent = formatDate(date);
      blogPostDate.dateTime = date;
    }
    blogPostCategory.textContent = category || '';
  }

  // Tags and writer box below the body; hidden when the front-matter has neither.
  function showPostInfo(meta) {
    const info = document.getElementById('blog-post-info');
    const tagList = document.getElementById('blog-post-tags');
    const writer = document.getElementById('blog-post-writer');
    const writerName = document.getElementById('blog-post-writer-name');
    if (!info || !tagList || !writer || !writerName) return;

    const tags = (meta.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean);

    tagList.replaceChildren(...tags.map((tag) => {
      const item = document.createElement('li');
      item.textContent = tag;
      return item;
    }));
    tagList.hidden = tags.length === 0;

    writerName.textContent = meta.writer || '';
    writer.hidden = !meta.writer;

    info.hidden = tags.length === 0 && !meta.writer;
  }

  const id = new URLSearchParams(window.location.search).get('id');
  const post = BLOG_POSTS.find((item) => item.id === id);

  if (!post) {
    showPost('Post not found');
    blogPostBody.innerHTML = '<p>The requested post could not be found. Go back to the Blogs page to pick one.</p>';
  } else {
    showPost(post.title, post.date, post.category);

    if (viewEngineUnavailable) {
      blogPostBody.innerHTML = '<p>Opening this page directly from disk (file://) blocks loading post files. Run this site through a local server (e.g. <code>python3 -m http.server</code>) to read the post.</p>';
    } else {
      fetch(post.file)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load post');
          return res.text();
        })
        .then((text) => {
          const { meta, body } = parseFrontMatter(text);
          showPost(meta.title || post.title, meta.date || post.date, post.category);
          showPostInfo(meta);
          blogPostBody.innerHTML = marked.parse(body);
          resolveMediaPaths(blogPostBody, new URL(post.file, window.location.href));
          addImageCaptions(blogPostBody);
          blogPostBody.querySelectorAll('pre').forEach((pre) => {
            const code = pre.querySelector('code');
            pre.classList.add('code-block');
            pre.classList.toggle('is-single-line', !code.textContent.trim().includes('\n'));
            pre.appendChild(createCopyButton(() => code.textContent));
          });
        })
        .catch((error) => {
          console.error(error);
          blogPostBody.innerHTML = '<p>Unable to load this post.</p>';
        });
    }
  }
}
