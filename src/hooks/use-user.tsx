"use client";

console.log("use-user loaded from src/hooks/use-user.tsx");

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
}

export const signup = async (
  email: string,
  password: string,
  name: string,
  username: string
) => {
  const e = (email ?? "").toString().trim();
  const p = (password ?? "").toString();
  const n = (name ?? "").toString().trim();
  const u = (username ?? "").toString().trim();

  if (!e || !p || !n || !u) {
    const msg = "All fields are required.";
    console.error(msg, { email: e, password: p ? "•••" : "", name: n, username: u });
    throw new Error(msg);
  }

  const payload = {
    email: e,
    password: p,
    options: {
      data: {
        name: n,
        username: u
      }
    }
  };

  console.log("Outgoing signup payload:", payload);

  const url = `${SUPABASE_URL}/auth/v1/signup`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  let body: any = text;
  try { body = JSON.parse(text); } catch {}

  console.log("Supabase signup response status:", res.status, res.statusText, "body:", body);

  if (!res.ok) {
    const err: any = new Error(`Signup failed: ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
};

export const login = async (email: string, password: string) => {
  const e = (email ?? "").toString().trim();
  const p = (password ?? "").toString();

  if (!e || !p) {
    throw new Error("Email and password are required.");
  }

  const payload = { email: e, password: p };
  const url = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify(payload)
  });

  const json = await res.json();
  if (!res.ok) {
    console.error("Login failed:", res.status, json);
    throw new Error(json?.error_description || json?.error || "Login failed");
  }

  return json;
};

export const logout = async (accessToken?: string) => {
  const url = `${SUPABASE_URL}/auth/v1/logout`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY
  };

  // If caller provides an access token, use it; otherwise fall back to anon key.
  headers.Authorization = accessToken ? `Bearer ${accessToken}` : `Bearer ${SUPABASE_ANON_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Logout failed:", res.status, body);
    throw new Error("Logout failed");
  }

  return true;
};
