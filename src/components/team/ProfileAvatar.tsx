"use client";

import Image from "next/image";
import { useState } from "react";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "M&M";
}

export function ProfileAvatar({
  src,
  name,
  sizes,
  className = "",
}: {
  src?: string | null;
  name: string;
  sizes: string;
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = Boolean(src && failedSrc === src);

  if (!src || failed) {
    return (
      <span
        role="img"
        aria-label={`Foto de ${name}`}
        className={`grid h-full w-full place-items-center bg-gradient-to-br from-red-700 to-neutral-950 font-black text-white ${className}`}
      >
        {initials(name)}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={`Foto de ${name}`}
      fill
      sizes={sizes}
      className={`object-cover ${className}`}
      onError={() => setFailedSrc(src || null)}
    />
  );
}
