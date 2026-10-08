import type { Metadata, Viewport } from "next";
import { League_Spartan } from "next/font/google";
import { baseOpenGraph, SITE_NAME, SITE_URL, websiteJsonLd } from "@/lib/site";
import "./globals.css";

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-league-spartan",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Exquisite dining since 1989`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Dine is a farmhouse restaurant in Sedbergh, Cumbria, serving a seasonal menu of locally sourced food since 1989.",
  applicationName: SITE_NAME,
  openGraph: baseOpenGraph,
};

export const viewport: Viewport = {
  themeColor: "#111111",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={leagueSpartan.variable} suppressHydrationWarning>
      <head>
        {/* Marks the page as scripted before first paint, so no-JavaScript notes never flash. */}
        <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.classList.add("js")' }} />
      </head>
      <body>
        <script
          type="application/ld+json"
          // Static, trusted object; escape "<" so the JSON can never close the script tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }}
        />
        {children}
      </body>
    </html>
  );
}
