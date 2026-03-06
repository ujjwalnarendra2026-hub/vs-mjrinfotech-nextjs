import type { Metadata } from "next";
import ContactPage from "@/components/pages/ContactPage";
import { breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact VS-MJR Infotech | Get IT Solutions Quote | Indore, MP",
  description:
    "Contact VS-MJR Infotech Pvt Ltd for DMS/CRM, Power BI, Tally, staffing & software solutions. Offices in Indore and Gwalior, Madhya Pradesh. Call +91 87706 80610.",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      url: "https://vs-mjrinfotech.com/contact",
      name: "Contact VS-MJR Infotech",
      description: "Get in touch with VS-MJR Infotech for IT services across India.",
      mainEntity: { "@id": "https://vs-mjrinfotech.com/#organization" },
    },
    breadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Contact", url: "/contact" },
    ]),
  ];

  return (
    <>
      <ContactPage />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
