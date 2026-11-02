import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, Public_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-public-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://your-portfolio.web.app"
  ),
  title: "Personal Portfolio",
  description: "A modern, elegant personal portfolio website.",
  icons: {
    icon: [
      { url: "/olifyhub.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/olifyhub.png",
    apple: "/olifyhub.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Personal Portfolio",
    description: "A modern, elegant personal portfolio website.",
    type: "website",
    images: [
      {
        url: "/olifyhub.png",
        width: 180,
        height: 180,
        alt: "Personal Portfolio Logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Personal Portfolio",
    description: "A modern, elegant personal portfolio website.",
    images: ["/olifyhub.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#101112",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${publicSans.variable} scroll-smooth`}>
      <body className="bg-[#101112] text-[#8a8a8b] font-sans antialiased min-h-screen relative selection:bg-[var(--color-gold)] selection:text-[#101112]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
