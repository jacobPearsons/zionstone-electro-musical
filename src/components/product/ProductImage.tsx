import Image from "next/image";
import { resolveImageSrc } from "@/lib/images";

interface ProductImageProps {
  image?: string;
  name: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * Renders a product image — the GitHub-CDN-backed catalogue photo in
 * production, the local file in dev — falling back to the legacy emoji
 * placeholder (or nothing) when a product carries no images. The parent must
 * be `relative` and sized for the `fill`-mode image.
 */
export function ProductImage({ image, name, priority, sizes }: ProductImageProps) {
  if (image && image.startsWith("/")) {
    return (
      <Image
        src={resolveImageSrc(image)}
        alt={name}
        fill
        sizes={sizes}
        className="object-contain"
        priority={priority}
      />
    );
  }
  if (image) {
    return (
      <span className="select-none text-4xl" aria-hidden="true">
        {image}
      </span>
    );
  }
  return null;
}