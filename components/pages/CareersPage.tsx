"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { Briefcase, Mail, ArrowRight, Send, Loader2, CheckCircle, MapPin, Clock, Building2 } from "lucide-react";
import type { OpenPosition } from "@/lib/types";

const perks = [
  "Work on real, impactful IT projects",
  "Learning & growth culture",
  "Flexible and collaborative environment",
  "Work with FMCG & enterprise clients",
];

const careerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(200),
  phone: z.string().trim().max(20).optional(),
  position: z.string().min(1, "Please select a position"),
  cover_letter: z.string().trim().max(2000).optional(),
  linkedin_url: z.string().trim().url("Invalid URL").max(300).optional().or(z.literal("")),
  website: z.string().optional(),
});

type FormState = z.infer<typeof careerSchema>;

export default function CareersPage({ positions = [] }: { positions: OpenPosition[] }) {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    position: "",
    cover_letter: "",
    linkedin_url: "",
    website: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    const result = careerSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0] as keyof FormState;
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...result.data, type: "career" }),
      });
      const data = await res.json();

      if (!res.ok || data?.error) {
        setSubmitError(data?.error || "Something went wrong. Please try again.");
      } else {
        setSuccess(true);
      }
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="pt-16 relative overflow-hidden">
        <motion.img
          src="/images/career.png"
          alt="Careers at VS-MJR Infotech"
          className="w-full max-h-[380px] object-cover object-center"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent pointer-events-none" />
      </div>

      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
            <motion.div className="lg:w-7/12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <span className="section-title-badge">Careers</span>
              <h2 className="section-heading mt-1 mb-5">Come Join Our Team</h2>
              <p className="text-muted-foreground leading-relaxed mb-4 text-sm md:text-base">
                Are you someone who thrives on a challenge and loves to learn and evolve at work? We're always looking for aspiring talent who are passionate
                about our mission of transforming businesses one at a time.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6 text-sm md:text-base">
                At VS-MJR Infotech, you'll work on real projects that impact FMCG, distribution, and enterprise clients across India.
              </p>

              <div className="bg-secondary/40 rounded-2xl p-5 border border-border mb-8 flex items-center gap-4">
                <Mail size={18} className="text-primary shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">You can also directly email your resume to</p>
                  <a href="mailto:careers@vs-mjrinfotech.com" className="text-primary font-semibold text-sm hover:underline">
                    careers@vs-mjrinfotech.com
                  </a>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-bold text-foreground font-heading text-lg mb-4 flex items-center gap-2">
                  <Briefcase size={18} className="text-primary" /> Open Positions
                </h3>
                {positions.length === 0 ? (
                  <div className="bg-secondary/40 border border-border rounded-xl p-6 text-center">
                    <Briefcase size={28} className="text-muted-foreground mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium text-foreground">No open positions right now</p>
                    <p className="text-xs text-muted-foreground mt-1">We're always open to great talent — send us a general application below.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {positions.map((pos) => (
                      <div key={pos.id} className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm">{pos.title}</p>
                          <div className="flex flex-wrap gap-3 mt-1">
                            {pos.department && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Building2 size={11} /> {pos.department}
                              </span>
                            )}
                            {pos.location && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin size={11} /> {pos.location}
                              </span>
                            )}
                            {pos.type && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock size={11} /> {pos.type}
                              </span>
                            )}
                          </div>
                          {pos.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{pos.description}</p>}
                        </div>
                        <button
                          onClick={() => {
                            setForm((prev) => ({ ...prev, position: pos.title }));
                            document.getElementById("career-form")?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="btn-primary-custom text-xs px-4 py-2 shrink-0"
                        >
                          Apply <ArrowRight size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div id="career-form" className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-foreground font-heading text-lg mb-1">Apply Now</h3>
                <p className="text-muted-foreground text-sm mb-6">Fill out the form below and we'll get back to you.</p>

                {success ? (
                  <div className="flex flex-col items-center py-10 text-center">
                    <CheckCircle size={48} className="text-primary mb-4" />
                    <h4 className="font-bold text-foreground text-lg mb-2">Application Submitted!</h4>
                    <p className="text-muted-foreground text-sm">Thank you for applying. We'll review your application and reach out soon.</p>
                    <button
                      onClick={() => {
                        setSuccess(false);
                        setForm({ name: "", email: "", phone: "", position: "", cover_letter: "", linkedin_url: "", website: "" });
                      }}
                      className="mt-6 btn-outline-custom text-sm px-5 py-2"
                    >
                      Submit Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="website" value={form.website} onChange={handleChange} className="hidden" tabIndex={-1} autoComplete="off" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">Full Name <span className="text-destructive">*</span></label>
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                          className="w-full border border-input rounded-lg px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                        {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">Email <span className="text-destructive">*</span></label>
                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          className="w-full border border-input rounded-lg px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                        {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">Phone</label>
                        <input
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+91 XXXXX XXXXX"
                          className="w-full border border-input rounded-lg px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">Position <span className="text-destructive">*</span></label>
                        <select
                          name="position"
                          value={form.position}
                          onChange={handleChange}
                          className="w-full border border-input rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                          <option value="">Select a position</option>
                          {positions.map((pos) => (
                            <option key={pos.id} value={pos.title}>{pos.title}</option>
                          ))}
                          <option value="General Application">General Application</option>
                        </select>
                        {errors.position && <p className="text-destructive text-xs mt-1">{errors.position}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">LinkedIn Profile</label>
                      <input
                        name="linkedin_url"
                        value={form.linkedin_url}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full border border-input rounded-lg px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      {errors.linkedin_url && <p className="text-destructive text-xs mt-1">{errors.linkedin_url}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Cover Letter</label>
                      <textarea
                        name="cover_letter"
                        value={form.cover_letter}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Tell us about your experience and why you'd like to join us"
                        className="w-full border border-input rounded-lg px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
                      />
                    </div>

                    {submitError && <p className="text-destructive text-sm">{submitError}</p>}

                    <button type="submit" disabled={submitting} className="btn-primary-custom inline-flex items-center gap-2 disabled:opacity-60">
                      {submitting ? (
                        <>
                          <Loader2 size={15} className="animate-spin" /> Submitting...
                        </>
                      ) : (
                        <>
                          Submit Application <Send size={14} />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>

            <motion.aside className="lg:w-5/12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}>
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24">
                <h3 className="font-heading text-xl font-bold text-foreground mb-4">Why Join VS-MJR</h3>
                <ul className="space-y-3">
                  {perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle size={16} className="text-primary mt-0.5 shrink-0" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.aside>
          </div>
        </div>
      </section>
    </>
  );
}
