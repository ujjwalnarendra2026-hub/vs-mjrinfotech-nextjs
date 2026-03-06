"use client";

import PageBanner from "@/components/PageBanner";
import type { Certificate } from "@/lib/types";
import { ExternalLink, Award } from "lucide-react";

export default function CertificatePage({ certificates = [] }: { certificates: Certificate[] }) {
  return (
    <>
      <PageBanner
        title="Our Certifications"
        breadcrumbs={[
          { label: "Home", path: "/" },
          { label: "Certificates" },
        ]}
      />

      <section className="section-padding">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <span className="section-title-badge">Quality Assured</span>
            <h2 className="section-heading mt-2">Our Certifications</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              VS-MJR Infotech maintains the highest standards of quality and compliance, backed by internationally recognised certifications.
            </p>
          </div>

          {certificates.length === 0 ? (
            <div className="text-center py-20">
              <Award size={48} className="text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground">No certificates available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <a
                  key={cert.id}
                  href={cert.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-4 rounded-2xl border border-border bg-background p-6 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200"
                >
                  {cert.thumbnail_url ? (
                    <img src={cert.thumbnail_url} alt={cert.name} className="h-28 w-auto object-contain" />
                  ) : (
                    <div className="h-28 w-28 flex items-center justify-center rounded-xl bg-primary/10">
                      <Award size={48} className="text-primary" />
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="font-semibold text-foreground font-heading group-hover:text-primary transition-colors">{cert.name}</h3>
                    <span className="inline-flex items-center gap-1 mt-2 text-xs text-primary font-medium">
                      View Certificate <ExternalLink size={12} />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
