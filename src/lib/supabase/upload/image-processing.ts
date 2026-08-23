import sharp from "sharp";
import { readFile } from "node:fs/promises";
import path from "node:path";

async function watermarkLogo(width: number) {
  const logo = await readFile(path.join(process.cwd(), "public", "images", "logo.png"));
  const targetWidth = Math.max(220, Math.round(width * 0.52));
  return sharp(logo).resize({ width: targetWidth, withoutEnlargement: true }).png().toBuffer();
}

function protectionLayer(width: number, height: number, label = "") {
  const safeLabel = label.replace(/[^a-zA-Z0-9 #_-]/g, "");
  const fontSize = Math.max(24, Math.round(width * 0.032));
  // This string is injected into SVG/XML, where a bare ampersand is invalid.
  const text = `M&amp;M FOTOGRAFIAS ${safeLabel}`.trim();
  const rows = [0.18, 0.42, 0.66, 0.9].map((position) =>
    [0.12, 0.48, 0.84].map((x) => `<text x="${Math.round(width * x)}" y="${Math.round(height * position)}" text-anchor="middle" transform="rotate(-22 ${Math.round(width * x)} ${Math.round(height * position)})">${text}</text>`).join(""),
  ).join("");
  return Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><style>text{font:700 ${fontSize}px Arial,sans-serif;fill:white;fill-opacity:.22;stroke:black;stroke-opacity:.18;stroke-width:2px}</style>${rows}</svg>`);
}

export async function generateImageVersions(buffer: Buffer, label = "") {
  const normalized = sharp(buffer).rotate();
  const original = await normalized.clone().jpeg({ quality: 95, mozjpeg: true }).toBuffer();
  const previewBase = await normalized.clone().resize({ width: 1600, height: 2400, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 84 }).toBuffer();
  const previewMetadata = await sharp(previewBase).metadata();
  const width = previewMetadata.width || 1200;
  const height = previewMetadata.height || 1600;
  const preview = await sharp(previewBase).composite([{ input: protectionLayer(width, height, label), gravity: "centre", blend: "over" }, { input: await watermarkLogo(width), gravity: "centre", blend: "over" }]).jpeg({ quality: 84 }).toBuffer();
  const thumbnailBase = await normalized.clone().resize({ width: 500, height: 750, fit: "inside", withoutEnlargement: true }).toBuffer();
  const thumbnailMetadata = await sharp(thumbnailBase).metadata();
  const thumbnailWidth = thumbnailMetadata.width || 500;
  const thumbnailHeight = thumbnailMetadata.height || 750;
  const thumbnail = await sharp(thumbnailBase).composite([{ input: protectionLayer(thumbnailWidth, thumbnailHeight, label), gravity: "centre", blend: "over" }, { input: await watermarkLogo(thumbnailWidth), gravity: "centre", blend: "over" }]).jpeg({ quality: 74 }).toBuffer();
  return { original, preview, thumbnail };
}
