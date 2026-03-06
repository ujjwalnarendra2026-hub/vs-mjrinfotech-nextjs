"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Mail, Phone, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import PageBanner from "@/components/PageBanner";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(200),
  phone: z.string().trim().max(20).optional(),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
  website: z.string().max(0, "").optional(),
});

type FormErrors = Partial<Record<keyof z.infer<typeof contactSchema>, string>>;

const contactDetails = [
  {
    icon: MapPin,
    title: "Registered Address",
    lines: ["Mahadev Apartment, Tansen Nagar", "Gwalior, Madhya Pradesh 474002"],
  },
  {
    icon: MapPin,
    title: "Head Office",
    lines: ["106, First Floor, Plot No 169, Scheme No. 113,", "Near Brilliant Convention Center, Vijay Nagar, Indore"],
  },
  {
    icon: Mail,
    title: "Email",
    lines: ["getintouch@vs-mjrinfotech.com"],
    href: "mailto:getintouch@vs-mjrinfotech.com",
  },
  {
    icon: Phone,
    title: "Phone",
    lines: ["+91 87706 80610", "+91 78798 11444", "+91 95220 96066"],
    phones: ["tel:+918770680610", "tel:+917879811444", "tel:+919522096066"],
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "", website: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const validate = (): boolean => {
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((e) => {
        const field = e.path[0] as keyof FormErrors;
        fieldErrors[field] = e.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type: "contact" }),
      });

      const data = await res.json();

      if (!res.ok || data?.error) {
        setErrorMsg(data?.error || "Submission failed. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setForm({ name: "", email: "", phone: "", subject: "", message: "", website: "" });
    } catch {
      setErrorMsg("Something went wrong. Please try again later.");
      setStatus("error");
    }
  };

  const inputClass = (field: keyof FormErrors) =>
    `contact-input ${errors[field] ? "border-red-500 ring-1 ring-red-500" : ""}`;

  return (
    <>
      <PageBanner title="Contact Us" breadcrumbs={[{ label: "Home", path: "/" }, { label: "Contact" }]} />

      <section className="section-padding relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 max-w-xl mx-auto">
            <span className="section-title-badge">Get In Touch</span>
            <h2 className="section-heading mt-1">Drop Us a Message</h2>
            <p className="text-muted-foreground mt-3 text-sm">Have an idea or a requirement? We'd love to hear about it and help you grow.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">
            <motion.div
              className="lg:w-5/12"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-5">
                {contactDetails.map((detail, i) => (
                  <motion.div
                    key={detail.title}
                    className="flex items-start gap-4 p-5 bg-card rounded-2xl border border-border shadow-sm hover:border-primary/30 transition-colors duration-200"
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                      <detail.icon size={17} className="text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1 text-sm">{detail.title}</h4>
                      {detail.phones ? (
                        <div className="flex flex-col gap-0.5">
                          {detail.lines.map((line, j) => (
                            <a key={line + j} href={detail.phones![j]} className="text-muted-foreground text-sm hover:text-primary transition-colors">
                              {line}
                            </a>
                          ))}
                        </div>
                      ) : detail.href ? (
                        <a href={detail.href} className="text-muted-foreground text-sm hover:text-primary transition-colors">
                          {detail.lines[0]}
                        </a>
                      ) : (
                        detail.lines.map((line, j) => (
                          <p key={line + j} className="text-muted-foreground text-sm">{line}</p>
                        ))
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="lg:w-7/12"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="bg-card rounded-2xl border border-border shadow-sm p-7 md:p-9">
                {status === "success" ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                    <CheckCircle size={52} className="text-primary" />
                    <h3 className="text-2xl font-bold text-foreground font-heading">Message Sent!</h3>
                    <p className="text-muted-foreground text-sm">Thank you for reaching out. We'll get back to you shortly.</p>
                    <button onClick={() => setStatus("idle")} className="btn-primary-custom mt-2 shadow-md shadow-primary/20">
                      Send Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <input
                      type="text"
                      name="website"
                      value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input type="text" placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass("name")} />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <input type="email" placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass("email")} />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>
                      <div>
                        <input type="text" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass("phone")} />
                      </div>
                      <div>
                        <input type="text" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputClass("subject")} />
                      </div>
                    </div>
                    <div>
                      <textarea
                        placeholder="Your Message *"
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className={`${inputClass("message")} resize-y`}
                      />
                      {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                    </div>

                    {status === "error" && (
                      <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                        <AlertCircle size={15} />
                        {errorMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="btn-primary-custom flex items-center gap-2 disabled:opacity-60 shadow-md shadow-primary/20"
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 size={15} className="animate-spin" /> Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <img src="/images/bg-map.png" alt="" className="absolute bottom-0 left-0 right-0 w-full opacity-[0.03] pointer-events-none" />
      </section>
    </>
  );
}
