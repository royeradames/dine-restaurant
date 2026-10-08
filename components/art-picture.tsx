type Variant = { src: string; width: number; height: number };

export type ArtSources = {
  mobile: Variant;
  tablet: Variant;
  desktop: Variant;
};

type ArtPictureProps = {
  sources: ArtSources;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
};

const retina = (src: string) => src.replace(/\.jpg$/, "@2x.jpg");
const srcSet = (src: string) => `${src} 1x, ${retina(src)} 2x`;

/** Art-directed photo using the starter's pre-sized 1x/2x files for each breakpoint. */
export function ArtPicture({ sources, alt, className = "", imgClassName = "", priority = false }: ArtPictureProps) {
  const { mobile, tablet, desktop } = sources;
  return (
    <picture className={className}>
      <source media="(min-width: 75rem)" srcSet={srcSet(desktop.src)} width={desktop.width} height={desktop.height} />
      <source media="(min-width: 48rem)" srcSet={srcSet(tablet.src)} width={tablet.width} height={tablet.height} />
      <img
        src={mobile.src}
        srcSet={srcSet(mobile.src)}
        width={mobile.width}
        height={mobile.height}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className={`block h-full w-full object-cover ${imgClassName}`}
      />
    </picture>
  );
}

type Size = readonly [width: number, height: number];

export const photo = (name: string, sizes: { mobile: Size; tablet: Size; desktop: Size }, folder = "homepage"): ArtSources => {
  const file = (variant: string) => `/images/${folder}/${name}-${variant}.jpg`;
  return {
    mobile: { src: file("mobile"), width: sizes.mobile[0], height: sizes.mobile[1] },
    tablet: { src: file("tablet"), width: sizes.tablet[0], height: sizes.tablet[1] },
    desktop: { src: file("desktop"), width: sizes.desktop[0], height: sizes.desktop[1] },
  };
};
