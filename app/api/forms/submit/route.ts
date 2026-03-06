import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";
import { env } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const RATE_LIMIT_WINDOW_MINUTES = 60;
const RATE_LIMIT_MAX_REQUESTS = 5;

const contactSchema = z.object({
  type: z.literal("contact"),
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(20).optional().default(""),
  subject: z.string().trim().max(200).optional().default(""),
  message: z.string().trim().min(1).max(2000),
  website: z.string().optional().default(""),
});

const newsletterSchema = z.object({
  type: z.literal("newsletter"),
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  website: z.string().optional().default(""),
});

const careerSchema = z.object({
  type: z.literal("career"),
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(20).optional().default(""),
  position: z.string().trim().min(1).max(200),
  cover_letter: z.string().trim().max(2000).optional().default(""),
  linkedin_url: z.string().trim().max(300).optional().default(""),
  website: z.string().optional().default(""),
});

const payloadSchema = z.union([contactSchema, newsletterSchema, careerSchema]);

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

async function sendMail(subject: string, html: string) {
  if (!env.gmailUser || !env.gmailAppPassword || !env.emailTo) return;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.gmailUser,
      pass: env.gmailAppPassword,
    },
  });

  await transporter.sendMail({
    from: `VS-MJR Infotech <${env.gmailUser}>`,
    to: env.emailTo,
    bcc: env.emailBcc || undefined,
    subject,
    html,
  });
}

async function applyRateLimit(identifier: string, action: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { allowed: true };

  const windowStartIso = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();
  const { data: existing } = await supabase
    .from("rate_limits")
    .select("identifier, action, request_count, window_start")
    .eq("identifier", identifier)
    .eq("action", action)
    .maybeSingle();

  if (!existing) {
    await supabase.from("rate_limits").insert({
      identifier,
      action,
      request_count: 1,
      window_start: new Date().toISOString(),
    });
    return { allowed: true };
  }

  if (new Date(existing.window_start) > new Date(windowStartIso)) {
    if (existing.request_count >= RATE_LIMIT_MAX_REQUESTS) {
      return { allowed: false };
    }

    await supabase
      .from("rate_limits")
      .update({ request_count: existing.request_count + 1 })
      .eq("identifier", identifier)
      .eq("action", action);

    return { allowed: true };
  }

  await supabase
    .from("rate_limits")
    .update({ request_count: 1, window_start: new Date().toISOString() })
    .eq("identifier", identifier)
    .eq("action", action);

  return { allowed: true };
}

export async function POST(req: NextRequest) {
  const raw = await req.json().catch(() => null);
  const parsed = payloadSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form payload" }, { status: 400 });
  }

  const body = parsed.data;

  if (body.website) {
    return NextResponse.json({ success: true });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const rate = await applyRateLimit(`${ip}:${body.type}`, body.type);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again in an hour." }, { status: 429 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server is not configured" }, { status: 500 });
  }

  if (body.type === "contact") {
    const insert = await supabase.from("contact_submissions").insert({
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      subject: body.subject || null,
      message: body.message,
      ip_address: ip,
    });

    if (insert.error) {
      return NextResponse.json({ error: "Failed to save submission" }, { status: 500 });
    }

    await sendMail(
      `New Contact: ${escapeHtml(body.subject || "General Inquiry")} — VS-MJR Infotech`,
      `<p><strong>Name:</strong> ${escapeHtml(body.name)}</p><p><strong>Email:</strong> ${escapeHtml(body.email)}</p><p><strong>Phone:</strong> ${escapeHtml(
        body.phone || "N/A",
      )}</p><p><strong>Message:</strong><br/>${escapeHtml(body.message)}</p><p><small>IP: ${escapeHtml(ip)}</small></p>`,
    ).catch(() => null);

    return NextResponse.json({ success: true });
  }

  if (body.type === "newsletter") {
    const { data: existing } = await supabase.from("newsletter_subscribers").select("id").eq("email", body.email).maybeSingle();
    if (existing) {
      return NextResponse.json({ error: "This email is already subscribed." }, { status: 409 });
    }

    const insert = await supabase.from("newsletter_subscribers").insert({
      name: body.name,
      email: body.email,
      ip_address: ip,
    });

    if (insert.error) {
      return NextResponse.json({ error: "Failed to save submission" }, { status: 500 });
    }

    await sendMail(
      "New Newsletter Subscriber — VS-MJR Infotech",
      `<p><strong>Name:</strong> ${escapeHtml(body.name)}</p><p><strong>Email:</strong> ${escapeHtml(body.email)}</p>`,
    ).catch(() => null);

    return NextResponse.json({ success: true });
  }

  const insert = await supabase.from("career_applications").insert({
    name: body.name,
    email: body.email,
    phone: body.phone || null,
    position: body.position,
    cover_letter: body.cover_letter || null,
    linkedin_url: body.linkedin_url || null,
    ip_address: ip,
  });

  if (insert.error) {
    return NextResponse.json({ error: "Failed to save submission" }, { status: 500 });
  }

  await sendMail(
    `New Job Application: ${escapeHtml(body.position)} — VS-MJR Infotech`,
    `<p><strong>Name:</strong> ${escapeHtml(body.name)}</p><p><strong>Email:</strong> ${escapeHtml(body.email)}</p><p><strong>Position:</strong> ${escapeHtml(
      body.position,
    )}</p><p><strong>LinkedIn:</strong> ${escapeHtml(body.linkedin_url || "N/A")}</p><p><strong>Cover Letter:</strong><br/>${escapeHtml(
      body.cover_letter || "N/A",
    )}</p><p><small>IP: ${escapeHtml(ip)}</small></p>`,
  ).catch(() => null);

  return NextResponse.json({ success: true });
}
