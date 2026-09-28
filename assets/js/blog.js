const blogFilterTabs = document.getElementById('blog-filter-tabs');
const blogList = document.getElementById('blog-list');

if (blogFilterTabs && blogList && typeof BLOG_POSTS !== 'undefined') {
  const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  function formatDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    return dateFormatter.format(new Date(year, month - 1, day));
  }

  const posts = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));

  const emptyState = document.createElement('p');
  emptyState.className = 'blog-empty-state';
  emptyState.textContent = 'No posts in this category yet.';
  emptyState.hidden = true;
  blogList.appendChild(emptyState);

  posts.forEach((post) => {
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
        '<h2 class="blog-list-title">' + post.title + '</h2>' +
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
