"use client";

import { motion } from "framer-motion";
import { Clock, HandHeart, Handshake, Target, Eye, Users } from "lucide-react";
import PageBanner from "@/components/PageBanner";

const taglineValues = [
  {
    icon: Clock,
    hindi: "समय",
    english: "Timely Delivery",
    text: "We value your time. Every milestone is met on schedule — no delays, no excuses.",
  },
  {
    icon: HandHeart,
    hindi: "संयम",
    english: "Patience & Dedication",
    text: "A patient and dedicated team that handles complex issues calmly with thoughtful solutions.",
  },
  {
    icon: Handshake,
    hindi: "सहमति",
    english: "Mutual Agreement",
    text: "Transparent dealings and long-term partnerships built on trust and consensus.",
  },
];

const visionMission = [
  {
    icon: Eye,
    title: "Our Vision",
    text: "To become one of the top IT service providers by delivering high-end solutions through technical experience, professional attitude, and experienced resources.",
  },
  {
    icon: Target,
    title: "Our Mission",
    text: "To enable people and companies to increase business value through IT. We aim to deliver services that open new possibilities for customers to work effectively and creatively.",
  },
  {
    icon: Users,
    title: "Who We Are",
    text: "A passionate tech team delivering full-range web solutions integrated with client operations — committed to customer satisfaction, long-term support, and close alignment throughout the project lifecycle.",
  },
];

const AboutPage = () => {

  return (
    <>
      <PageBanner
        title="About Us"
        breadcrumbs={[{ label: "Home", path: "/" }, { label: "About Us" }]}
      />

      {/* Main About */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 mb-20">
            <motion.div
              className="lg:w-5/12 flex justify-center"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative">
                <div className="absolute -inset-6 bg-primary/5 rounded-3xl blur-2xl" />
                <img
                  src="/images/banner-img1.png"
                  alt="About VS-MJR Infotech"
                  className="relative w-full max-w-sm mx-auto drop-shadow-xl"
                />
              </div>
            </motion.div>

            <motion.div
              className="lg:w-7/12"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <span className="section-title-badge">About Us</span>
              <h2 className="section-heading mt-1 mb-5">
                Thriving in Tech — Empowering Businesses
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4 text-sm md:text-base">
                VS-MJR Infotech is a passionate team of technology enthusiasts dedicated to creating cutting-edge solutions that empower businesses. With a commitment to quality, creativity, and customer satisfaction, we've emerged as a trusted partner for clients across India.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6 text-sm md:text-base">
                Led by focused and dedicated professionals known for their entrepreneurial skills and expertise across a wide spectrum of industries.
              </p>

              <div className="bg-secondary/40 rounded-2xl p-5 border border-border">
                <h4 className="font-bold text-foreground mb-2 font-heading text-base">Our Story</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Founded on <strong className="text-foreground">February 5, 2021</strong>, VS-MJR Infotech began as a small startup with a big vision: to revolutionize the digital world through innovative, practical software solutions tailored for Indian businesses.
                </p>
              </div>
            </motion.div>
          </div>

          {/* VS-MJR Name Meaning */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-10">
              <span className="section-title-badge">Our Name</span>
              <h2 className="section-heading mt-1">What VS-MJR Stands For</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
              {[
                {
                  label: "VS",
                  title: "Visionary Solutions",
                  text: "Innovative IT solutions that make your business future-ready, exploring new technologies for sustainable growth.",
                },
                {
                  label: "MJR",
                  title: "Mastering Journeys Realized",
                  text: "We master your digital journey — achieving milestones and delivering real, measurable outcomes for every project.",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  className="flex gap-5 p-6 bg-card rounded-2xl border border-border shadow-sm"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <div className="w-14 h-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-lg font-heading shrink-0">
                    {item.label}
                  </div>
                  <div>
                    <h3 className="font-bold text-primary font-heading mb-1">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Tagline Values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {taglineValues.map((item, i) => (
                <motion.div
                  key={item.hindi}
                  className="text-center p-7 bg-card rounded-2xl border border-border shadow-sm hover:border-primary/40 hover:shadow-md transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon size={26} className="text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-1 font-heading">{item.hindi}</h3>
                  <p className="text-sm font-semibold text-foreground mb-2">{item.english}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Vision / Mission / Who We Are */}
          <div>
            <div className="text-center mb-10">
              <span className="section-title-badge">Our Purpose</span>
              <h2 className="section-heading mt-1">Vision, Mission & Identity</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {visionMission.map((item, i) => (
                <motion.div
                  key={item.title}
                  className="p-6 bg-card rounded-2xl border border-border shadow-sm border-t-4 border-t-primary"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon size={18} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-3 font-heading">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;
