"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Brain, HeadphonesIcon, IndianRupee, Rocket, Trophy, Layers } from "lucide-react";

const highlights = [
  {
    icon: Brain,
    title: "Specialized Domain Expertise",
    description: "Deep knowledge in DMS/CRM/SFA for FMCG & distribution, Power BI analytics, Tally with GST compliance — built on real industry experience.",
  },
  {
    icon: HeadphonesIcon,
    title: "Proactive & Responsive Support",
    description: "24×7 helpdesk, quick issue resolution, and handholding training — we keep your operations running smoothly.",
  },
  {
    icon: IndianRupee,
    title: "Cost-Effective & Flexible Models",
    description: "Affordable pricing with no compromises. Choose from project outsourcing, dedicated resources, staffing, or custom packages.",
  },
  {
    icon: Rocket,
    title: "Quick Deployment & PAN India Reach",
    description: "Fast onboarding (7–15 days typical) with proven project delivery across India from our Indore HQ.",
  },
  {
    icon: Trophy,
    title: "Proven Track Record",
    description: "Years of successful implementations helping businesses streamline operations, ensure compliance, and upskill teams.",
  },
  {
    icon: Layers,
    title: "One-Stop Solution Provider",
    description: "Implementation, analytics, staffing, accounting automation, and education via Educerns — everything under one roof.",
  },
];

const WhyChooseSection = () => {
  return (
    <section id="why-choose" className="section-padding relative bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="section-title-badge">Why Choose Us</span>
          <h2 className="section-heading mt-1">
            Why VS-MJR Infotech?
          </h2>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            Proactive, reliable IT solutions that drive real business growth — with deep expertise, quick response, and complete client satisfaction.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {highlights.map((item, index) => (
            <motion.div
              key={item.title}
              className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 group"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors duration-300">
                <item.icon size={20} className="text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="text-[15px] font-bold text-foreground mb-2 font-heading">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link href="/contact" className="btn-primary-custom shadow-md shadow-primary/20">
            Get Free Consultation
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
