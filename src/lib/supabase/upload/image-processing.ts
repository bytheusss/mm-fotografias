import sharp from "sharp";

function watermarkSvg(width: number) {
  const fontSize = Math.max(28, Math.round(width / 18));
  return Buffer.from(`<svg width="${width}" height="220"><style>.wm{fill:white;font:bold ${fontSize}px Arial,sans-serif;letter-spacing:4px;paint-order:stroke;stroke:rgba(0,0,0,.55);stroke-width:3px}</style><text x="50%" y="52%" text-anchor="middle" class="wm" opacity=".72">M&amp;M FOTOGRAFIAS</text></svg>`);
}

export async function generateImageVersions(buffer: Buffer) {
  const normalized = sharp(buffer).rotate();
  const original = await normalized.clone().jpeg({ quality: 95, mozjpeg: true }).toBuffer();
  const previewBase = await normalized.clone().resize({ width: 1600, height: 2400, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 84 }).toBuffer();
  const previewMetadata = await sharp(previewBase).metadata();
  const width = previewMetadata.width || 1200;
  const preview = await sharp(previewBase).composite([{ input: watermarkSvg(width), gravity: "centre", blend: "over" }]).jpeg({ quality: 84 }).toBuffer();
  const thumbnail = await normalized.clone().resize({ width: 500, height: 750, fit: "inside", withoutEnlargement: true }).composite([{ input: watermarkSvg(500), gravity: "centre", blend: "over" }]).jpeg({ quality: 74 }).toBuffer();
  return { original, preview, thumbnail };
}
