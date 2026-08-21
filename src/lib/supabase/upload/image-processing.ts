import sharp from "sharp";
import { readFile } from "node:fs/promises";
import path from "node:path";

async function watermarkLogo(width: number) {
  const logo = await readFile(path.join(process.cwd(), "public", "images", "logo.png"));
  const targetWidth = Math.max(220, Math.round(width * 0.52));
  return sharp(logo).resize({ width: targetWidth, withoutEnlargement: true }).png().toBuffer();
}

export async function generateImageVersions(buffer: Buffer) {
  const normalized = sharp(buffer).rotate();
  const original = await normalized.clone().jpeg({ quality: 95, mozjpeg: true }).toBuffer();
  const previewBase = await normalized.clone().resize({ width: 1600, height: 2400, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 84 }).toBuffer();
  const previewMetadata = await sharp(previewBase).metadata();
  const width = previewMetadata.width || 1200;
  const preview = await sharp(previewBase).composite([{ input: await watermarkLogo(width), gravity: "centre", blend: "over" }]).jpeg({ quality: 84 }).toBuffer();
  const thumbnailBase = await normalized.clone().resize({ width: 500, height: 750, fit: "inside", withoutEnlargement: true }).toBuffer();
  const thumbnail = await sharp(thumbnailBase).composite([{ input: await watermarkLogo(500), gravity: "centre", blend: "over" }]).jpeg({ quality: 74 }).toBuffer();
  return { original, preview, thumbnail };
}
