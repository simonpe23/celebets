"use client";

import { useEffect, useRef } from "react";

// THE PANEL THAT HOLDS LOG IN AND SIGN UP ON THE LANDING PAGE.
//
// The shell only: what it contains is passed in, so log in and sign up
// share one set of open/close behaviour rather than two copies that
// drift.
//
// Its shape is InsightsPopup's, deliberately. That file already decided
// what a popup looks like in this app (dim the page, rise from the
// bottom of a phone, centre on a laptop) and a second style would make
// the landing page feel like a different product from the app behind
// it.
//
// WHAT THIS ADDS over that pattern, because the owner asked for it:
// Escape closes, tapping the dimmed area closes, the page underneath
// cannot scroll while it is open, and focus moves into the panel when
// it opens so a keyboard or a screen reader lands inside rather than
// back at the top of the landing page.
//
// NONE OF THAT SHOWS UP IN A SCREENSHOT. Per the permanent rule in
// CLAUDE.md, every behaviour here is driven in a real browser before
// the panel is shown to the owner.
export default function AuthPanel({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape closes. Bound to the document, not the panel, so it works
  // no matter where focus happens to sit.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Hold the page still underneath. Without this the landing page
  // scrolls under the panel on a phone, so closing it drops the
  // visitor somewhere they never chose to be.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Move focus inside on open, so the first thing a keyboard or a
  // screen reader meets is the email field, not the page behind.
  useEffect(() => {
    if (!open) return;
    const first = panelRef.current?.querySelector<HTMLElement>(
      "input, button, a"
    );
    first?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
      // The dim is the close target. The check keeps a click that
      // STARTED inside the panel and drifted out (dragging to select
      // text in the email field) from closing it.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[92dvh] w-full max-w-sm overflow-y-auto rounded-t-2xl bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] dark:bg-[#161D38] sm:rounded-2xl sm:pb-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg px-3 py-1 text-sm text-neutral-500 dark:text-neutral-400"
          >
            Close
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
