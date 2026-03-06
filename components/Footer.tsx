"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Facebook, Twitter, Linkedin, Instagram, ArrowUp } from "lucide-react";

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <footer
        className="relative text-white/80 pt-16 pb-8"
        style={{
          background: "linear-gradient(135deg, hsl(220, 25%, 16%) 0%, hsl(220, 30%, 10%) 100%)",
        }}
      >
        {/* Background map texture */}
        <div
          className="absolute inset-0 opacity-[0.08] bg-center bg-no-repeat bg-contain pointer-events-none"
          style={{ backgroundImage: "url('/images/bg-map.png')" }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
            {/* Brand */}
            <div>
              <img
                src="/images/vs-mjr-logo.png"
                alt="VS-MJR Infotech"
                className="h-16 md:h-20 mb-3 brightness-200"
              />
              <p className="text-white font-bold text-sm mb-1">VS-MJR Infotech Pvt Ltd</p>
              <p className="text-white/50 text-xs italic mb-4">
                Visionary Solutions – Mastering Journeys Realized
              </p>
              <p className="text-white/50 text-xs mb-4">समय | संयम | सहमति</p>
              <p className="text-sm leading-relaxed text-white/60 mb-6">
                We are providing small, midsize and startup enterprises with
                tailored IT services – DMS/CRM implementation, Power BI
                analytics, Tally solutions, staffing, and skill development –
                uplifting business performance with innovative workflows &
                solutions.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { Icon: Facebook, href: "#" },
                  { Icon: Twitter, href: "#" },
                  { Icon: Linkedin, href: "#" },
                  { Icon: Instagram, href: "#" },
                ].map(({ Icon, href }, i) => (
                  <a
                    key={i}
                    href={href}
                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:bg-primary hover:border-primary hover:text-white transition-all duration-200"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
              <p className="text-white/40 text-xs mt-3">#SamaySanyamSahamati</p>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-white font-bold text-lg mb-2 font-heading">
                Services
              </h4>
              <div className="w-12 h-[3px] bg-primary mb-5" />
              <ul className="space-y-2.5 text-sm">
                {[
                  { label: "DMS/CRM Implementation & Helpdesk", path: "/services/dms-crm-implementation" },
                  { label: "Power BI Project Outsourcing", path: "/services/power-bi-outsourcing" },
                  { label: "Recruitment & Staffing", path: "/services/recruitment-staffing" },
                  { label: "Tally Solutions with GST & Taxation", path: "/services/tally-solutions" },
                  { label: "Software Development", path: "/services/software-development" },
                  { label: "Education & Skill Development", path: "/services/education-skill-development" },
                ].map((item) => (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className="text-white/60 hover:text-primary transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-white font-bold text-lg mb-2 font-heading">
                Contacts
              </h4>
              <div className="w-12 h-[3px] bg-primary mb-5" />
              <ul className="space-y-4 text-sm">
                <li>
                  <strong className="text-white block mb-0.5">Registered Address:</strong>
                  <span className="text-white/60">
                    Mahadev Apartment, Tansen Nagar Gwalior, Madhya Pradesh 474002
                  </span>
                </li>
                <li>
                  <strong className="text-white block mb-0.5">Head Office:</strong>
                  <span className="text-white/60">
                    106, First Floor, Plot No 169, Scheme No. 113, Near Brilliant Convention Center Vijay Nagar Indore
                  </span>
                </li>
                <li>
                  <strong className="text-white block mb-0.5">Email:</strong>
                  <a
                    href="mailto:getintouch@vs-mjrinfotech.com"
                    className="text-white/60 hover:text-primary transition-colors"
                  >
                    getintouch@vs-mjrinfotech.com
                  </a>
                </li>
                <li>
                  <strong className="text-white block mb-0.5">Phone:</strong>
                  <div className="flex flex-col gap-1">
                    <a href="tel:+918770680610" className="text-white/60 hover:text-primary transition-colors">
                      +91 87706 80610
                    </a>
                    <a href="tel:+917879811444" className="text-white/60 hover:text-primary transition-colors">
                      +91 78798 11444
                    </a>
                    <a href="tel:+919522096066" className="text-white/60 hover:text-primary transition-colors">
                      +91 95220 96066
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 pt-6 text-center text-xs text-white/40">
            <p>© 2026 <strong className="text-white">VS-MJR Infotech Pvt Ltd</strong>. All Rights Reserved.</p>
            <p className="mt-1 text-white/30 italic">Visionary Solutions – Mastering Journeys Realized | समय | संयम | सहमति</p>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:opacity-90 transition-all duration-200"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </>
  );
};

export default Footer;
