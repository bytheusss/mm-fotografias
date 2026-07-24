"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { IMAGE_PATHS } from "@/lib/constants/images";

type SafeImageProps = ImageProps & {
  fallbackSrc?: string;
};

export function SafeImage({
  src,
  fallbackSrc = IMAGE_PATHS.placeholder,
  alt,
  ...props
}: SafeImageProps) {
  const initialSrc = typeof src === "string" ? src : fallbackSrc;
  const [imgSrc, setImgSrc] = useState(initialSrc);

  useEffect(() => {
    setImgSrc(typeof src === "string" ? src : fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
