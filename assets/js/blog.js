const blogFilterTabs = document.getElementById('blog-filter-tabs');
const blogList = document.getElementById('blog-list');

if (blogFilterTabs && blogList && typeof BLOG_POST_FILES !== 'undefined') {
  const emptyState = document.createElement('p');
  emptyState.className = 'blog-empty-state';
  emptyState.textContent = 'No posts in this category yet.';
  emptyState.hidden = true;
  blogList.appendChild(emptyState);

  function renderPosts(posts) {
    posts
      .sort((a, b) => b.date.localeCompare(a.date))
      .forEach((post) => {
        const item = document.createElement('a');
        item.className = 'blog-list-item';
        item.href = 'blog-post.html?id=' + post.id;
        item.dataset.category = post.category;

        item.innerHTML =
          '<div class="blog-list-meta">' +
            '<span class="blog-list-category">' + post.category + '</span>' +
            '<time class="blog-list-date" datetime="' + post.date + '">' + formatDate(post.date) + '</time>' +
          '</div>' +
          '<div class="blog-list-body">' +
            '<h2 class="blog-list-title">' +
              '<span class="blog-list-title-text">' + post.title + '</span>' +
              (post.version ? '<span class="blog-list-version">' + post.version + '</span>' : '') +
            '</h2>' +
            '<p class="blog-list-excerpt">' + post.excerpt + '</p>' +
          '</div>';

        blogList.insertBefore(item, emptyState);
      });

    const tabs = blogFilterTabs.querySelectorAll('a');
    const items = blogList.querySelectorAll('.blog-list-item');

    tabs.forEach((tab) => {
      tab.addEventListener('click', (event) => {
        event.preventDefault();

        const filter = tab.dataset.filter;

        tabs.forEach((t) => t.classList.toggle('is-active', t === tab));

        let visibleCount = 0;

        items.forEach((item) => {
          const show = filter === 'All' || item.dataset.category === filter;
          item.hidden = !show;
          if (show) visibleCount += 1;
        });

        emptyState.hidden = visibleCount !== 0;
      });
    });
  }

  if (viewEngineUnavailable) {
    emptyState.textContent = 'Opening this page directly from disk (file://) blocks loading post files. Run this site through a local server (e.g. python3 -m http.server) to read the posts.';
    emptyState.hidden = false;
  } else {
    Promise.all(
      BLOG_POST_FILES.map((file) =>
        fetch(file)
          .then((res) => {
            if (!res.ok) throw new Error('Failed to load ' + file);
            return res.text();
          })
          .then((text) => {
            const { meta } = parseFrontMatter(text);
            return {
              id: blogFileToId(file),
              file,
              title: meta.title || blogFileToId(file),
              date: meta.date || '',
              category: blogCategoryFromMeta(meta),
              version: meta.version || '',
              excerpt: meta.excerpt || '',
            };
          })
          .catch((error) => {
            console.error(error);
            return null;
          })
      )
    ).then((posts) => {
      const loaded = posts.filter(Boolean);
      renderPosts(loaded);
      if (!loaded.length) {
        emptyState.textContent = 'Unable to load posts.';
        emptyState.hidden = false;
      }
    });
  }
}
