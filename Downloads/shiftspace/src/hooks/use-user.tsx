"use client";

/**
 * Overwrite Downloads/shiftspace/src/hooks/use-user.tsx with this file.
 * This version:
 * - Validates inputs
 * - Builds the exact payload Supabase expects
 * - Sends the request with the anon key headers
 * - Logs outgoing payload and full response for debugging
 */

console.log("use-user loaded from Downloads/shiftspace/src/hooks/use-user.tsx");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

type SignupResult = any;

export const signup = async (
  email: string,
  password: string,
  name: string,
  username: string
): Promise<SignupResult> => {
  // Defensive validation
  const e = (email ?? "").toString().trim();
  const p = (password ?? "").toString();
  const n = (name ?? "").toString().trim();
  const u = (username ?? "").toString().trim();

  if (!e || !p || !n || !u) {
    const msg = "All fields are required.";
    console.error(msg, { email: e, password: p ? "•••" : "", name: n, username: u });
    throw new Error(msg);
  }

  // Build payload exactly as Supabase v2 expects
  const payload = {
    email: e,
    password: p,
    options: {
      data: {
        name: n,
        username: u,
      },
    },
  };

  console.log("Outgoing signup payload:", payload);

  // Use fetch directly so we can see raw status/body
  const url = `${SUPABASE_URL.replace(/\/$/, "")}/auth/v1/signup`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let body: any = text;
    try {
      body = JSON.parse(text);
    } catch {
      /* keep raw text if not JSON */
    }

    console.log("Supabase signup response status:", res.status, res.statusText, "body:", body);

    if (!res.ok) {
      // Attach debug info to the thrown error
      const err: any = new Error(`Signup failed: ${res.status} ${res.statusText}`);
      err.status = res.status;
      err.body = body;
      throw err;
    }

    return body;
  } catch (err: any) {
    console.error("signup caught error:", err);
    throw err;
  }
};

/* Minimal helpers kept for parity */
export const login = async (email: string, password: string) => {
  if (!email || !password) throw new Error("Email and password are required.");
  const payload = { email: email.trim(), password };
  const url = `${SUPABASE_URL.replace(/\/$/, "")}/auth/v1/token?grant_type=password`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) {
    console.error("Login failed:", res.status, json);
    throw new Error(json?.error_description || json?.error || "Login failed");
  }
  return json;
};

export const logout = async () => {
  const url = `${SUPABASE_URL.replace(/\/$/, "")}/auth/v1/logout`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    console.error("Logout failed:", res.status, body);
    throw new Error("Logout failed");
  }
  return true;
};
