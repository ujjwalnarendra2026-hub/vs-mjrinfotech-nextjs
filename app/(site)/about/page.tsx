import type { Metadata } from "next";
import AboutPage from "@/components/pages/AboutPage";
import { breadcrumbSchema, organizationSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About VS-MJR Infotech | IT Company in Indore & Gwalior | Est. 2021",
  description:
    "Learn about VS-MJR Infotech Pvt Ltd — founded in 2021, ISO 9001:2015 certified IT company in Indore delivering DMS/CRM, Power BI, Tally, staffing, and software solutions across India.",
  alternates: { canonical: "/about" },
};

export default function Page() {
  const jsonLd = [
    organizationSchema,
    breadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "About Us", url: "/about" },
    ]),
  ];

  return (
    <>
      <AboutPage />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
