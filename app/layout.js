import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Circle of Deeds",
  description: "Do something kind for a stranger, hand it to them with a code, and watch it travel. A Random Good Deeds Society project.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://circleofdeeds.app"),
  openGraph: { title: "Circle of Deeds", description: "One held door. Seven hundred miles.", type: "website" },
};

export const viewport = { themeColor: "#182B4A", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Public+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap" />
      </head>
      <body>
        <header className="top">
          <div className="wrap">
            <Link className="logo" href="/" aria-label="Circle of Deeds home">
              <svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="11" fill="none" stroke="currentColor" strokeWidth="3"/><circle cx="14" cy="3.5" r="3.5" fill="#E9A93A"/><circle cx="23.5" cy="19" r="3" fill="#E9A93A"/><circle cx="4.5" cy="19" r="3" fill="#E9A93A"/></svg>
              <span>Circle of Deeds<small>by Random Good Deeds Society</small></span>
            </Link>
            <nav className="top">
              <Link href="/start">Pass it on</Link>
              <Link href="/d">Got a code?</Link>
              <Link href="/impact">Impact</Link>
              <Link href="/journal">Journal</Link>
            </nav>
            <Link className="btn sm gold" href="/start">Pass it on</Link>
          </div>
        </header>
        {children}
        <footer><div className="wrap">© 2026 Random Good Deeds Society · Circle of Deeds · No names, no messaging, city-level location only.</div></footer>
      </body>
    </html>
  );
}
