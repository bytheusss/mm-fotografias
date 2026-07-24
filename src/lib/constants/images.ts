export const IMAGE_PATHS = {
  placeholder: "/images/placeholder.svg",
  hero: "/images/banner/hero.jpg",
  heroFallback:
    "https://images.unsplash.com/photo-1544829099-abba210a7d22?w=1920&q=80",
} as const;

export function eventPhotoPath(slug: string, numero: string): string {
  return `/images/events/${slug}/${numero}.jpg`;
}

export function eventCoverPath(slug: string): string {
  return eventPhotoPath(slug, "0001");
}
