// Generates abstract, on-brand SVG cover art for games/products.
// No external image sources — everything here is procedurally drawn
// so there's zero copyright/trademark risk and zero network dependency.
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

const BG = "#07070a";
const SURFACE = "#0e0e14";
const BORDER = "#2a2a38";

function grid(w, h, id) {
  return `
    <defs>
      <pattern id="${id}" width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M 48 0 L 0 0 0 48" fill="none" stroke="${BORDER}" stroke-width="1" opacity="0.35"/>
      </pattern>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#${id})"/>
  `;
}

function glow(cx, cy, r, color, id) {
  return `
    <defs>
      <radialGradient id="${id}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/>
  `;
}

function xAccent(w, h, color) {
  const s = Math.min(w, h) * 0.22;
  return `
    <g opacity="0.5" stroke="${color}" stroke-width="2.5" stroke-linecap="round">
      <path d="M ${w - s - 30} 30 L ${w - 30} 30 L ${w - 30} ${s + 30}" fill="none"/>
      <path d="M 30 ${h - s - 30} L 30 ${h - 30} L ${s + 30} ${h - 30}" fill="none"/>
    </g>
  `;
}

function particles(w, h, color, count, seed) {
  let out = "";
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i < count; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const r = 1.5 + rand() * 2.5;
    const o = 0.2 + rand() * 0.5;
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${color}" opacity="${o.toFixed(2)}"/>`;
  }
  return out;
}

function svgWrap(w, h, inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${BG}"/>
  ${inner}
</svg>`;
}

// ---- game emblems (abstract, not trademarked) ----

function emblemCubes(cx, cy, size, color) {
  // Interlocking rounded squares — generic "blocky world" motif.
  const s = size * 0.55;
  return `
    <g transform="translate(${cx} ${cy})" opacity="0.9">
      <rect x="${-s}" y="${-s * 0.3}" width="${s}" height="${s}" rx="14" fill="none" stroke="${color}" stroke-width="4" transform="rotate(-8)"/>
      <rect x="${-s * 0.2}" y="${-s * 0.75}" width="${s}" height="${s}" rx="14" fill="${color}" opacity="0.85" transform="rotate(6)"/>
      <rect x="${-s * 0.55}" y="${s * 0.05}" width="${s * 0.7}" height="${s * 0.7}" rx="12" fill="none" stroke="${color}" stroke-width="3" opacity="0.7" transform="rotate(-14)"/>
    </g>
  `;
}

function emblemBlob(cx, cy, size, color) {
  // Organic rounded blob with a small stem — abstract "fruit" vibe.
  const r = size * 0.42;
  return `
    <g transform="translate(${cx} ${cy})" opacity="0.9">
      <path d="M0 ${-r} C ${r * 1.1} ${-r} ${r * 1.15} ${r * 0.9} 0 ${r} C ${-r * 1.15} ${r * 0.9} ${-r * 1.1} ${-r} 0 ${-r} Z"
        fill="${color}" opacity="0.85"/>
      <path d="M0 ${-r * 1.05} C 6 ${-r * 1.35}, 18 ${-r * 1.4}, 22 ${-r * 1.55}"
        fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/>
    </g>
  `;
}

function emblemPixelGrid(cx, cy, size, color) {
  // 3x3 offset cube grid — generic voxel motif.
  const cell = size * 0.26;
  const gap = cell * 0.18;
  let out = `<g transform="translate(${cx - cell * 1.5} ${cy - cell * 1.5})" opacity="0.9">`;
  const positions = [
    [0, 0, 0.9], [1, 0, 0.5], [2, 0, 0.7],
    [0, 1, 0.6], [1, 1, 1], [2, 1, 0.55],
    [0, 2, 0.75], [1, 2, 0.45], [2, 2, 0.85],
  ];
  for (const [gx, gy, o] of positions) {
    const x = gx * (cell + gap);
    const y = gy * (cell + gap);
    out += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="4" fill="${color}" opacity="${o}"/>`;
  }
  out += "</g>";
  return out;
}

function emblemBlade(cx, cy, size, color) {
  // Angular triangle cluster — sharp/competitive vibe.
  const s = size * 0.55;
  return `
    <g transform="translate(${cx} ${cy})" opacity="0.9">
      <path d="M0 ${-s} L ${s * 0.55} ${s * 0.3} L 0 ${s * 0.05} L ${-s * 0.55} ${s * 0.3} Z" fill="${color}" opacity="0.85"/>
      <path d="M0 ${-s * 0.5} L ${s * 0.85} ${s * 0.55} L 0 ${s * 0.7} L ${-s * 0.85} ${s * 0.55} Z" fill="none" stroke="${color}" stroke-width="3" opacity="0.6"/>
    </g>
  `;
}

function emblemGem(cx, cy, size, color) {
  const s = size * 0.5;
  return `
    <g transform="translate(${cx} ${cy})" opacity="0.95">
      <path d="M ${-s} ${-s * 0.35} L 0 ${-s} L ${s} ${-s * 0.35} L ${s * 0.6} ${s * 0.75} L 0 ${s} L ${-s * 0.6} ${s * 0.75} Z"
        fill="${color}" opacity="0.85"/>
      <path d="M ${-s} ${-s * 0.35} L 0 ${-s * 0.1} L ${s} ${-s * 0.35} M 0 ${-s * 0.1} L 0 ${s}"
        fill="none" stroke="${BG}" stroke-width="3" opacity="0.5"/>
    </g>
  `;
}

const GAMES = [
  { file: "roblox.svg", accent: "#8b5cf6", emblem: emblemCubes, seed: 11 },
  { file: "blox-fruits.svg", accent: "#a78bfa", emblem: emblemBlob, seed: 22 },
  { file: "minecraft.svg", accent: "#7c6df2", emblem: emblemPixelGrid, seed: 33 },
  { file: "valorant.svg", accent: "#c4b5fd", emblem: emblemBlade, seed: 44 },
];

function renderGameCover({ accent, emblem, seed }) {
  const w = 800, h = 1000;
  const inner = `
    ${grid(w, h, "grid")}
    ${glow(w * 0.75, h * 0.25, 420, accent, "glow1")}
    ${glow(w * 0.2, h * 0.85, 320, accent, "glow2")}
    ${particles(w, h, accent, 22, seed)}
    ${emblem(w / 2, h * 0.42, 340, accent)}
    ${xAccent(w, h, accent)}
    <rect x="1" y="1" width="${w - 2}" height="${h - 2}" fill="none" stroke="${BORDER}" stroke-width="2"/>
  `;
  return svgWrap(w, h, inner);
}

const PRODUCTS = [
  { file: "roblox-gift-card-100.svg", accent: "#8b5cf6", scale: 0.7, particleCount: 8, seed: 101 },
  { file: "roblox-gift-card-250.svg", accent: "#9370f5", scale: 0.8, particleCount: 12, seed: 102 },
  { file: "roblox-gift-card-500.svg", accent: "#a78bfa", scale: 0.9, particleCount: 16, seed: 103 },
  { file: "roblox-gift-card-800.svg", accent: "#b7a3fc", scale: 1.0, particleCount: 22, seed: 104 },
  { file: "roblox-gift-card-1700.svg", accent: "#c4b5fd", scale: 1.15, particleCount: 30, seed: 105 },

  { file: "blox-fruits-robux-400.svg", accent: "#a78bfa", scale: 0.75, particleCount: 10, seed: 201, emblem: emblemBlob },
  { file: "blox-fruits-robux-800.svg", accent: "#b291fb", scale: 0.9, particleCount: 16, seed: 202, emblem: emblemBlob },
  { file: "blox-fruits-robux-1700.svg", accent: "#bda2fc", scale: 1.0, particleCount: 22, seed: 203, emblem: emblemBlob },
  { file: "blox-fruits-robux-4500.svg", accent: "#c9b6fd", scale: 1.2, particleCount: 30, seed: 204, emblem: emblemBlob },

  { file: "minecraft-game-key.svg", accent: "#7c6df2", scale: 1.0, particleCount: 18, seed: 301, emblem: emblemPixelGrid },
  { file: "minecraft-minecoins-320.svg", accent: "#7c6df2", scale: 0.75, particleCount: 10, seed: 302, emblem: emblemPixelGrid },
  { file: "minecraft-minecoins-1020.svg", accent: "#897bf3", scale: 0.9, particleCount: 16, seed: 303, emblem: emblemPixelGrid },
  { file: "minecraft-minecoins-1720.svg", accent: "#9689f5", scale: 1.0, particleCount: 22, seed: 304, emblem: emblemPixelGrid },
  { file: "minecraft-minecoins-3500.svg", accent: "#a397f6", scale: 1.2, particleCount: 30, seed: 305, emblem: emblemPixelGrid },

  { file: "valorant-vp-475.svg", accent: "#c4b5fd", scale: 0.75, particleCount: 10, seed: 401, emblem: emblemBlade },
  { file: "valorant-vp-1000.svg", accent: "#cabefd", scale: 0.9, particleCount: 16, seed: 402, emblem: emblemBlade },
  { file: "valorant-vp-2050.svg", accent: "#d1c7fe", scale: 1.0, particleCount: 22, seed: 403, emblem: emblemBlade },
  { file: "valorant-vp-3650.svg", accent: "#d8d1fe", scale: 1.15, particleCount: 28, seed: 404, emblem: emblemBlade },
  { file: "valorant-vp-5350.svg", accent: "#dfdbff", scale: 1.3, particleCount: 34, seed: 405, emblem: emblemBlade },
];

function renderProductCover({ accent, scale, particleCount, seed, emblem = emblemGem }) {
  const w = 800, h = 800;
  const inner = `
    ${grid(w, h, "grid")}
    ${glow(w / 2, h / 2, 300 * scale, accent, "glow1")}
    ${particles(w, h, accent, particleCount, seed)}
    ${emblem(w / 2, h / 2, 340 * scale, accent)}
    ${xAccent(w, h, accent)}
    <rect x="1" y="1" width="${w - 2}" height="${h - 2}" fill="none" stroke="${BORDER}" stroke-width="2"/>
  `;
  return svgWrap(w, h, inner);
}

mkdirSync(path.join(ROOT, "public/games"), { recursive: true });
mkdirSync(path.join(ROOT, "public/products"), { recursive: true });

for (const game of GAMES) {
  const svg = renderGameCover(game);
  writeFileSync(path.join(ROOT, "public/games", game.file), svg, "utf8");
  console.log("wrote", game.file);
}

for (const product of PRODUCTS) {
  const svg = renderProductCover(product);
  writeFileSync(path.join(ROOT, "public/products", product.file), svg, "utf8");
  console.log("wrote", product.file);
}
