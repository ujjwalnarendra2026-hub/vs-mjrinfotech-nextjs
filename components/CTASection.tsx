"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Send, CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

const newsletterSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email").max(200),
});

export default function CTASection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = newsletterSchema.safeParse({ name, email });
    if (!result.success) {
      const fieldErrors: { name?: string; email?: string } = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as "name" | "email";
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, type: "newsletter" }),
      });

      const data = await res.json();

      if (!res.ok || data?.error) {
        setErrorMsg(data?.error || "Subscription failed. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setName("");
      setEmail("");
    } catch {
      setErrorMsg("Something went wrong. Please try again later.");
      setStatus("error");
    }
  };

  return (
    <>
      <section
        className="relative py-24 md:py-32 overflow-hidden"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/images/cta-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase mb-3 text-white/60">
              We Take Care of Your Technology
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 font-heading text-white leading-tight">
              Focus on Growing
              <br />
              Your Business
            </h2>
            <p className="text-white/60 text-sm md:text-base mb-8 max-w-md mx-auto">
              Let VS-MJR handle your IT — from implementation to support — so you can focus on what matters most.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="btn-outline-light flex items-center gap-2">
                Contact Us <ArrowRight size={15} />
              </Link>
              <Link href="/contact" className="btn-primary-custom flex items-center gap-2">
                Get Free Consultation
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section
        className="relative py-14 md:py-20"
        style={{ background: "linear-gradient(135deg, hsl(220, 25%, 14%) 0%, hsl(220, 30%, 9%) 100%)" }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-md mx-auto rounded-2xl p-8 md:p-10"
            style={{ background: "linear-gradient(135deg, hsl(110, 68%, 42%) 0%, hsl(130, 60%, 36%) 100%)" }}
          >
            <h3 className="text-xl md:text-2xl font-bold text-white font-heading mb-1 text-center">Subscribe To Our Newsletter</h3>
            <p className="text-white/60 text-xs text-center mb-6">Get industry updates, tips & offers directly in your inbox.</p>

            {status === "success" ? (
              <div className="flex flex-col items-center gap-3 py-6 text-white text-center">
                <CheckCircle size={44} className="text-white" />
                <p className="font-bold text-lg">You're subscribed!</p>
                <p className="text-white/70 text-sm">Thank you for joining our newsletter.</p>
                <button onClick={() => setStatus("idle")} className="mt-2 text-sm underline text-white/60 hover:text-white">
                  Subscribe another email
                </button>
              </div>
            ) : (
              <form className="space-y-3" onSubmit={handleSubmit} noValidate>
                <div>
                  <input
                    type="text"
                    placeholder="Your Name *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/15 text-white placeholder:text-white/50 border border-white/10 outline-none text-sm focus:border-white/40 transition-colors"
                    aria-label="Your name"
                    required
                  />
                  {errors.name && <p className="text-white/90 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Your Email *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/15 text-white placeholder:text-white/50 border border-white/10 outline-none text-sm focus:border-white/40 transition-colors"
                    aria-label="Your email"
                    required
                  />
                  {errors.email && <p className="text-white/90 text-xs mt-1">{errors.email}</p>}
                </div>
                {status === "error" && (
                  <div className="flex items-center gap-2 text-white text-xs bg-white/10 rounded-lg px-3 py-2">
                    <AlertCircle size={13} />
                    {errorMsg}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider bg-white text-primary flex items-center justify-center gap-2 transition-all duration-300 hover:bg-white/90 disabled:opacity-60"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Subscribing...
                    </>
                  ) : (
                    <>
                      Subscribe Now <Send size={14} />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </>
  );
}
