import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hides the floating dev badge so local design screenshots are clean.
  devIndicators: false,

  // The password era's addresses, kept alive so old bookmarks and old
  // emailed links land somewhere sensible. All three point at the one
  // auth page: there are no passwords, so there is nothing to forget
  // or reset. Not permanent, so browsers keep asking and the targets
  // can change again if the flow does.
  async redirects() {
    return [
      { source: "/signup", destination: "/login?new=1", permanent: false },
      { source: "/forgot-password", destination: "/login", permanent: false },
      { source: "/reset-password", destination: "/login", permanent: false },
    ];
  },
};

export default nextConfig;
