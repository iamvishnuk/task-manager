// Type declarations for static image imports (PNG, JPG, SVG, etc.)
// Next.js handles these at runtime via its image loader.
declare module '*.png' {
  import type { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}

declare module '*.jpg' {
  import type { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}

declare module '*.jpeg' {
  import type { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}

declare module '*.webp' {
  import type { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}

declare module '*.svg' {
  import type { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}
