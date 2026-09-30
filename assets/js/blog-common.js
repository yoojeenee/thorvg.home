// Shared helpers for blog.html (list) and blog-post.html (detail), both of
// which read post metadata straight out of each markdown file's front matter
// instead of a hand-maintained data file.

const blogDateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function formatDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return blogDateFormatter.format(new Date(year, month - 1, day));
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

// A post's id is its filename without the folder or the .md extension, so
// blog-post.html?id=<id> can fetch it directly without a lookup table.
function blogFileToId(file) {
  return file.split('/').pop().replace(/\.md$/, '');
}

function blogIdToFile(id) {
  return 'blog-post/' + id + '.md';
}

// The list page's category filter (All / Milestone / Release) matches the
// first tag in the front matter's `tags` field.
function blogCategoryFromMeta(meta) {
  return (meta.tags || 'Uncategorized').split(',')[0].trim();
}
