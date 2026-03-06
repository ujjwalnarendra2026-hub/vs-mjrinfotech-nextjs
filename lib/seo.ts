export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://vs-mjrinfotech.com/#organization",
  name: "VS-MJR Infotech Pvt Ltd",
  alternateName: "VS-MJR Infotech",
  url: "https://vs-mjrinfotech.com",
  logo: {
    "@type": "ImageObject",
    url: "https://vs-mjrinfotech.com/images/vs-mjr-logo.png",
  },
  description:
    "VS-MJR Infotech Pvt Ltd – Tailor-made IT solutions: DMS/CRM Implementation, Power BI, Tally Partner, Recruitment & Staffing, Software Development, and Skill Development.",
  foundingDate: "2021-02-05",
  address: [
    {
      "@type": "PostalAddress",
      addressLocality: "Indore",
      addressRegion: "Madhya Pradesh",
      addressCountry: "IN",
      streetAddress:
        "106, First Floor, Plot No 169, Scheme No. 113, Near Brilliant Convention Center, Vijay Nagar",
    },
    {
      "@type": "PostalAddress",
      addressLocality: "Gwalior",
      addressRegion: "Madhya Pradesh",
      postalCode: "474002",
      addressCountry: "IN",
      streetAddress: "Mahadev Apartment, Tansen Nagar",
    },
  ],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://vs-mjrinfotech.com/#website",
  url: "https://vs-mjrinfotech.com",
  name: "VS-MJR Infotech",
  description:
    "Tailor-made IT solutions for FMCG, distribution, and enterprise businesses across India.",
  publisher: { "@id": "https://vs-mjrinfotech.com/#organization" },
  potentialAction: {
    "@type": "SearchAction",
    target: "https://vs-mjrinfotech.com/?s={search_term_string}",
    "query-input": "required name=search_term_string",
  },
  inLanguage: "en-IN",
};

export const breadcrumbSchema = (items: { name: string; url?: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    ...(item.url ? { item: `https://vs-mjrinfotech.com${item.url}` } : {}),
  })),
});

export const serviceSchema = (name: string, description: string, url: string) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name,
  description,
  url: `https://vs-mjrinfotech.com${url}`,
  provider: { "@id": "https://vs-mjrinfotech.com/#organization" },
  areaServed: { "@type": "Country", name: "India" },
  serviceType: "IT Services",
});
