"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Monitor, BarChart3, Users, Calculator, GraduationCap, Code } from "lucide-react";

const services = [
  {
    title: "DMS/CRM Implementation & Helpdesk",
    description: "End-to-end DMS/CRM/SFA rollout, training, user adoption, and 24×7 first-level helpdesk support for FMCG & distribution sectors.",
    path: "/services/dms-crm-implementation",
    icon: Monitor,
  },
  {
    title: "Power BI Project Outsourcing",
    description: "Complete Power BI development – dashboard design, DAX, data modeling, report automation. Flexible project outsourcing or dedicated resource models.",
    path: "/services/power-bi-outsourcing",
    icon: BarChart3,
  },
  {
    title: "Recruitment & Staffing",
    description: "Bulk tech talent sourcing – DMS engineers, Power BI developers, Tally experts. Contract, C2H, or permanent placements with quick onboarding.",
    path: "/services/recruitment-staffing",
    icon: Users,
  },
  {
    title: "Tally Solutions & GST Compliance",
    description: "Certified Tally Partner – sales, implementation, customization, GST filing support, taxation modules, TDC integrations, and AMC.",
    path: "/services/tally-solutions",
    icon: Calculator,
  },
  {
    title: "Software Development",
    description: "Custom software, web applications, enterprise solutions, and system integrations built with modern technologies for your business workflows.",
    path: "/services/software-development",
    icon: Code,
  },
  {
    title: "Education & Skill Development",
    description: "Industry-relevant IT courses, corporate training (Power BI, Tally, DMS), and skill development via our Educerns joint venture with placement support.",
    path: "/services/education-skill-development",
    icon: GraduationCap,
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="section-padding relative bg-secondary/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="section-title-badge">What We Do</span>
          <h2 className="section-heading mt-1">
            Professional IT Services For Your Business
          </h2>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            Tailored, cost-effective IT solutions focused on DMS/CRM, analytics, compliance, staffing, and skill development — with PAN India support.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              className="group bg-card rounded-xl p-7 border border-border shadow-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300 flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:scale-105 transition-all duration-300">
                <service.icon size={22} className="text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>

              {/* Title */}
              <h3 className="text-[15px] font-bold text-foreground mb-2.5 font-heading leading-snug">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground text-sm leading-relaxed mb-5 flex-1 line-clamp-3">
                {service.description}
              </p>

              {/* Link */}
              <Link href={service.path} className="read-more-link text-xs font-bold uppercase tracking-wider">
                Learn More <ArrowRight size={13} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
