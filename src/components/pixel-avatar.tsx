const palette = [
  ["#0f766e", "#14b8a6", "#ccfbf1"],
  ["#1d4ed8", "#60a5fa", "#dbeafe"],
  ["#7c3aed", "#a78bfa", "#ede9fe"],
  ["#be123c", "#fb7185", "#ffe4e6"],
  ["#b45309", "#f59e0b", "#fef3c7"],
  ["#15803d", "#4ade80", "#dcfce7"],
];

function hashSeed(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function getPixels(seed: number) {
  const pixels: boolean[] = [];

  for (let row = 0; row < 5; row += 1) {
    const left = [
      Boolean(seed & (1 << (row * 3))),
      Boolean(seed & (1 << (row * 3 + 1))),
      Boolean(seed & (1 << (row * 3 + 2))),
    ];

    pixels.push(left[0], left[1], left[2], left[1], left[0]);
  }

  return pixels;
}

export function PixelAvatar({
  name,
  className = "",
}: {
  name?: string | null;
  className?: string;
}) {
  const seed = hashSeed(name || "admin");
  const colors = palette[seed % palette.length];
  const pixels = getPixels(seed || 1);

  return (
    <div
      aria-hidden="true"
      className={`grid shrink-0 grid-cols-5 overflow-hidden rounded-full p-1 ${className}`}
      style={{ backgroundColor: colors[2] }}
    >
      {pixels.map((filled, index) => (
        <span
          className="aspect-square"
          key={index}
          style={{
            backgroundColor: filled ? colors[index % 2] : "transparent",
          }}
        />
      ))}
    </div>
  );
}
