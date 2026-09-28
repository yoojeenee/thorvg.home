// Demos shown in the homepage carousel. Mirrors the "ThorVG Demo" entries
// on showcase.html — add new items here as more demos become available.
//
// NOTE: only "Thor Janitor" is a real demo today. The other 11 entries below
// are placeholders (numbered, generated placeholder tiles) used to build out
// and verify the carousel layout ahead of the real content — swap `image`
// and `title` for the real thing as each demo is ready, no other changes needed.
function placeholderTile(label, hue) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">
    <rect width="640" height="480" fill="hsl(${hue}, 12%, 90%)"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
      font-family="sans-serif" font-size="28" fill="hsl(${hue}, 12%, 55%)">${label}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const HOME_DEMOS = [
  {
    id: "thor-janitor",
    title: "Thor Janitor",
    image: "assets/images/demo/thor-janitor.jpg",
    href: "showcase.html#thor-janitor",
  },
  ...Array.from({ length: 11 }, (_, i) => ({
    id: `placeholder-${i + 2}`,
    title: `Demo ${i + 2}`,
    image: placeholderTile(`Demo ${i + 2}`, (i * 33) % 360),
    href: "showcase.html#thorvg-demo",
  })),
];
