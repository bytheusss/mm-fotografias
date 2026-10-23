"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
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
  const validSrc = typeof src === "string" && src.trim() === "" ? fallbackSrc : src || fallbackSrc;
  const [failedSrc, setFailedSrc] = useState<ImageProps["src"] | null>(null);
  const imgSrc = failedSrc === validSrc ? fallbackSrc : validSrc;

  if (!imgSrc) {
    return null;
  }

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => {
        if (validSrc !== fallbackSrc && fallbackSrc) {
          setFailedSrc(validSrc);
        }
      }}
    />
  );
}
