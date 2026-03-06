import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceDetailPage from "@/components/pages/ServiceDetailPage";
import { breadcrumbSchema, serviceSchema } from "@/lib/seo";
import { servicesData, serviceDescriptions, SERVICE_SLUGS } from "@/lib/services";

export async function generateStaticParams() {
  return SERVICE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = servicesData[slug];
  const description = serviceDescriptions[slug] || `${service?.title ?? "IT Service"} – professional IT services by VS-MJR Infotech Pvt Ltd.`;

  if (!service) {
    return {
      title: "Service Not Found",
      description: "Requested service page was not found.",
    };
  }

  return {
    title: `${service.title} | VS-MJR Infotech Indore`,
    description,
    alternates: { canonical: `/services/${slug}` },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!servicesData[slug]) notFound();

  const description =
    serviceDescriptions[slug] || `${servicesData[slug].title} – professional IT services by VS-MJR Infotech Pvt Ltd.`;
  const jsonLd = [
    serviceSchema(servicesData[slug].title, description, `/services/${slug}`),
    breadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Services", url: "/#services" },
      { name: servicesData[slug].title },
    ]),
  ];

  return (
    <>
      <ServiceDetailPage slug={slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
