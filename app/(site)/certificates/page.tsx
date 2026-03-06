import type { Metadata } from "next";
import CertificatePage from "@/components/pages/CertificatePage";
import type { Certificate } from "@/lib/types";
import { breadcrumbSchema, organizationSchema } from "@/lib/seo";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Certificates | VS-MJR Infotech Quality Certifications",
  description:
    "VS-MJR Infotech holds quality certifications including ISO 9001:2015 — demonstrating commitment to quality management, customer satisfaction, and continuous improvement in IT services.",
  alternates: { canonical: "/certificates" },
};

async function getCertificates(): Promise<Certificate[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("certificates")
    .select("id, name, file_url, thumbnail_url, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data as Certificate[]) || [];
}

export default async function Page() {
  const certificates = await getCertificates();
  const jsonLd = [
    organizationSchema,
    breadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Certificates" },
    ]),
  ];

  return (
    <>
      <CertificatePage certificates={certificates} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
