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
//    sheets. Home joined the dial on 30 August 2026, with his
//    permission to open its folder for that one job, so every
//    Performance page now reads its colours from here and nothing
//    holds a private copy.

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
// The floating tab bar: its frosted ground and the hairline inside
// it. The one hex that had escaped the dial, on every page at once.
export const TAB_GLASS = "rgba(252,251,253,0.92)";
export const TAB_EDGE = "#EFEFF2";
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

// The heat map's tiles, sampled pixel by pixel from "2. heat map.png".
// The tint strengthens with the size of the result WITHIN ITS OWN
// SIGN, so the biggest leak reads as deep a red as the biggest earner
// reads green. Ramped against one shared maximum instead, every red on
// this record would sit at the palest step and the page would whisper
// exactly the thing it exists to shout.
export const TILE_GOOD_STRONG = "#DAF1D8";
export const TILE_GOOD_SOFT = "#E8F4E4";
export const TILE_BAD_STRONG = "#FDE0E1";
export const TILE_BAD_SOFT = "#FDE6E7";
export const TILE_NEUTRAL = "#EEEDF1";

// A tile's icon disc and its hairline edge are the same colour in the
// sheet: the tile's own tint, deepened. Sampled at the same points.
export const TILE_EDGE_GOOD_STRONG = "#BDE9BC";
export const TILE_EDGE_GOOD_SOFT = "#D2ECC7";
export const TILE_EDGE_BAD_STRONG = "#FEC8CA";
export const TILE_EDGE_BAD_SOFT = "#FED6D7";
export const TILE_EDGE_NEUTRAL = "#E2E1E6";

// Chart parts. The lighter weights exist so two lines of the same
// sign can be told apart on Compare.
export const LIGHT_INDIGO = "#8B79F3";
export const LIGHT_RED = "#FB8A8B";
export const ZERO_LINE = "#C6C2D2";
export const GRID_LINE = "#F1F1F4";

// Totals' donut ramps: four steps of the brand purple for the slices
// that earned, four of the red for the ones that leaked, and the ring
// behind a slice with nothing in it.
export const DONUT_EARNER = ["#3708E4", "#5B37EE", "#8B79F3", "#B3A4F6"];
export const DONUT_LEAK = ["#FC1B1D", "#FB5B5C", "#FB8A8B", "#FDB9B9"];
export const DONUT_EMPTY = "#E6E7EC";

// Compare's winner orb, a lit sphere of the brand purple.
export const ORB_LIGHT = "#7E5BF5";
export const ORB_MID = "#5A2CF0";

// Home's own colours, folded in 30 August 2026 when Home joined the
// dial. Each was already on the accepted page; none of them changed
// value in the move. They live here so a later palette pass, dark mode
// first, is one edit instead of seventy.

// The pale red tile behind a losing row's icon on Home's ranked list.
export const ROW_TILE_BAD = "#FEF0F0";
// The number inside a rank chip that is not first place.
export const RANK_INK = "#4A4C52";
// The Lab invitation card at the foot of Home, and the lit purple orb
// on it: highlight, body and shade of one sphere.
export const LAB_CARD = "#F8F6FC";
export const ORB_HI = "#D8C6F3";
export const ORB_TINT = "#C4A9EE";
export const ORB_DEEP = "#B090E8";
// The losing sparkline's red. A shade off RED on purpose: it is what
// the sheet's thin line samples at, and matching it to RED would
// darken every losing spark.
export const SPARK_RED = "#FC1F1F";
// The four grey marks on Home's KPI strip.
export const FACT_GLYPH = "#454F5E";
// The chevron inside the This month selector.
export const SELECTOR_CHEV = "#2A2B30";
// The red target on a losing row. Also a shade off RED, sampled from
// the sheet's stroke.
export const TARGET_RED = "#FB1D1F";
// The three idle tab bar icons. Darker than TAB_IDLE, which is their
// label, because a thin stroke reads lighter than text at the same
// value.
export const TAB_GLYPH = "#26262B";
// The near invisible contour lines and dot grid inside Home's wash.
export const WASH_LINE = "#C9BCE8";
export const WASH_DOT = "#CFC3EA";
