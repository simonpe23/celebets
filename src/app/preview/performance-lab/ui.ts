// THE PERFORMANCE PREVIEW'S COLOUR DIAL. One file, one line per
// colour. Lab, Compare and every part they draw read from here, so
// changing a colour here changes it everywhere those pages use it.
//
// His instruction, 29 August 2026: "we have to look at colors across
// the board at a later stage... where we can decide a color change,
// and it'll update across the board. the code has to be built that
// way." This file is that dial.
//
// TWO RULES FOR ANYONE EDITING THESE PAGES:
// 1. Never write a hex inside a page or a component. Add a token
//    here and import it. A colour that lives in two places will
//    eventually say two things.
// 2. The values are the accepted Home's, sampled from his designer's
//    sheets. `src/app/preview/performance-home/` still keeps its own
//    copies inline because that folder is protected from this chat;
//    when it is opened, it imports this file and the whole
//    Performance area becomes one dial.

// The brand. INDIGO draws text, lines and icons; INDIGO_FILL fills
// solid shapes like the active pill.
export const INDIGO = "#3614F0";
export const INDIGO_FILL = "#3708E4";
export const ON_BRAND = "#FFFFFF";
export const ON_BRAND_SOFT = "#DDD6FA";
export const ON_BRAND_CLOSE = "#7C6FE0";

// Ink, darkest to lightest.
export const INK = "#101114";
export const HEAD_INK = "#3A404F";
export const NET_LABEL = "#353B49";
export const SELECTOR_INK = "#252F3E";
export const LINK_INK = "#626774";
export const GREY_TEXT = "#757B87";
export const GLYPH = "#6E7076";
export const MENU_IDLE = "#6B6E7A";
export const TAB_IDLE = "#3E4553";

// Money moved, and nothing else.
export const GREEN = "#1EAD2E";
export const SUBGREEN = "#25B132";
export const RED = "#FC1B1D";

// Surfaces.
export const PAGE_BG = "#FBFBFC";
export const CARD = "#FFFFFF";
export const CARD_WINNER = "#FCFBFE";
export const PILL_LAV = "#F0EEFB";
export const SEL_BG = "#F0EAFD";
export const MENU_TRACK = "#F2F3F7";
export const TRACK = "#EDEEF0";
export const TRACK_SOFT = "#F6F6F8";
export const PILL_GREY = "#F2F2F5";

// Lines and edges.
export const HAIR = "#EDEDEF";
export const HAIRLINE = "#EFEFF1";
export const SEL_EDGE = "#B3A4F6";
export const TRAY_EDGE = "rgba(55,8,228,0.45)";
export const EDGE_SOFT = "#E7E7EC";
export const DIVIDER = "#E6E7EC";
export const CHEV = "#C3C4C9";
export const DOT_MUTED = "#9B9DA5";

// The insight accent. Amber marks insights only.
export const ORANGE = "#EF8D08";
export const AMBER_BG = "#FFF6E9";
export const AMBER_EDGE = "#F6E9CC";
export const AMBER_TILE = "#FEEFD4";
export const AMBER_INK = "#2E3138";

// Soft result tints, sampled from "2. Totals.png". They back a row
// whose result is good, mixed or bad, and they are the palest step
// of the same green, amber and red the money figures use.
export const TINT_GOOD = "#EBF9EE";
export const TINT_MID = "#FEF6E7";
export const TINT_BAD = "#FEEDEE";

// Chart parts. The lighter weights exist so two lines of the same
// sign can be told apart on Compare.
export const LIGHT_INDIGO = "#8B79F3";
export const LIGHT_RED = "#FB8A8B";
export const ZERO_LINE = "#C6C2D2";
export const GRID_LINE = "#F1F1F4";
