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
  alt = "",
  ...props
}: SafeImageProps) {
  const getValidSrc = () => {
    if (typeof src === "string" && src.trim() !== "") {
      return src;
    }

    return fallbackSrc;
  };

  const [imgSrc, setImgSrc] = useState(getValidSrc());

  useEffect(() => {
    setImgSrc(getValidSrc());
  }, [src, fallbackSrc]);

  if (!imgSrc) {
    return null;
  }

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      unoptimized
      onError={() => {
        if (imgSrc !== fallbackSrc && fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}