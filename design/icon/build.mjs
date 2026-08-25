// Renders the launcher PNGs from foreground.svg + background.svg.
//
//   npm i sharp && node design/icon/build.mjs
//
// API 26+ uses the vector adaptive icon in android/app/src/main/res, so these
// PNGs only serve API 24/25 launchers plus the Play Store listing icon.
import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const res = join(here, '..', '..', 'android', 'app', 'src', 'main', 'res');

// Legacy launchers show the whole bitmap, so we crop the adaptive canvas down to
// the 72dp safe square — the same slice an API 26+ mask reveals.
const CANVAS = 108;
const SAFE = 72;
const scale = CANVAS / SAFE;

const densities = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };

const layer = async (file, size) => {
  const full = Math.round(size * scale);
  const inset = Math.round((full - size) / 2);
  return sharp(await readFile(join(here, file)))
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
  const [bg, fg] = await Promise.all([layer('background.svg', size), layer('foreground.svg', size)]);
  let img = sharp(bg).composite([{ input: fg }]);
  if (shaped) {
    img = sharp(await img.png().toBuffer()).composite([
      { input: mask(size, round), blend: 'dest-in' },
    ]);
  }
  return img.png({ compressionLevel: 9 }).toBuffer();
};

const written = [];
const put = async (path, buf) => {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, buf);
  written.push(`${path.replace(join(here, '..', '..') + '/', '')}  ${buf.length}B`);
};

for (const [density, size] of Object.entries(densities)) {
  await put(join(res, `mipmap-${density}`, 'ic_launcher.png'), await compose(size));
  await put(join(res, `mipmap-${density}`, 'ic_launcher_round.png'), await compose(size, { round: true }));
}

// Play Store listing icon: 512x512, square, no shape mask — Google applies its own.
await put(join(here, 'play-store-512.png'), await compose(512, { shaped: false }));
// Human-sized preview for eyeballing the artwork.
await put(join(here, 'preview-512.png'), await compose(512));

console.log(written.join('\n'));
