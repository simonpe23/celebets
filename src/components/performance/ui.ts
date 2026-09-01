// THE PERFORMANCE PREVIEW'S COLOUR DIAL. One file, one line per
// colour. Home, Lab, Totals, Compare, the Heat Map and All Bets all
// read from here and none of them holds a colour of its own, so
// changing a line here changes that colour on every one of them.
//
// It sat inside the `performance-lab` folder until 30 August 2026,
// which read as if Lab owned it. It sits beside the six folders now
// because it belongs to all of them. Nothing else moved.
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

// THE FACE.
//
// Figtree, on every Performance page. It used to be loaded six times,
// once inside each page.tsx, with the same three lines copied out.
// One call now, and the pages import the result, so the font family
// is a single line in a single file: his rule, and the answer to
// "never change a font without permission" being impossible to obey
// when the font is written down six times.
//
// FONT_CLASS goes on the page wrapper, FONT_FAMILY into its style.
import { Figtree } from "next/font/google";

const fig = Figtree({
  subsets: ["latin"],
  variable: "--font-fig",
});

export const FONT_CLASS = fig.variable;
export const FONT_FAMILY = "var(--font-fig)";

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

// Money moved, and nothing else.
export const GREEN = "#1EAD2E";
export const SUBGREEN = "#25B132";
export const RED = "#FC1B1D";

// Surfaces.
export const PAGE_BG = "#FBFBFC";
export const CARD = "#FFFFFF";
export const CARD_WINNER = "#FCFBFE";
// The quiet band behind one insight inside the sheet.
export const INSIGHT_ROW = "#FAFAFC";
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
// A hairline inside a raised surface. It was drawn for the floating
// tab bar, which is gone since 31 August 2026; Lab's domain dropdown
// still uses it, so the value stays and only the name is now a little
// historical.
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
// TAB_GLYPH lived here: the stroke colour of the four tab bar icons.
// It went with them on 31 August 2026, when the Performance area's
// private tab bar was deleted. Nothing else ever used it.
// The near invisible contour lines and dot grid inside Home's wash.
export const WASH_LINE = "#C9BCE8";
export const WASH_DOT = "#CFC3EA";

// ===================================================================
// THE SIZE AND SHAPE DIAL
//
// Added 30 August 2026, on his order: "I want to change one thing in
// one file and have it update across every page. Font, font size, a
// colour, a height, a corner radius, spacing."
//
// The colours above already worked that way. Nothing else did. The
// type sizes were typed into the pages 152 times, the page shell was
// copied into all six page.tsx files, and the top menu was written
// out twice. So a font change meant twenty edits and a missed one
// shipped two sizes side by side.
//
// THE RULE FOR EVERY VALUE BELOW: it is here because MORE THAN ONE
// Performance page uses it. A number used once, on one page, stays on
// that page. A dial full of single use values is a second place to
// look, not one place to change.
//
// These are Tailwind class strings, not raw numbers, so a page keeps
// writing className and nothing had to be rewritten as an inline
// style. Tailwind v4 reads .ts files, so a size written here builds
// its CSS exactly as it did when it sat in the page. That was proved
// with a real build before any of this was written, not assumed.
// ===================================================================

// THE TYPE SCALE, WHICH IS THE APP'S, NOT THIS FOLDER'S ANY MORE.
//
// Since 31 August 2026, phase 2 of the size and layout job. Every name
// below is a step on the ONE list in `src/app/globals.css`. Nothing
// here is a number, and `design-check.mjs` rule 14 fails the build if
// anyone writes one.
//
// WHAT THESE USED TO BE, and why it had to go: ten hand written steps
// from 7.6px to 15px, measured off a 390px PICTURE of a phone so the
// build would match his mockup image. Right for copying a picture,
// wrong for a screen. His words on the result: "Performance feels too
// zoomed out". He chose the middle of three scales on 31 August 2026.
//
// TEN STEPS BECAME FIVE, and that is deliberate. Ten sizes inside a
// 7px range is not a hierarchy, it is noise: 8px and 8.5px do not
// read as different jobs. The five that remain are the small end of
// the app's list, which is what keeps Performance denser than Track
// while both obey the same rules. His ruling: "Pages are allowed to
// look different from each other for now."
//
//   was 15    -> 17  T_TITLE
//   was 11.5  -> 15  T_LEAD
//   was 11    -> 13  T_STRONG
//   was 10.5  -> 13  T_LABEL
//   was 10    -> 12  T_BODY
//   was 9.5   -> 12  T_SMALL
//   was 9     -> 11  T_META
//   was 8.5   -> 11  T_MICRO
//   was 8     -> 11  T_TINY
//   was 7.6   -> 11  T_NANO
//
// The ten names are kept so the pages did not all have to be rewritten
// in the same commit that changed the sizes. Whoever next touches a
// page may collapse its T_NANO and T_TINY into T_META; there is no
// hurry, because they are the same size now and cannot drift.
export const T_TITLE = "text-xl"; // 17, a screen's own title in a back header
export const T_LEAD = "text-lg"; // 15, a card's lead line
export const T_STRONG = "text-base"; // 13, a figure or a heading inside a card
export const T_LABEL = "text-base"; // 13, the workhorse: menu tabs, row names
export const T_BODY = "text-sm"; // 12, ordinary text under a heading
export const T_SMALL = "text-sm"; // 12, a caption, a chip, a second figure
export const T_META = "text-xs"; // 11, a record, a date, a unit
export const T_MICRO = "text-xs"; // 11, a note beside a figure
export const T_TINY = "text-xs"; // 11, a chart's axis tick
export const T_NANO = "text-xs"; // 11, the smallest mark on a chart

// THE TWO WEIGHTS. Performance uses these and nothing else: no
// regular, no medium, no black. Both are here so a weight change is
// one edit, which is the rule he set after a font weight moved on the
// live site and went unnoticed for days.
export const W_SEMI = "font-semibold";
export const W_BOLD = "font-bold";

// THE CORNERS.
//
// `rounded-full` is deliberately NOT a token. It is a shape, not a
// measurement: a pill stops being a pill the moment it carries a
// number, so changing it in one place would be a redesign, not a
// tweak.
export const R_CARD = "rounded-[16px]"; // a card on the page
export const R_TILE = "rounded-[14px]"; // a tile inside a card
export const R_CHIP = "rounded-[13px]"; // a chip in a picker
export const R_INNER = "rounded-[12px]"; // a row inside a tile
export const R_SMALL = "rounded-[10px]"; // the smallest boxed thing

// THE PAGE COLUMN. Every Performance page is a 390pt phone column
// centred on whatever screen it lands on.
// THE COLUMN IS THE APP'S, since 31 August 2026, phase 3 of the size
// and layout job.
//
// It was max-w-[390px], the width of the mockup image these pages were
// measured from, while every other page in the app is max-w-md, which
// is 448. On any screen wider than 448 the two sat side by side in his
// browser 58px apart, and he sent a zoomed screenshot with the gap
// marked: the bottom bar visibly wider than the page under it.
//
// His words: "the biggest one is that the old pages, track, research
// profile are wider than Performance, why?... i want performance to
// expand as well as the other pages do."
//
// It reads `COLUMN` from src/lib/ui.ts so there is ONE width, and
// changing it changes every page in the app at once. Widening this
// was only possible after the menu and the KPI dividers stopped being
// pixel positions measured at 390.
export const COL_W = "max-w-md";

// The bottom spacer inside that column, which decides how leftover
// height is shared out. Home and Lab distribute it (they have their
// own growing gaps higher up and this one has to lose); the other
// four simply hold a floor.
//
// THEY ARE CAPPED, since 31 August 2026, phase 3. They were tuned on
// a phone, where the leftover height is a few dozen pixels and
// spreading it makes the page sit properly on the glass. On a tall
// laptop window the leftover is five hundred, and Home spread it into
// four visible holes: 77px under the chart, 154 above and below the
// insight banner, 231 at the foot. That is the same dead band he
// asked to be rid of, wearing a different hat.
//
// The caps are the measured maximum on his biggest phone (430x932)
// and on a 1512x950 laptop, rounded up, so NOTHING changes on any
// phone or on a normal laptop. Past that the spacer stops and
// PAGE_FRAME centres the whole page instead, which is what he picked.
export const TAIL_TALL = "min-h-[8px] max-h-[64px] grow-[3]";
export const TAIL_SHORT = "min-h-[6px] max-h-[32px] grow";
export type PerfTail = typeof TAIL_TALL | typeof TAIL_SHORT;

// THE FLOATING TAB BAR IS GONE, 31 August 2026. Its width, its icon
// size, its glass and its radius lived here. The Performance pages
// draw the app's own `src/components/TabBar.tsx` now, the one every
// other page has always drawn, so there is nothing left to dial.

// THE HOME / LAB / TOTALS MENU.
//
// Label centres and pill positions are the accepted Home's, measured
// off his sheet. They are here rather than in the component because
// menu height is one of the things he named.
export const MENU_H = "h-[36px]";
export const MENU_PILL_H = "h-[28px]";
// The pill's inset from the track's edge, in pixels because the pill's
// width is calculated from it. Its WIDTH is gone: it was w-[110px],
// one third of a 390px column, and it stopped being one third the
// moment the column could be any other size. Phase 3, 31 August 2026.
export const MENU_PAD = 4;
// NO HORIZONTAL INSET SINCE 31 AUGUST 2026, phase 3. It was
// mx-[14px], the menu's distance from a 390px mockup's edge. The
// frame carries the app's one edge rule now, so the menu starts
// where every card and every other page's content starts.
export const MENU_INSET = "mt-[7px]";
export const MENU_PILL_TOP = "top-[4px]";

// THE BACK HEADER on Compare, All Bets and the Heat Map.
//
// Compare's is four pixels taller than the other two. That is drift,
// not a decision: the three were written out separately and one of
// them grew. It is kept exactly as it is because this job may not
// change how anything looks. Whoever redesigns Compare should collapse
// the two into one.
export const HEAD_H = "h-[40px]";
// Split, because All Bets balances the row with an empty box of the
// button's own width. Written twice, the two would drift.
export const HEAD_BTN_W = "w-[34px]";
export const HEAD_BTN = `h-[34px] ${HEAD_BTN_W}`;
export const HEAD_H_TALL = "h-[44px]";
export const HEAD_BTN_TALL = "h-[36px] w-[36px]";

// CHART HEIGHTS.
//
// These are NOT one shared number today: Home and Lab draw at 98, the
// Totals hero at 92, Compare at 132. They sit here so all four are in
// one place and a change is one edit, not so that they are equal. He
// approved keeping them different.
export const CHART_H_HOME = 98;
export const CHART_H_LAB = 98;
export const CHART_H_TOTALS = 92;
export const CHART_H_COMPARE = 132;
