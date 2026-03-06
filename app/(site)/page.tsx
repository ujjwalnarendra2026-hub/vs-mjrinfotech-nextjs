import type { Metadata } from "next";
import HomePage from "@/components/pages/Index";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { Client } from "@/lib/types";

export const metadata: Metadata = {
  title: "VS-MJR Infotech: Visionary Solutions - Mastering Journeys Realized | समय | संयम | सहमति",
  description:
    "VS-MJR Infotech Pvt Ltd – Tailor-made IT solutions: DMS/CRM Implementation, Power BI, Tally Partner, Recruitment & Staffing, Software Development, and Skill Development across India.",
  alternates: { canonical: "/" },
};

async function getClients(): Promise<Client[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];
  const { data } = await supabase.from("clients").select("id, name, logo_url, sort_order").eq("is_active", true).order("sort_order", { ascending: true });
  return (data as Client[]) || [];
}

export default async function Page() {
  const clients = await getClients();
  const jsonLd = [organizationSchema, websiteSchema];

  return (
    <>
      <HomePage clients={clients} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
