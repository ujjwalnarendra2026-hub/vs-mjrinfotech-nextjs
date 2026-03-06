"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";
import PageBanner from "@/components/PageBanner";
import { servicesData } from "@/lib/services";

export default function ServiceDetailPage({ slug }: { slug: string }) {
  const service = servicesData[slug];

  if (!service) {
    return (
      <>
        <PageBanner title="Service Not Found" breadcrumbs={[{ label: "Home", path: "/" }, { label: "Services" }]} />
        <div className="container mx-auto py-20 text-center">
          <p className="text-muted-foreground mb-6">The requested service page was not found.</p>
          <Link href="/" className="btn-primary-custom">
            Go Home
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBanner
        title={service.title}
        breadcrumbs={[{ label: "Home", path: "/" }, { label: "Services", path: "/" }, { label: service.title }]}
      />
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
            <motion.div className="lg:w-5/12 flex justify-center sticky top-24" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <div className="relative w-full">
                <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl" />
                <img src={service.image} alt={service.title} className="relative w-full max-w-md mx-auto rounded-2xl shadow-lg" loading="lazy" />
              </div>
            </motion.div>

            <motion.div className="lg:w-7/12" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
              <span className="section-title-badge">{service.badge}</span>

              {service.sections.map((section, i) => (
                <div key={section.heading + i} className={i > 0 ? "mt-8 pt-8 border-t border-border" : "mt-2"}>
                  <h2 className={`font-bold text-foreground mb-3 font-heading ${i === 0 ? "text-2xl md:text-3xl" : "text-xl"}`}>{section.heading}</h2>
                  {section.content && <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{section.content}</p>}
                  {section.list && (
                    <ul className="mt-4 space-y-2.5">
                      {section.list.map((item, j) => (
                        <li key={item + j} className="flex items-start gap-2.5 text-muted-foreground text-sm">
                          <CheckCircle size={16} className="text-primary mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              <div className="mt-10 pt-8 border-t border-border">
                <p className="text-muted-foreground text-sm mb-4">Interested in this service? Let's discuss how we can help.</p>
                <Link href="/contact" className="btn-primary-custom inline-flex items-center gap-2 shadow-md shadow-primary/20">
                  Get in Touch <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
