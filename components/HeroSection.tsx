"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const bulletPoints = [
  "Seamless DMS/SFA Rollout & User Adoption for FMCG",
  "Complete Power BI Dashboard Development",
  "Bulk Tech Staffing & Tally Solutions",
  "Corporate GST & Taxation Training via Educerns Venture",
];

const taglineWords = ["समय", " | ", "संयम", " | ", "सहमति"];

const stats = [
  { label: "Happy Clients", value: 50, suffix: "+" },
  { label: "Projects Delivered", value: 100, suffix: "+" },
  { label: "Years Experience", value: 5, suffix: "+" },
  { label: "Cities Covered", value: 10, suffix: "+" },
];

function useCounter(target: number, duration = 1500, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

const StatItem = ({ label, value, suffix, trigger }: { label: string; value: number; suffix: string; trigger: boolean }) => {
  const count = useCounter(value, 1500, trigger);
  return (
    <div className="text-center px-4 py-4">
      <div className="text-3xl md:text-4xl font-extrabold text-primary font-heading leading-none">
        {count}{suffix}
      </div>
      <div className="text-xs md:text-sm text-muted-foreground mt-1.5 font-medium">{label}</div>
    </div>
  );
};

const HeroSection = () => {
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="home" className="relative flex flex-col overflow-hidden bg-background">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, hsl(110,68%,38%), transparent 70%)" }} />
        <div className="absolute top-1/3 -right-48 w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, hsl(130,55%,35%), transparent 70%)" }} />
        <div className="absolute -bottom-20 left-1/4 w-[350px] h-[350px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, hsl(110,68%,38%), transparent 70%)" }} />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-32 pb-4">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Left Content */}
          <motion.div
            className="lg:w-7/12 text-center lg:text-left"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.p
              className="text-xs md:text-sm font-bold text-primary mb-4 uppercase tracking-[0.2em]"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Visionary Solutions – Mastering Journeys Realized
            </motion.p>

            <h1 className="text-[30px] sm:text-4xl md:text-5xl lg:text-5xl xl:text-[58px] font-extrabold leading-[1.1] mb-5 font-heading text-foreground">
              Tailor-Made IT Solutions<br />
              That Deliver{" "}
              <span className="text-primary relative inline-block">
                Real Value
                <span className="absolute bottom-0 left-0 w-full h-1 bg-primary/20 rounded-full" />
              </span>
            </h1>

            <div className="flex items-center justify-center lg:justify-start gap-2 mb-6 text-xl md:text-2xl font-bold font-heading">
              {taglineWords.map((word, i) => (
                <motion.span
                  key={i}
                  className={word === " | " ? "text-border" : "text-primary"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.15, duration: 0.4 }}
                >
                  {word}
                </motion.span>
              ))}
            </div>

            <ul className="space-y-2.5 mb-8 text-left max-w-xl mx-auto lg:mx-0">
              {bulletPoints.map((point, i) => (
                <motion.li
                  key={point}
                  className="flex items-start gap-2.5 text-muted-foreground text-sm md:text-[15px]"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <CheckCircle size={17} className="text-primary mt-0.5 shrink-0" />
                  <span>{point}</span>
                </motion.li>
              ))}
            </ul>

            <motion.div
              className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Link href="/contact" className="btn-primary-custom flex items-center gap-2 w-full sm:w-auto justify-center shadow-lg shadow-primary/25">
                Free Consultation <ArrowRight size={15} />
              </Link>
              <Link href="/contact" className="btn-outline-custom flex items-center gap-2 w-full sm:w-auto justify-center">
                Share Your Requirement
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            className="lg:w-5/12 flex justify-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-3xl scale-110" />
              <img
                src="/images/home-bg-1-img.png"
                alt="IT Services illustration"
                className="relative w-full max-w-md lg:max-w-lg mx-auto drop-shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Strip */}
      <motion.div
        ref={statsRef}
        className="relative z-10 w-full mt-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
      >
        <div className="container mx-auto px-4 pb-4">
          <div className="bg-card border border-border rounded-2xl shadow-md grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border overflow-hidden">
            {stats.map((stat) => (
              <StatItem key={stat.label} {...stat} trigger={statsVisible} />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
