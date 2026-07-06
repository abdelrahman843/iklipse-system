import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

// Excon = base brand typeface (titles use Medium, body uses Regular).
const excon = localFont({
  src: [
    { path: "../../public/fonts/Excon-Light.woff2", weight: "300", style: "normal" },
    { path: "../../public/fonts/Excon-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/Excon-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/Excon-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-excon",
  display: "swap",
});

// PP Editorial Old = serif display, used italic for accent words.
const editorial = localFont({
  src: [
    { path: "../../public/fonts/PPEditorialOld-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/PPEditorialOld-Italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-editorial",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Iklipse Central Hub",
  description:
    "The command center for Iklipse - accountability, delivery, and craft in one fluid system of record.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${excon.variable} ${editorial.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full">
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('iklipse.theme')||'dark';document.documentElement.classList.toggle('dark',t!=='light');}catch(e){document.documentElement.classList.add('dark');}`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
