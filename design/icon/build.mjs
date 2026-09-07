// Single source for every JGym icon: the Android adaptive icon (vector + legacy
// PNGs), the Play Store image and the web/PWA icons.
//
//   node design/icon/build.mjs
//
// The mark is a dumbbell tilted 45 degrees so it climbs to the right — the same
// direction the app's progress charts run. Everything it draws stays inside the
// 66dp circle Android's tightest launcher mask reveals, so nothing clips.
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const res = join(root, 'android', 'app', 'src', 'main', 'res');

const CANVAS = 108;
const C = CANVAS / 2; // 54 — centre of the adaptive canvas
const SAFE_R = 33; // 66dp circle: no drawn point may sit further out

// --- the mark, drawn flat and rotated as a whole -----------------------------
// [x, y, w, h, r]. Plate sizes step down outwards so the silhouette has a
// hierarchy instead of five near-identical slabs.
const BAR = [37.6, 50, 32.8, 8, 2.2];
const PLATES = [
  [28.6, 41, 9.4, 26, 2.8],
  [70, 41, 9.4, 26, 2.8],
  [23.6, 45.5, 4.2, 17, 1.5],
  [80.2, 45.5, 4.2, 17, 1.5],
];
const TILT = -45;

const BRAND = '#F5E642';
const PLATE_STOPS = [
  [0, '#FFF27E'],
  [0.45, BRAND],
  [1, '#C9A614'],
];
// The bar sits a shade darker than the plates so the joins read as edges
// without needing gaps, which would break the silhouette up at 48px.
const BAR_STOPS = [
  [0, '#E9D63C'],
  [1, '#B99A0E'],
];
const BG_STOPS = [
  [0, '#17171A'],
  [0.55, '#0D0D0D'], // the app's own background
  [1, '#050506'],
];
const GLOW_ALPHA = 0.14; // brand light bleeding out from under the mark

const n = (v) => Number(v.toFixed(3)); // binary-float noise makes pathData unreadable

const rr = ([x, y, w, h, r]) => {
  const k = r * 0.5523; // circle-ish corner from cubics — Android's pathData
  const x2 = x + w; // parser takes C but is fussier about A
  const y2 = y + h;
  const [l, t, rt, b] = [n(x), n(y), n(x2), n(y2)];
  const [lr, tr, rr_, br] = [n(x + r), n(y + r), n(x2 - r), n(y2 - r)];
  const [lk, tk, rk, bk] = [n(x + r - k), n(y + r - k), n(x2 - r + k), n(y2 - r + k)];
  return (
    `M${lr},${t} H${rr_} C${rk},${t} ${rt},${tk} ${rt},${tr} ` +
    `V${br} C${rt},${bk} ${rk},${b} ${rr_},${b} ` +
    `H${lr} C${lk},${b} ${l},${bk} ${l},${br} ` +
    `V${tr} C${l},${tk} ${lk},${t} ${lr},${t} Z`
  );
};

// --- safe-zone check ---------------------------------------------------------
// Corners are the worst case, and the corner radius only pulls them inwards, so
// measuring the un-rounded square corners is the conservative test. Rotation
// about the centre does not change a point's distance from it.
for (const [x, y, w, h] of [BAR, ...PLATES]) {
  for (const px of [x, x + w]) {
    for (const py of [y, y + h]) {
      const d = Math.hypot(px - C, py - C);
      if (d > SAFE_R) {
        throw new Error(`(${px},${py}) sits ${d.toFixed(1)}dp out, past the ${SAFE_R}dp safe radius`);
      }
    }
  }
}

// --- SVG ---------------------------------------------------------------------
const svg = (body, defs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS}" height="${CANVAS}" viewBox="0 0 ${CANVAS} ${CANVAS}">\n${
    defs ? `  <defs>\n${defs}  </defs>\n` : ''
  }${body}</svg>\n`;

const svgStops = (stops) =>
  stops.map(([offset, color]) => `      <stop offset="${offset}" stop-color="${color}"/>\n`).join('');

const markSvg = (fill) =>
  `  <g transform="rotate(${TILT} ${C} ${C})">\n${[
    ...PLATES.map((p) => [p, fill('plate')]),
    [BAR, fill('bar')],
  ]
    .map(([p, f]) => `    <path d="${rr(p)}" fill="${f}"/>\n`)
    .join('')}  </g>\n`;

const markDefs =
  `    <linearGradient id="plate" x1="${C}" y1="41" x2="${C}" y2="67" gradientUnits="userSpaceOnUse">\n${svgStops(PLATE_STOPS)}    </linearGradient>\n` +
  `    <linearGradient id="bar" x1="${C}" y1="49.5" x2="${C}" y2="58.5" gradientUnits="userSpaceOnUse">\n${svgStops(BAR_STOPS)}    </linearGradient>\n`;

const bgDefs =
  `    <radialGradient id="bg" cx="${C}" cy="46" r="78" gradientUnits="userSpaceOnUse">\n${svgStops(BG_STOPS)}    </radialGradient>\n` +
  `    <radialGradient id="glow" cx="${C}" cy="${C}" r="40" gradientUnits="userSpaceOnUse">\n      <stop offset="0" stop-color="${BRAND}" stop-opacity="${GLOW_ALPHA}"/>\n      <stop offset="1" stop-color="${BRAND}" stop-opacity="0"/>\n    </radialGradient>\n`;

const square = `M0,0h${CANVAS}v${CANVAS}h-${CANVAS}z`;
const bgBody = `  <path d="${square}" fill="url(#bg)"/>\n  <path d="${square}" fill="url(#glow)"/>\n`;

const foregroundSvg = svg(
  markSvg((which) => `url(#${which})`),
  markDefs,
);
const monochromeSvg = svg(markSvg(() => '#000000'));
const backgroundSvg = svg(bgBody, bgDefs);

// --- Android VectorDrawable --------------------------------------------------
// Android wants #AARRGGBB; the SVG side carries opacity as its own attribute.
const hex8 = (color, alpha = 1) =>
  `#${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')}${color.slice(1)}`.toUpperCase();

const vector = (comment, body) =>
  `<?xml version="1.0" encoding="utf-8"?>\n<!-- ${comment} Generated by design/icon/build.mjs — edit that, not this. -->\n` +
  '<vector xmlns:android="http://schemas.android.com/apk/res/android"\n' +
  '    xmlns:aapt="http://schemas.android.com/aapt"\n' +
  `    android:width="${CANVAS}dp"\n    android:height="${CANVAS}dp"\n` +
  `    android:viewportWidth="${CANVAS}"\n    android:viewportHeight="${CANVAS}">\n${body}</vector>\n`;

const xmlGradient = (path, attrs, stops, indent) => {
  const p = ' '.repeat(indent);
  return (
    `${p}<path android:pathData="${path}">\n${p}  <aapt:attr name="android:fillColor">\n${p}    <gradient ${attrs}>\n${stops
      .map(
        ([offset, color, alpha]) =>
          `${p}      <item android:offset="${offset}" android:color="${hex8(color, alpha)}" />\n`,
      )
      .join('')}${p}    </gradient>\n${p}  </aapt:attr>\n${p}</path>\n`
  );
};

const plateAttrs = `android:type="linear" android:startX="${C}" android:startY="41" android:endX="${C}" android:endY="67"`;
const barAttrs = `android:type="linear" android:startX="${C}" android:startY="49.5" android:endX="${C}" android:endY="58.5"`;
const group = (body) =>
  `    <group android:pivotX="${C}" android:pivotY="${C}" android:rotation="${TILT}">\n${body}    </group>\n`;

const foregroundXml = vector(
  'JGym launcher foreground: a dumbbell tilted 45 degrees.',
  group(
    PLATES.map((p) => xmlGradient(rr(p), plateAttrs, PLATE_STOPS, 8)).join('') +
      xmlGradient(rr(BAR), barAttrs, BAR_STOPS, 8),
  ),
);

const monochromeXml = vector(
  'JGym themed icon (Android 13+). The system tints this silhouette.',
  group(
    [...PLATES, BAR]
      .map((p) => `        <path android:pathData="${rr(p)}" android:fillColor="#FF000000" />\n`)
      .join(''),
  ),
);

const backgroundXml = vector(
  'JGym launcher background.',
  xmlGradient(
    square,
    `android:type="radial" android:centerX="${C}" android:centerY="46" android:gradientRadius="78"`,
    BG_STOPS,
    4,
  ) +
    xmlGradient(
      square,
      `android:type="radial" android:centerX="${C}" android:centerY="${C}" android:gradientRadius="40"`,
      [
        [0, BRAND, GLOW_ALPHA],
        [1, BRAND, 0],
      ],
      4,
    ),
);

// --- raster ------------------------------------------------------------------
// Legacy launchers (API 24/25) show the whole bitmap, so crop the adaptive
// canvas to the 72dp safe square — the same slice an API 26+ mask reveals.
const SAFE_SQUARE = 72;
const scale = CANVAS / SAFE_SQUARE;

const layer = async (markup, size) => {
  const full = Math.round(size * scale);
  const inset = Math.round((full - size) / 2);
  return sharp(Buffer.from(markup))
    .resize(full, full)
    .extract({ left: inset, top: inset, width: size, height: size })
    .png()
    .toBuffer();
};

const mask = (size, round) => {
  const shape = round
    ? `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/>`
    : `<rect width="${size}" height="${size}" rx="${size * 0.22}"/>`;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">${shape}</svg>`,
  );
};

const compose = async (size, { round = false, shaped = true } = {}) => {
  const [bg, fg] = await Promise.all([layer(backgroundSvg, size), layer(foregroundSvg, size)]);
  let img = sharp(bg).composite([{ input: fg }]);
  if (shaped) {
    img = sharp(await img.png().toBuffer()).composite([{ input: mask(size, round), blend: 'dest-in' }]);
  }
  return img.png({ compressionLevel: 9 }).toBuffer();
};

// --- write -------------------------------------------------------------------
const written = [];
const put = async (path, data) => {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, data);
  written.push(`${path.replace(`${root}/`, '')}  ${Buffer.byteLength(data)}B`);
};

await put(join(here, 'foreground.svg'), foregroundSvg);
await put(join(here, 'background.svg'), backgroundSvg);
await put(join(here, 'monochrome.svg'), monochromeSvg);

await put(join(res, 'drawable', 'ic_launcher_foreground.xml'), foregroundXml);
await put(join(res, 'drawable', 'ic_launcher_background.xml'), backgroundXml);
await put(join(res, 'drawable', 'ic_launcher_monochrome.xml'), monochromeXml);

for (const [density, size] of Object.entries({ mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 })) {
  await put(join(res, `mipmap-${density}`, 'ic_launcher.png'), await compose(size));
  await put(join(res, `mipmap-${density}`, 'ic_launcher_round.png'), await compose(size, { round: true }));
}

// Play Store listing icon: square, unmasked — Google applies its own shape.
await put(join(here, 'play-store-512.png'), await compose(512, { shaped: false }));
await put(join(here, 'preview-512.png'), await compose(512));

// Web: the favicon and the PWA install icons carry the same mark, rounded the
// way a browser tab and a home screen show it. The viewBox is the 72dp safe
// square rather than the whole adaptive canvas, so the mark lands at the same
// size here as in the PNGs above.
const inset = (CANVAS - SAFE_SQUARE) / 2;
const webSvg =
  `<svg xmlns="http://www.w3.org/2000/svg" width="${SAFE_SQUARE}" height="${SAFE_SQUARE}" viewBox="${inset} ${inset} ${SAFE_SQUARE} ${SAFE_SQUARE}">\n` +
  `  <defs>\n${markDefs}${bgDefs}  </defs>\n` +
  `  <clipPath id="squircle"><rect x="${inset}" y="${inset}" width="${SAFE_SQUARE}" height="${SAFE_SQUARE}" rx="${SAFE_SQUARE * 0.22}"/></clipPath>\n` +
  `  <g clip-path="url(#squircle)">\n${bgBody}${markSvg((which) => `url(#${which})`)}  </g>\n</svg>\n`;
await put(join(root, 'public', 'icon.svg'), webSvg);
await put(join(root, 'public', 'icon-192.png'), await compose(192));
await put(join(root, 'public', 'icon-512.png'), await compose(512));

console.log(written.join('\n'));
