import { Button } from "@/components/ui/Button";
import { SafeImage } from "@/components/ui/SafeImage";
import type { EventPhoto } from "@/types";

interface PhotoCardProps {
  photo: EventPhoto;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

export function PhotoCard({
  photo,
  priority = false,
  sizes = "(max-width: 768px) 50vw, 33vw",
  className = "aspect-square",
}: PhotoCardProps) {
  return (
    <div className={`group relative overflow-hidden rounded-sm ${className}`}>
      <SafeImage
        src={photo.imagem}
        alt={`Foto ${photo.numero} — ${photo.evento}`}
        fill
        priority={priority}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        sizes={sizes}
      />
      <div className="absolute inset-0 bg-background/0 transition-colors duration-500 group-hover:bg-background/40" />
      <div className="absolute inset-x-0 bottom-0 flex translate-y-full flex-col items-center gap-2 p-4 transition-transform duration-500 group-hover:translate-y-0">
        <span className="text-sm font-medium text-foreground">
          Foto #{photo.numero}
        </span>
        <Button
          href={`/eventos/${photo.slug}/${photo.numero}`}
          size="sm"
          variant="secondary"
        >
          Visualizar
        </Button>
      </div>
    </div>
  );
}
