"use client";

import { useEffect, useState } from "react";

// "Good afternoon, Simon". The one warm line in the app.
//
// Rendered after mount because the greeting depends on the phone's
// clock: the server lives in UTC, and a greeting that flips from
// morning to afternoon during hydration would tear the page. The empty
// div reserves the line's height so nothing jumps when it fills in.
export default function Greeting({ name }: { name: string | null }) {
  const [daypart, setDaypart] = useState<string | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    setDaypart(
      hour < 5
        ? "Good evening"
        : hour < 12
          ? "Good morning"
          : hour < 18
            ? "Good afternoon"
            : "Good evening"
    );
  }, []);

  // No emoji. v9.3 (August 2026): the owner kept the plain header
  // through every round of the redesign. truncate, because the line
  // now shares a row with the mark and the avatar, and a long name
  // must shorten rather than wrap the header to two lines.
  return (
    <h2 className="min-h-7 truncate text-2xl font-bold leading-7 tracking-[-0.01em]">
      {daypart === null ? "" : `${daypart}${name ? `, ${name}` : ""}`}
    </h2>
  );
}
