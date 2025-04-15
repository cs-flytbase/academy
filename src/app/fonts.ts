// In src/app/fonts.ts
import localFont from "next/font/local";

export const atlassianSans = localFont({
  src: [
    {
      path: "../../public/fonts/Regular-f4be8ca999124b721baa68bd921f2dc1.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Regular-4283c1ebd390bb40ee26e306032b05f7.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Medium-86a22574f3ee0828684396794e12aedb.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Bold-59b6092d539c7a6bef14bd679be65720.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/AtlassianSans-latin.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-atlassian-sans",
});

// Set this as the primary font for the application
export const primaryFont = atlassianSans;