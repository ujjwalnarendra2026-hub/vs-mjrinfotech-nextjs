"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const serviceLinks = [
  { label: "DMS/CRM Implementation & Helpdesk", path: "/services/dms-crm-implementation" },
  { label: "Power BI Project Outsourcing", path: "/services/power-bi-outsourcing" },
  { label: "Recruitment & Staffing", path: "/services/recruitment-staffing" },
  { label: "Tally Solutions with GST & Taxation", path: "/services/tally-solutions" },
  { label: "Software Development", path: "/services/software-development" },
  { label: "Education & Skill Development", path: "/services/education-skill-development" },
];

const navItems = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services", children: serviceLinks },
  { label: "Certificates", path: "/certificates" },
  { label: "About Us", path: "/about" },
  { label: "Careers", path: "/careers" },
  { label: "Contact Us", path: "/contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMobileDropdown(null);
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background shadow-lg py-2" : "bg-background/95 py-4"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <img
              src="/images/vs-mjr-logo.png"
              alt="VS-MJR Infotech"
              className="h-10 md:h-12"
            />
          </Link>
          <Link href="/certificates" className="flex items-center gap-1">
            <img src="/images/iso.png" alt="ISO 9001:2015" className="h-7 md:h-8" />
            <span className="text-sm font-bold text-primary">9001:2015</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center gap-1">
          {navItems.filter(i => i.label !== "Contact Us").map((item) => (
            <li
              key={item.path}
              className="relative"
              onMouseEnter={() => item.children && setOpenDropdown(item.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              {item.children ? (
                <button
                  className={`nav-link flex items-center gap-1 px-4 py-2 ${
                    isActive(item.path) ? "text-primary" : ""
                  }`}
                >
                  {item.label}
                  <ChevronDown size={14} />
                </button>
              ) : (
                <Link
                  href={item.path}
                  className={`nav-link block px-4 py-2 ${
                    isActive(item.path) ? "text-primary" : ""
                  }`}
                >
                  {item.label}
                </Link>
              )}

              {/* Dropdown */}
              {item.children && openDropdown === item.label && (
                <div className="absolute top-full left-0 bg-background border border-border rounded-md shadow-xl min-w-[300px] py-2 z-50">
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      href={child.path}
                      className="block px-5 py-2.5 text-sm text-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-150"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <Link
          href="/contact"
          className="hidden lg:inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          style={{ fontFamily: "'Dosis', sans-serif" }}
        >
          Get Consultation
        </Link>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-background border-t border-border overflow-hidden"
          >
            <ul className="container mx-auto py-4 space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  {item.children ? (
                    <>
                      <button
                        onClick={() =>
                          setMobileDropdown(
                            mobileDropdown === item.label ? null : item.label
                          )
                        }
                        className={`nav-link flex items-center justify-between w-full text-left py-2 px-2 ${
                          isActive(item.path) ? "text-primary" : ""
                        }`}
                      >
                        {item.label}
                        <ChevronDown
                          size={14}
                          className={`transition-transform ${
                            mobileDropdown === item.label ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {mobileDropdown === item.label && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pl-4 border-l-2 border-primary/30 ml-2"
                          >
                            {item.children.map((child) => (
                              <li key={child.path}>
                                <Link
                                  href={child.path}
                                  className="block py-2 px-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                  {child.label}
                                </Link>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={item.path}
                      className={`nav-link block w-full text-left py-2 px-2 ${
                        isActive(item.path) ? "text-primary" : ""
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
