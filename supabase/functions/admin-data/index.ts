import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RATE_LIMIT_WINDOW_MINUTES = 15;
const RATE_LIMIT_MAX_ATTEMPTS = 10;
const TOKEN_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours

// ── Token helpers ────────────────────────────────────────────────────────────

async function generateToken(secret: string): Promise<string> {
  const timestamp = Date.now().toString();
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(timestamp));
  const sigHex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${timestamp}.${sigHex}`;
}

async function verifyToken(token: string, secret: string): Promise<boolean> {
  if (!token || typeof token !== "string") return false;
  const dotIdx = token.indexOf(".");
  if (dotIdx === -1) return false;
  const timestamp = token.substring(0, dotIdx);
  const sigHex = token.substring(dotIdx + 1);
  const ts = parseInt(timestamp, 10);
  if (isNaN(ts) || Date.now() - ts > TOKEN_MAX_AGE_MS) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(timestamp));
  const expectedHex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return sigHex === expectedHex;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, token, password, table, id, notes, positionData, clientData, certData } = body;

    const adminPassword = Deno.env.get("ADMIN_PASSWORD");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // ── Rate limiting (all requests, including login) ─────────────────────
    const rateLimitKey = `${ip}:admin`;
    const windowStart = new Date(
      Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000
    ).toISOString();

    const { data: rl } = await supabase
      .from("rate_limits")
      .select("*")
      .eq("identifier", rateLimitKey)
      .eq("action", "admin")
      .single();

    if (rl) {
      if (
        new Date(rl.window_start) > new Date(windowStart) &&
        rl.request_count >= RATE_LIMIT_MAX_ATTEMPTS
      ) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (new Date(rl.window_start) <= new Date(windowStart)) {
        await supabase
          .from("rate_limits")
          .update({ request_count: 1, window_start: new Date().toISOString() })
          .eq("identifier", rateLimitKey)
          .eq("action", "admin");
      } else {
        await supabase
          .from("rate_limits")
          .update({ request_count: rl.request_count + 1 })
          .eq("identifier", rateLimitKey)
          .eq("action", "admin");
      }
    } else {
      await supabase.from("rate_limits").insert({
        identifier: rateLimitKey,
        action: "admin",
        request_count: 1,
        window_start: new Date().toISOString(),
      });
    }

    // ── Login action: verify password, return signed token ────────────────
    if (action === "login") {
      if (!adminPassword || password !== adminPassword) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const sessionToken = await generateToken(adminPassword);
      return new Response(JSON.stringify({ token: sessionToken }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── All other actions: verify token ───────────────────────────────────
    if (!adminPassword || !(await verifyToken(token, adminPassword))) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Fetch table data ────────────────────────────────────────────────
    if (action === "fetch") {
      const validTables = ["contact_submissions", "newsletter_subscribers", "career_applications", "open_positions", "clients", "certificates"];
      if (!validTables.includes(table)) {
        return new Response(JSON.stringify({ error: "Invalid table" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const orderCol = (table === "clients" || table === "certificates") ? "sort_order" : "created_at";
      const ascending = (table === "clients" || table === "certificates");
      const { data, error } = await supabase.from(table).select("*").order(orderCol, { ascending });
      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Update notes ────────────────────────────────────────────────────
    if (action === "update_notes") {
      const validTables = ["contact_submissions", "newsletter_subscribers", "career_applications"];
      if (!validTables.includes(table) || !id) {
        return new Response(JSON.stringify({ error: "Invalid params" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error } = await supabase.from(table).update({ admin_notes: notes }).eq("id", id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Update status ───────────────────────────────────────────────────
    if (action === "update_status") {
      const validTables = ["contact_submissions", "newsletter_subscribers", "career_applications"];
      if (!validTables.includes(table) || !id) {
        return new Response(JSON.stringify({ error: "Invalid params" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error } = await supabase.from(table).update({ status: body.status }).eq("id", id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Create open position ────────────────────────────────────────────
    if (action === "create_position") {
      if (!positionData?.title) {
        return new Response(JSON.stringify({ error: "Position title is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data, error } = await supabase
        .from("open_positions")
        .insert({
          title: String(positionData.title).trim().substring(0, 200),
          department: positionData.department ? String(positionData.department).trim().substring(0, 100) : null,
          location: positionData.location ? String(positionData.location).trim().substring(0, 100) : null,
          type: positionData.type ? String(positionData.type).trim().substring(0, 50) : "Full-time",
          description: positionData.description ? String(positionData.description).trim().substring(0, 1000) : null,
          is_active: true,
        })
        .select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Update open position ────────────────────────────────────────────
    if (action === "update_position") {
      if (!id || !positionData) {
        return new Response(JSON.stringify({ error: "Invalid params" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const updates: Record<string, unknown> = {};
      if (positionData.title !== undefined) updates.title = String(positionData.title).trim().substring(0, 200);
      if (positionData.department !== undefined) updates.department = positionData.department ? String(positionData.department).trim().substring(0, 100) : null;
      if (positionData.location !== undefined) updates.location = positionData.location ? String(positionData.location).trim().substring(0, 100) : null;
      if (positionData.type !== undefined) updates.type = String(positionData.type).trim().substring(0, 50);
      if (positionData.description !== undefined) updates.description = positionData.description ? String(positionData.description).trim().substring(0, 1000) : null;
      if (positionData.is_active !== undefined) updates.is_active = Boolean(positionData.is_active);
      const { error } = await supabase.from("open_positions").update(updates).eq("id", id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Delete open position ────────────────────────────────────────────
    if (action === "delete_position") {
      if (!id) {
        return new Response(JSON.stringify({ error: "ID required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error } = await supabase.from("open_positions").delete().eq("id", id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Upload file to storage ──────────────────────────────────────────
    if (action === "get_upload_url") {
      const { bucket, filename } = body;
      if (!bucket || !filename) {
        return new Response(JSON.stringify({ error: "bucket and filename required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const validBuckets = ["client-logos", "certificates"];
      if (!validBuckets.includes(bucket)) {
        return new Response(JSON.stringify({ error: "Invalid bucket" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const uniqueName = `${Date.now()}-${String(filename).replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(uniqueName);
      if (error) throw error;
      const publicUrl = supabase.storage.from(bucket).getPublicUrl(uniqueName).data.publicUrl;
      return new Response(JSON.stringify({ signedUrl: data.signedUrl, token: data.token, path: data.path, publicUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Delete file from storage ────────────────────────────────────────
    if (action === "delete_storage_file") {
      const { bucket, path: filePath } = body;
      if (!bucket || !filePath) {
        return new Response(JSON.stringify({ error: "bucket and path required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const validBuckets = ["client-logos", "certificates"];
      if (!validBuckets.includes(bucket)) {
        return new Response(JSON.stringify({ error: "Invalid bucket" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const filename = filePath.split("/").pop()!;
      await supabase.storage.from(bucket).remove([filename]);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Create client ───────────────────────────────────────────────────
    if (action === "create_client") {
      if (!clientData?.name || !clientData?.logo_url) {
        return new Response(JSON.stringify({ error: "name and logo_url required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: existing } = await supabase.from("clients").select("sort_order").order("sort_order", { ascending: false }).limit(1);
      const nextOrder = existing && existing.length > 0 ? (existing[0].sort_order + 1) : 0;
      const { data, error } = await supabase
        .from("clients")
        .insert({
          name: String(clientData.name).trim().substring(0, 200),
          logo_url: String(clientData.logo_url),
          sort_order: nextOrder,
          is_active: true,
        })
        .select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Update client ───────────────────────────────────────────────────
    if (action === "update_client") {
      if (!id || !clientData) {
        return new Response(JSON.stringify({ error: "Invalid params" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const updates: Record<string, unknown> = {};
      if (clientData.name !== undefined) updates.name = String(clientData.name).trim().substring(0, 200);
      if (clientData.logo_url !== undefined) updates.logo_url = String(clientData.logo_url);
      if (clientData.sort_order !== undefined) updates.sort_order = Number(clientData.sort_order);
      if (clientData.is_active !== undefined) updates.is_active = Boolean(clientData.is_active);
      const { error } = await supabase.from("clients").update(updates).eq("id", id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Delete client ───────────────────────────────────────────────────
    if (action === "delete_client") {
      if (!id) {
        return new Response(JSON.stringify({ error: "ID required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Reorder clients ─────────────────────────────────────────────────
    if (action === "reorder_clients") {
      const { orderedIds } = body;
      if (!Array.isArray(orderedIds)) {
        return new Response(JSON.stringify({ error: "orderedIds array required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      for (let i = 0; i < orderedIds.length; i++) {
        await supabase.from("clients").update({ sort_order: i }).eq("id", orderedIds[i]);
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Create certificate ──────────────────────────────────────────────
    if (action === "create_certificate") {
      if (!certData?.name || !certData?.file_url) {
        return new Response(JSON.stringify({ error: "name and file_url required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: existing } = await supabase.from("certificates").select("sort_order").order("sort_order", { ascending: false }).limit(1);
      const nextOrder = existing && existing.length > 0 ? (existing[0].sort_order + 1) : 0;
      const { data, error } = await supabase
        .from("certificates")
        .insert({
          name: String(certData.name).trim().substring(0, 200),
          file_url: String(certData.file_url),
          thumbnail_url: certData.thumbnail_url ? String(certData.thumbnail_url) : null,
          sort_order: nextOrder,
          is_active: true,
        })
        .select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Update certificate ──────────────────────────────────────────────
    if (action === "update_certificate") {
      if (!id || !certData) {
        return new Response(JSON.stringify({ error: "Invalid params" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const updates: Record<string, unknown> = {};
      if (certData.name !== undefined) updates.name = String(certData.name).trim().substring(0, 200);
      if (certData.file_url !== undefined) updates.file_url = String(certData.file_url);
      if (certData.thumbnail_url !== undefined) updates.thumbnail_url = certData.thumbnail_url ? String(certData.thumbnail_url) : null;
      if (certData.sort_order !== undefined) updates.sort_order = Number(certData.sort_order);
      if (certData.is_active !== undefined) updates.is_active = Boolean(certData.is_active);
      const { error } = await supabase.from("certificates").update(updates).eq("id", id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Delete certificate ──────────────────────────────────────────────
    if (action === "delete_certificate") {
      if (!id) {
        return new Response(JSON.stringify({ error: "ID required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error } = await supabase.from("certificates").delete().eq("id", id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Reorder certificates ────────────────────────────────────────────
    if (action === "reorder_certificates") {
      const { orderedIds } = body;
      if (!Array.isArray(orderedIds)) {
        return new Response(JSON.stringify({ error: "orderedIds array required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      for (let i = 0; i < orderedIds.length; i++) {
        await supabase.from("certificates").update({ sort_order: i }).eq("id", orderedIds[i]);
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
