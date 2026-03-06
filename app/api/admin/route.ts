import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { generateAdminToken, verifyAdminToken } from "@/lib/security";

const RATE_LIMIT_WINDOW_MINUTES = 15;
const RATE_LIMIT_MAX_ATTEMPTS = 10;

async function applyAdminRateLimit(ip: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { allowed: true };

  const identifier = `${ip}:admin`;
  const action = "admin";
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
    if (existing.request_count >= RATE_LIMIT_MAX_ATTEMPTS) return { allowed: false };
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

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const action = body.action as string;
  const token = body.token as string | undefined;

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const rate = await applyAdminRateLimit(ip);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server is not configured" }, { status: 500 });
  }

  if (action === "login") {
    if (!env.adminPassword || body.password !== env.adminPassword) return unauthorized();
    return NextResponse.json({ token: generateAdminToken(env.adminPassword) });
  }

  if (!env.adminPassword || !token || !verifyAdminToken(token, env.adminPassword)) {
    return unauthorized();
  }

  if (action === "fetch") {
    const table = body.table as string;
    const validTables = [
      "contact_submissions",
      "newsletter_subscribers",
      "career_applications",
      "open_positions",
      "clients",
      "certificates",
    ];
    if (!validTables.includes(table)) {
      return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }
    const orderCol = table === "clients" || table === "certificates" ? "sort_order" : "created_at";
    const ascending = table === "clients" || table === "certificates";
    const { data, error } = await supabase.from(table).select("*").order(orderCol, { ascending });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (action === "update_notes") {
    const { table, id, notes } = body as { table: string; id: string; notes: string };
    const validTables = ["contact_submissions", "newsletter_subscribers", "career_applications"];
    if (!validTables.includes(table) || !id) return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    const { error } = await supabase.from(table).update({ admin_notes: notes }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "update_status") {
    const { table, id, status } = body as { table: string; id: string; status: string };
    const validTables = ["contact_submissions", "newsletter_subscribers", "career_applications"];
    if (!validTables.includes(table) || !id) return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    const { error } = await supabase.from(table).update({ status }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "create_position") {
    const positionData = body.positionData;
    if (!positionData?.title) return NextResponse.json({ error: "Position title is required" }, { status: 400 });
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
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (action === "update_position") {
    const { id, positionData } = body;
    if (!id || !positionData) return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    const updates: Record<string, unknown> = {};
    if (positionData.title !== undefined) updates.title = String(positionData.title).trim().substring(0, 200);
    if (positionData.department !== undefined) updates.department = positionData.department ? String(positionData.department).trim().substring(0, 100) : null;
    if (positionData.location !== undefined) updates.location = positionData.location ? String(positionData.location).trim().substring(0, 100) : null;
    if (positionData.type !== undefined) updates.type = String(positionData.type).trim().substring(0, 50);
    if (positionData.description !== undefined) updates.description = positionData.description ? String(positionData.description).trim().substring(0, 1000) : null;
    if (positionData.is_active !== undefined) updates.is_active = Boolean(positionData.is_active);
    const { error } = await supabase.from("open_positions").update(updates).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "delete_position") {
    if (!body.id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    const { error } = await supabase.from("open_positions").delete().eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "get_upload_url") {
    const { bucket, filename } = body as { bucket: string; filename: string };
    if (!bucket || !filename) return NextResponse.json({ error: "bucket and filename required" }, { status: 400 });
    const validBuckets = ["client-logos", "certificates"];
    if (!validBuckets.includes(bucket)) return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
    const uniqueName = `${Date.now()}-${String(filename).replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(uniqueName);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const publicUrl = supabase.storage.from(bucket).getPublicUrl(uniqueName).data.publicUrl;
    return NextResponse.json({ signedUrl: data.signedUrl, token: data.token, path: data.path, publicUrl });
  }

  if (action === "delete_storage_file") {
    const { bucket, path } = body as { bucket: string; path: string };
    if (!bucket || !path) return NextResponse.json({ error: "bucket and path required" }, { status: 400 });
    const filename = path.split("/").pop();
    if (!filename) return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    const { error } = await supabase.storage.from(bucket).remove([filename]);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "create_client") {
    const clientData = body.clientData;
    if (!clientData?.name || !clientData?.logo_url) return NextResponse.json({ error: "name and logo_url required" }, { status: 400 });
    const { data: existing } = await supabase.from("clients").select("sort_order").order("sort_order", { ascending: false }).limit(1);
    const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;
    const { data, error } = await supabase
      .from("clients")
      .insert({
        name: String(clientData.name).trim().substring(0, 200),
        logo_url: String(clientData.logo_url),
        sort_order: nextOrder,
        is_active: true,
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (action === "update_client") {
    const { id, clientData } = body;
    if (!id || !clientData) return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    const updates: Record<string, unknown> = {};
    if (clientData.name !== undefined) updates.name = String(clientData.name).trim().substring(0, 200);
    if (clientData.logo_url !== undefined) updates.logo_url = String(clientData.logo_url);
    if (clientData.sort_order !== undefined) updates.sort_order = Number(clientData.sort_order);
    if (clientData.is_active !== undefined) updates.is_active = Boolean(clientData.is_active);
    const { error } = await supabase.from("clients").update(updates).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "delete_client") {
    if (!body.id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    const { error } = await supabase.from("clients").delete().eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "reorder_clients") {
    const orderedIds = body.orderedIds as string[];
    if (!Array.isArray(orderedIds)) return NextResponse.json({ error: "orderedIds array required" }, { status: 400 });
    for (let i = 0; i < orderedIds.length; i += 1) {
      await supabase.from("clients").update({ sort_order: i }).eq("id", orderedIds[i]);
    }
    return NextResponse.json({ success: true });
  }

  if (action === "create_certificate") {
    const certData = body.certData;
    if (!certData?.name || !certData?.file_url) return NextResponse.json({ error: "name and file_url required" }, { status: 400 });
    const { data: existing } = await supabase.from("certificates").select("sort_order").order("sort_order", { ascending: false }).limit(1);
    const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;
    const { data, error } = await supabase
      .from("certificates")
      .insert({
        name: String(certData.name).trim().substring(0, 200),
        file_url: String(certData.file_url),
        thumbnail_url: certData.thumbnail_url ? String(certData.thumbnail_url) : null,
        sort_order: nextOrder,
        is_active: true,
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (action === "update_certificate") {
    const { id, certData } = body;
    if (!id || !certData) return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    const updates: Record<string, unknown> = {};
    if (certData.name !== undefined) updates.name = String(certData.name).trim().substring(0, 200);
    if (certData.file_url !== undefined) updates.file_url = String(certData.file_url);
    if (certData.thumbnail_url !== undefined) updates.thumbnail_url = certData.thumbnail_url ? String(certData.thumbnail_url) : null;
    if (certData.sort_order !== undefined) updates.sort_order = Number(certData.sort_order);
    if (certData.is_active !== undefined) updates.is_active = Boolean(certData.is_active);
    const { error } = await supabase.from("certificates").update(updates).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "delete_certificate") {
    if (!body.id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    const { error } = await supabase.from("certificates").delete().eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "reorder_certificates") {
    const orderedIds = body.orderedIds as string[];
    if (!Array.isArray(orderedIds)) return NextResponse.json({ error: "orderedIds array required" }, { status: 400 });
    for (let i = 0; i < orderedIds.length; i += 1) {
      await supabase.from("certificates").update({ sort_order: i }).eq("id", orderedIds[i]);
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
