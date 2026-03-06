import type { Metadata } from "next";
import CareersPage from "@/components/pages/CareersPage";
import type { OpenPosition } from "@/lib/types";
import { breadcrumbSchema } from "@/lib/seo";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Careers at VS-MJR Infotech | IT Jobs in Indore | Apply Now",
  description:
    "Join VS-MJR Infotech – IT jobs in Indore for Power BI developers, DMS/CRM engineers, Tally experts & more. View open positions and submit your application.",
  alternates: { canonical: "/careers" },
};

async function getPositions(): Promise<OpenPosition[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("open_positions")
    .select("id, title, department, location, type, description")
    .eq("is_active", true)
    .order("created_at", { ascending: true });
  return (data as OpenPosition[]) || [];
}

export default async function Page() {
  const positions = await getPositions();
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      hiringOrganization: { "@id": "https://vs-mjrinfotech.com/#organization" },
      jobLocation: {
        "@type": "Place",
        address: { "@type": "PostalAddress", addressLocality: "Indore", addressRegion: "MP", addressCountry: "IN" },
      },
      title: "Multiple IT Positions",
      description:
        "VS-MJR Infotech is hiring for various IT roles including Power BI developers, DMS/CRM engineers, Tally experts, and more.",
      employmentType: "FULL_TIME",
      datePosted: new Date().toISOString().split("T")[0],
    },
    breadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Careers", url: "/careers" },
    ]),
  ];

  return (
    <>
      <CareersPage positions={positions} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
