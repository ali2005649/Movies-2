/**
 * Responsive layout helpers for phone vs tablet grids.
 * Breakpoints follow common Material / Apple tablet thresholds (~768pt).
 */

export const BREAKPOINTS = {
  /** Shortest side / width at which we treat the device as a tablet. */
  tablet: 768,
  /** Large tablet / landscape iPad Pro–class widths. */
  largeTablet: 1024,
} as const;

export type GridMetrics = {
  width: number;
  height: number;
  isTablet: boolean;
  isLandscape: boolean;
  /** FlatList numColumns — 2 phone, 4 tablet portrait, 5 tablet landscape. */
  numColumns: number;
  /** Horizontal list / screen edge padding. */
  contentPadding: number;
  /** Gap between cards (and row bottom spacing). */
  gap: number;
  cardWidth: number;
  /** Poster height using a classic 2:3 theatrical poster ratio. */
  posterHeight: number;
  /** Slightly larger type / chrome on tablets. */
  titleFontSize: number;
  sectionTitleSize: number;
};

/** Columns: phones 2; tablets 4 portrait / 5 landscape. */
export function getGridColumns(width: number, height: number): number {
  if (width < BREAKPOINTS.tablet) return 2;
  return width > height ? 5 : 4;
}

export function getContentPadding(width: number): number {
  if (width >= BREAKPOINTS.largeTablet) return 28;
  if (width >= BREAKPOINTS.tablet) return 24;
  return 16;
}

export function getCardGap(width: number): number {
  if (width >= BREAKPOINTS.tablet) return 18;
  return 12;
}

export function getCardWidth(
  screenWidth: number,
  columns: number,
  contentPadding: number,
  gap: number
): number {
  const inner = screenWidth - contentPadding * 2;
  const gaps = gap * (columns - 1);
  return (inner - gaps) / columns;
}

/** TMDB posters are typically ~2:3 — keep height proportionate to card width. */
export function getPosterHeight(cardWidth: number): number {
  return Math.round(cardWidth * 1.5);
}

export function getGridMetrics(width: number, height: number): GridMetrics {
  const isTablet = width >= BREAKPOINTS.tablet;
  const isLandscape = width > height;
  const numColumns = getGridColumns(width, height);
  const contentPadding = getContentPadding(width);
  const gap = getCardGap(width);
  const cardWidth = getCardWidth(width, numColumns, contentPadding, gap);
  const posterHeight = getPosterHeight(cardWidth);

  return {
    width,
    height,
    isTablet,
    isLandscape,
    numColumns,
    contentPadding,
    gap,
    cardWidth,
    posterHeight,
    titleFontSize: isTablet ? 15 : 14,
    sectionTitleSize: isTablet ? 30 : 26,
  };
}
