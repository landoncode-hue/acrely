import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types/database";

const getSupabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const getSupabaseAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const getSupabaseServiceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";

// Lazy initialization to avoid build-time errors
let _supabase: ReturnType<typeof createClient<Database>> | null = null;
let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(target, prop) {
    if (!_supabase) {
      const url = getSupabaseUrl();
      const key = getSupabaseAnonKey();
      
      if (!url || !key) {
        throw new Error("Supabase credentials not found. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.");
      }
      
      _supabase = createClient<Database>(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    }
    return Reflect.get(_supabase, prop);
  },
});

// Server-side client with service role (lazy initialization)
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(target, prop) {
    if (!_supabaseAdmin) {
      const url = getSupabaseUrl();
      const key = getSupabaseServiceKey();
      
      if (!url || !key) {
        throw new Error("Supabase admin credentials not found. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.");
      }
      
      _supabaseAdmin = createClient<Database>(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
    return Reflect.get(_supabaseAdmin, prop);
  },
});
