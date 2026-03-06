import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RATE_LIMIT_WINDOW_MINUTES = 60;
const RATE_LIMIT_MAX_REQUESTS = 5;

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeText(text: string, maxLen = 500): string {
  return String(text || "").trim().substring(0, maxLen);
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed.startsWith("https://")) return "";
  return escHtml(trimmed);
}

async function sendGmailSMTP(
  gmailUser: string,
  gmailPass: string,
  to: string,
  bcc: string,
  subject: string,
  html: string
): Promise<void> {
  const boundary = "----=_Part_" + Math.random().toString(36).substring(2);
  const from = gmailUser;
  const date = new Date().toUTCString();

  let rawHeaders = `From: VS-MJR Infotech <${from}>\r\nTo: ${to}\r\n`;
  if (bcc) rawHeaders += `Bcc: ${bcc}\r\n`;
  rawHeaders += `Subject: ${subject}\r\nDate: ${date}\r\nMIME-Version: 1.0\r\nContent-Type: multipart/alternative; boundary="${boundary}"\r\n\r\n`;

  const rawBody =
    `--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n${html}\r\n--${boundary}--`;

  const raw = rawHeaders + rawBody;

  const conn = await Deno.connectTls({
    hostname: "smtp.gmail.com",
    port: 465,
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const readLine = async (): Promise<string> => {
    const buf = new Uint8Array(4096);
    const n = await conn.read(buf);
    return decoder.decode(buf.subarray(0, n ?? 0));
  };

  const writeLine = async (line: string) => {
    await conn.write(encoder.encode(line + "\r\n"));
  };

  await readLine();
  await writeLine(`EHLO smtp.gmail.com`);
  await readLine();

  await writeLine("AUTH LOGIN");
  await readLine();
  await writeLine(btoa(gmailUser));
  await readLine();
  await writeLine(btoa(gmailPass));
  const authResp = await readLine();
  if (!authResp.startsWith("235")) {
    conn.close();
    throw new Error("SMTP AUTH failed: " + authResp);
  }

  await writeLine(`MAIL FROM:<${gmailUser}>`);
  await readLine();

  const allTo = [to, bcc].filter(Boolean).flatMap((r) => r.split(",").map((e) => e.trim()));
  for (const rcpt of allTo) {
    await writeLine(`RCPT TO:<${rcpt}>`);
    await readLine();
  }

  await writeLine("DATA");
  await readLine();

  await writeLine(raw + "\r\n.");
  await readLine();

  await writeLine("QUIT");
  conn.close();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body = await req.json();
    const { type } = body;

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // ── Rate Limiting ──────────────────────────────────────────────────
    const rateLimitKey = `${ip}:${type}`;
    const windowStart = new Date(
      Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000
    ).toISOString();

    const { data: rl } = await supabase
      .from("rate_limits")
      .select("*")
      .eq("identifier", rateLimitKey)
      .eq("action", type)
      .single();

    if (rl) {
      if (
        new Date(rl.window_start) > new Date(windowStart) &&
        rl.request_count >= RATE_LIMIT_MAX_REQUESTS
      ) {
        return new Response(
          JSON.stringify({ error: `Too many requests. Please try again in an hour.` }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (new Date(rl.window_start) <= new Date(windowStart)) {
        await supabase
          .from("rate_limits")
          .update({ request_count: 1, window_start: new Date().toISOString() })
          .eq("identifier", rateLimitKey)
          .eq("action", type);
      } else {
        await supabase
          .from("rate_limits")
          .update({ request_count: rl.request_count + 1 })
          .eq("identifier", rateLimitKey)
          .eq("action", type);
      }
    } else {
      await supabase.from("rate_limits").insert({
        identifier: rateLimitKey,
        action: type,
        request_count: 1,
        window_start: new Date().toISOString(),
      });
    }

    // ── Honeypot spam check ────────────────────────────────────────────
    if (body.website) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const gmailUser = Deno.env.get("GMAIL_USER")!;
    const gmailPass = Deno.env.get("GMAIL_APP_PASSWORD")!;
    const emailTo = Deno.env.get("EMAIL_TO")!;
    const emailBcc = Deno.env.get("EMAIL_BCC") || "";

    let emailSubject = "";
    let emailHtml = "";
    let dbInsert: Promise<{ error: unknown }>;

    if (type === "contact") {
      const name = sanitizeText(body.name, 100);
      const email = sanitizeText(body.email, 200);
      const phone = sanitizeText(body.phone, 20);
      const subject = sanitizeText(body.subject, 200);
      const message = sanitizeText(body.message, 2000);

      if (!name || !email || !message) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!validateEmail(email)) {
        return new Response(JSON.stringify({ error: "Invalid email address" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      emailSubject = `New Contact: ${escHtml(subject || "General Inquiry")} — VS-MJR Infotech`;
      emailHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#1a5276;border-bottom:2px solid #eee;padding-bottom:10px">New Contact Form Submission</h2>
        <table style="width:100%;border-collapse:collapse;margin-top:16px">
          <tr><td style="padding:10px 12px;font-weight:600;background:#f8f9fa;width:120px">Name</td><td style="padding:10px 12px;border-bottom:1px solid #eee">${escHtml(name)}</td></tr>
          <tr><td style="padding:10px 12px;font-weight:600;background:#f8f9fa">Email</td><td style="padding:10px 12px;border-bottom:1px solid #eee">${escHtml(email)}</td></tr>
          <tr><td style="padding:10px 12px;font-weight:600;background:#f8f9fa">Phone</td><td style="padding:10px 12px;border-bottom:1px solid #eee">${phone ? escHtml(phone) : "N/A"}</td></tr>
          <tr><td style="padding:10px 12px;font-weight:600;background:#f8f9fa">Subject</td><td style="padding:10px 12px;border-bottom:1px solid #eee">${subject ? escHtml(subject) : "N/A"}</td></tr>
          <tr><td style="padding:10px 12px;font-weight:600;background:#f8f9fa;vertical-align:top">Message</td><td style="padding:10px 12px;white-space:pre-wrap">${escHtml(message)}</td></tr>
        </table>
        <p style="color:#999;font-size:12px;margin-top:24px">Submitted from VS-MJR Infotech website • IP: ${escHtml(ip)}</p>
      </div>`;

      dbInsert = supabase.from("contact_submissions").insert({ name, email, phone, subject, message, ip_address: ip });

    } else if (type === "newsletter") {
      const name = sanitizeText(body.name, 100);
      const email = sanitizeText(body.email, 200);

      if (!name || !email) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!validateEmail(email)) {
        return new Response(JSON.stringify({ error: "Invalid email address" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: existing } = await supabase.from("newsletter_subscribers").select("id").eq("email", email).single();
      if (existing) {
        return new Response(JSON.stringify({ error: "This email is already subscribed." }), {
          status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      emailSubject = `New Newsletter Subscriber — VS-MJR Infotech`;
      emailHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#1a5276;border-bottom:2px solid #eee;padding-bottom:10px">New Newsletter Subscriber</h2>
        <table style="width:100%;border-collapse:collapse;margin-top:16px">
          <tr><td style="padding:10px 12px;font-weight:600;background:#f8f9fa;width:120px">Name</td><td style="padding:10px 12px;border-bottom:1px solid #eee">${escHtml(name)}</td></tr>
          <tr><td style="padding:10px 12px;font-weight:600;background:#f8f9fa">Email</td><td style="padding:10px 12px">${escHtml(email)}</td></tr>
        </table>
        <p style="color:#999;font-size:12px;margin-top:24px">Subscribed from VS-MJR Infotech website</p>
      </div>`;

      dbInsert = supabase.from("newsletter_subscribers").insert({ name, email, ip_address: ip });

    } else if (type === "career") {
      const name = sanitizeText(body.name, 100);
      const email = sanitizeText(body.email, 200);
      const phone = sanitizeText(body.phone, 20);
      const position = sanitizeText(body.position, 200);
      const cover_letter = sanitizeText(body.cover_letter, 2000);
      const linkedin_url = sanitizeText(body.linkedin_url, 300);

      if (!name || !email || !position) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!validateEmail(email)) {
        return new Response(JSON.stringify({ error: "Invalid email address" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      emailSubject = `New Job Application: ${escHtml(position)} — VS-MJR Infotech`;
      emailHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#1a5276;border-bottom:2px solid #eee;padding-bottom:10px">New Career Application</h2>
        <table style="width:100%;border-collapse:collapse;margin-top:16px">
          <tr><td style="padding:10px 12px;font-weight:600;background:#f8f9fa;width:140px">Name</td><td style="padding:10px 12px;border-bottom:1px solid #eee">${escHtml(name)}</td></tr>
          <tr><td style="padding:10px 12px;font-weight:600;background:#f8f9fa">Email</td><td style="padding:10px 12px;border-bottom:1px solid #eee">${escHtml(email)}</td></tr>
          <tr><td style="padding:10px 12px;font-weight:600;background:#f8f9fa">Phone</td><td style="padding:10px 12px;border-bottom:1px solid #eee">${phone ? escHtml(phone) : "N/A"}</td></tr>
          <tr><td style="padding:10px 12px;font-weight:600;background:#f8f9fa">Position</td><td style="padding:10px 12px;border-bottom:1px solid #eee;font-weight:700;color:#16a34a">${escHtml(position)}</td></tr>
          <tr><td style="padding:10px 12px;font-weight:600;background:#f8f9fa">LinkedIn</td><td style="padding:10px 12px;border-bottom:1px solid #eee">${linkedin_url ? `<a href="${safeUrl(linkedin_url)}">${escHtml(linkedin_url)}</a>` : "N/A"}</td></tr>
          <tr><td style="padding:10px 12px;font-weight:600;background:#f8f9fa;vertical-align:top">Cover Letter</td><td style="padding:10px 12px;white-space:pre-wrap">${cover_letter ? escHtml(cover_letter) : "N/A"}</td></tr>
        </table>
        <p style="color:#999;font-size:12px;margin-top:24px">Submitted from VS-MJR Infotech Careers page • IP: ${escHtml(ip)}</p>
      </div>`;

      dbInsert = supabase.from("career_applications").insert({ name, email, phone, position, cover_letter, linkedin_url, ip_address: ip });

    } else {
      return new Response(JSON.stringify({ error: "Invalid form type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Save to DB ─────────────────────────────────────────────────────
    const { error: dbError } = await dbInsert;
    if (dbError) {
      console.error("DB error:", dbError);
      return new Response(JSON.stringify({ error: "Failed to save submission" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Send Email ─────────────────────────────────────────────────────
    try {
      await sendGmailSMTP(gmailUser, gmailPass, emailTo, emailBcc, emailSubject, emailHtml);
    } catch (mailErr) {
      console.error("Email error:", mailErr);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
