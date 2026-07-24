import { eventCoverPath, eventPhotoPath } from "@/lib/constants/images";
import type { Event, EventPhoto } from "@/types";

export const AACRC_SLUG = "aacrc-05072026";

export const AACRC_EVENT: Event = {
  id: AACRC_SLUG,
  slug: AACRC_SLUG,
  name: "Encontro AACRC",
  city: "Rio Claro/SP",
  date: "05/07/2026",
  photoCount: 157,
  image: eventCoverPath(AACRC_SLUG),
};

export function generateAacrcPhotos(): EventPhoto[] {
  return Array.from({ length: 157 }, (_, index) => {
    const numero = String(index + 1).padStart(4, "0");
    const imagePath = eventPhotoPath(AACRC_SLUG, numero);

    return {
      id: `${AACRC_SLUG}-${numero}`,
      numero,
      evento: AACRC_EVENT.name,
      slug: AACRC_SLUG,
      imagem: imagePath,
      thumbnail: imagePath,
      preco: 15,
      status: "available",
    };
  });
}

export const AACRC_PHOTOS = generateAacrcPhotos();
