"use client";

import type { Client } from "@/lib/types";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import AboutSection from "@/components/AboutSection";
import ClientsSection from "@/components/ClientsSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import CTASection from "@/components/CTASection";

export default function HomePage({ clients }: { clients: Client[] }) {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <ClientsSection clients={clients} />
      <WhyChooseSection />
      <CTASection />
    </>
  );
}
