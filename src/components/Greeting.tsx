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

  return (
    <h2 className="min-h-9 text-[28px] font-bold leading-9">
      {daypart === null ? "" : (
        <>
          {daypart}
          {name ? `, ${name}` : ""} <span aria-hidden="true">👋</span>
        </>
      )}
    </h2>
  );
}
