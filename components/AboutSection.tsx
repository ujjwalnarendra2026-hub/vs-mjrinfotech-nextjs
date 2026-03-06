"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CheckCircle } from "lucide-react";

const stats = [
  { label: "Clients Served", value: 50, suffix: "+" },
  { label: "Projects Done", value: 100, suffix: "+" },
  { label: "Years Active", value: 5, suffix: "+" },
];

const highlights = [
  "DMS/CRM & SFA Specialists for FMCG",
  "Certified Tally Prime Partner",
  "Power BI Analytics Experts",
  "PAN India Support from Gwalior & Indore",
];

function useCounter(target: number, duration = 1400, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

const StatCounter = ({ label, value, suffix, trigger }: { label: string; value: number; suffix: string; trigger: boolean }) => {
  const count = useCounter(value, 1400, trigger);
  return (
    <div className="text-center">
      <div className="text-3xl font-extrabold text-primary font-heading leading-none">{count}{suffix}</div>
      <div className="text-xs text-muted-foreground mt-1.5 font-medium">{label}</div>
    </div>
  );
};

const AboutSection = () => {
  const [triggered, setTriggered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTriggered(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className="section-padding bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left: Image */}
          <motion.div
            className="lg:w-5/12 flex justify-center"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <div className="absolute -inset-6 bg-primary/5 rounded-3xl blur-2xl" />
              <img
                src="/images/about-img.png"
                alt="About VS-MJR Infotech"
                className="relative w-full max-w-sm mx-auto drop-shadow-xl"
              />
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            className="lg:w-7/12"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="section-title-badge">About Us</span>
            <h2 className="section-heading mt-1 mb-4">
              Your Trusted Partner in Specialized IT Solutions
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-5 text-sm md:text-base">
              VS-MJR Infotech is a dynamic IT solutions provider headquartered in Gwalior, with an expanding branch in Indore — empowering FMCG, distribution, and growing enterprises with tailored, cost-effective technology that drives efficiency and growth.
            </p>

            {/* Highlights */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-7">
              {highlights.map((h) => (
                <li key={h} className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle size={15} className="text-primary shrink-0" />
                  {h}
                </li>
              ))}
            </ul>

            {/* Stat counters */}
            <div
              ref={ref}
              className="grid grid-cols-3 gap-4 mb-8 bg-secondary/30 border border-border rounded-2xl p-5"
            >
              {stats.map((s) => (
                <StatCounter key={s.label} {...s} trigger={triggered} />
              ))}
            </div>

            <Link href="/about" className="btn-primary-custom shadow-md shadow-primary/20">
              Learn More About Us
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
