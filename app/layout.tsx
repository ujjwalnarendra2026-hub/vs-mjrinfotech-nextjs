import type { Metadata } from "next";
import { Dosis, Open_Sans } from "next/font/google";
import "@/styles/globals.css";

const dosis = Dosis({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vs-mjrinfotech.com"),
  title: {
    default: "VS-MJR Infotech",
    template: "%s | VS-MJR Infotech",
  },
  description:
    "VS-MJR Infotech Pvt Ltd – Tailor-made IT solutions: DMS/CRM Implementation, Power BI, Tally Partner, Recruitment & Staffing, Software Development, and Skill Development across India.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://vs-mjrinfotech.com",
    title: "VS-MJR Infotech",
    description:
      "Tailor-made IT solutions for FMCG, distribution, and enterprise businesses across India.",
    images: [{ url: "/images/vs-mjr-logo.png", width: 1200, height: 630 }],
    locale: "en_IN",
    siteName: "VS-MJR Infotech",
  },
  twitter: {
    card: "summary_large_image",
    title: "VS-MJR Infotech",
    description:
      "Tailor-made IT solutions for FMCG, distribution, and enterprise businesses across India.",
    images: ["/images/vs-mjr-logo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dosis.variable} ${openSans.variable}`}>{children}</body>
    </html>
  );
}
