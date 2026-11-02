import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Portal - Portfolio CMS",
  description: "Manage and update your personal portfolio content dynamically.",
  icons: {
    icon: [
      { url: "/olifyhub.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/olifyhub.png",
    apple: "/olifyhub.png",
  },
  openGraph: {
    title: "Admin Portal - Portfolio CMS",
    description: "Manage and update your personal portfolio content dynamically.",
    type: "website",
    images: [
      {
        url: "/olifyhub.png",
        width: 180,
        height: 180,
        alt: "Admin Portal Logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Admin Portal - Portfolio CMS",
    description: "Manage and update your personal portfolio content dynamically.",
    images: ["/olifyhub.png"],
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen selection:bg-[var(--color-gold)] selection:text-[#101112]">
      {children}
    </div>
  );
}
