// THE BACK HEADER, drawn by Compare, All Bets and the Heat Map.
//
// It used to be written out three times, once inside each of those
// three pages, and it had already drifted: Compare's row is 44px with
// a 36px button, the other two are 40px with a 34px button. The three
// copies are gone but the drift is deliberately kept, because this job
// may not change how anything looks. `tall` is Compare's shape.
//
// Whoever redesigns Compare should collapse the two shapes into one.
// Until then the difference is at least written down in one place
// instead of hiding in three files.

import Link from "next/link";
import type { ReactNode } from "react";
import { Chev } from "./icons";
import {
  CARD,
  HEAD_BTN,
  HEAD_BTN_TALL,
  HEAD_H,
  HEAD_H_TALL,
  INK,
  T_TITLE,
  W_BOLD,
} from "./ui";

export default function PerfHeader({
  href,
  label,
  title,
  tall = false,
  right = null,
  onBack,
}: {
  href: string;
  // What a screen reader says on the back button. It names the place
  // you are going back to, which differs per page.
  label: string;
  title: string;
  // Compare's taller shape. See the note above.
  tall?: boolean;
  // Anything sitting at the right end of the row, like the Heat Map's
  // sparkle.
  right?: ReactNode;
  // Go back in place instead of navigating. The tab area passes this
  // on the Heat Map, which is a view inside it and not a page any
  // more. The href stays, so the address still works and a long press
  // can still open it.
  onBack?: () => void;
}) {
  return (
    <div
      className={`relative mt-[10px] flex ${tall ? HEAD_H_TALL : HEAD_H} items-center ${
        tall ? "px-[16px]" : "px-[15px]"
      }`}
    >
      <Link
        href={href}
        aria-label={label}
        onClick={(e) => {
          if (!onBack) return;
          e.preventDefault();
          onBack();
        }}
        className={`flex ${tall ? HEAD_BTN_TALL : HEAD_BTN} items-center justify-center rounded-full`}
        style={{ background: CARD, boxShadow: "0 1px 4px rgba(24,20,50,0.08)" }}
      >
        <span className="rotate-180">
          <Chev size={12} color={INK} />
        </span>
      </Link>
      <p
        className={`pointer-events-none absolute inset-x-0 text-center ${T_TITLE} ${W_BOLD}`}
      >
        {title}
      </p>
      {right}
    </div>
  );
}
