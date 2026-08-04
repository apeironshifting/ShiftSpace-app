"use client";

/**
 * Paste this file exactly as-is into:
 * Downloads/shiftspace/src/hooks/use-user.tsx
 *
 * Then save, restart your dev server or redeploy.
 */

console.log("use-user loaded from Downloads/shiftspace/src/hooks/use-user.tsx");

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase env vars missing. NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * signup
 * - Validates inputs
 * - Uses Supabase v2 shape: options.data
 * - Throws on error so callers can show the message
 */
export const signup = async (
  email: string,
  password: string,
  name: string,
  username: string
) => {
  // Basic validation to avoid sending malformed payloads
  if (!email || !password || !name || !username) {
    throw new Error("All fields are required.");
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          username,
        },
      },
    });

    if (error) {
      // Log full error for debugging
      console.error("Supabase signUp error:", error);
      throw error;
    }

    return data;
  } catch (err: any) {
    console.error("signup caught error:", err);
    throw err;
  }
};

/**
 * Optional helpers used elsewhere in the app
 */
export const login = async (email: string, password: string) => {
  if (!email || !password) throw new Error("Email and password are required.");
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    console.error("Login error:", error);
    throw error;
  }
  return data;
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Logout error:", error);
    throw error;
  }
};
