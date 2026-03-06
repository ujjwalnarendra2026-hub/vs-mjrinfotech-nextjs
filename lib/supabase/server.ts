import { createClient } from "@supabase/supabase-js";
import { Agent, fetch as undiciFetch } from "undici";

const insecureTls = process.env.SUPABASE_INSECURE_TLS === "true";
const insecureDispatcher = insecureTls
  ? new Agent({ connect: { rejectUnauthorized: false } })
  : undefined;

export function getSupabaseAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }

  const customFetch = (input: any, init?: any) => {
    const headers = new Headers(init?.headers || {});

    // Supabase secret keys are valid in `apikey` header, but invalid as bearer JWT.
    if (supabaseServiceRoleKey.startsWith("sb_secret_")) {
      headers.delete("authorization");
    }

    const requestInit: any = { ...init, headers };
    if (insecureDispatcher) {
      requestInit.dispatcher = insecureDispatcher;
    }

    return undiciFetch(input, requestInit);
  };

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    global: {
      fetch: customFetch as any,
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
