import sharp from "sharp";

export async function generateImageVersions(buffer: Buffer) {
  const preview = await sharp(buffer)
    .resize({
      width: 1600,
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 85,
    })
    .toBuffer();

  const thumbnail = await sharp(buffer)
    .resize({
      width: 400,
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 75,
    })
    .toBuffer();

  return {
    preview,
    thumbnail,
  };
}