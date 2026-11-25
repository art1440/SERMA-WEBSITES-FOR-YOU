/**
 * Shared motion kit for the /work demo sites. Every device here honours
 * useDemoStill() (reduced motion or the Pause switch): it renders its final,
 * motionless state, with every word fully opaque. Transform, opacity and
 * clip-path only. See each file's header for the contract.
 */
export { ExpandImage } from "./ExpandImage";
export { HeroBackdrop } from "./HeroBackdrop";
export { HorizontalGallery } from "./HorizontalGallery";
export { HoverPreview } from "./HoverPreview";
export { Magnetic } from "./Magnetic";
export { Parallax } from "./Parallax";
export { RevealImage } from "./RevealImage";
export { RollText } from "./RollText";
export { ScrollMarquee } from "./ScrollMarquee";
export { ScrollProgress } from "./ScrollProgress";
export { SmoothScroll } from "./SmoothScroll";
export { StickyStory, StoryFrame, type StoryStep } from "./StickyStory";
export { TextReveal } from "./TextReveal";
export { useFinePointer, useIsDesktop, useMediaQuery, waveDelay } from "./hooks";
