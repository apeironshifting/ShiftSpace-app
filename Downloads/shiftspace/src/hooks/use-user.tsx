"use client";

console.log("use-user loaded from Downloads/shiftspace/src/hooks/use-user.tsx");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
} else {
  console.log("Supabase URL and anon key present (anon key hidden).");
}

/**
 * Debugging signup that logs the outgoing payload and the full response
 * Paste this file exactly into Downloads/shiftspace/src/hooks/use-user.tsx
 */
export const signup = async (
  email: string,
  password: string,
  name: string,
  username: string
) => {
  // Basic validation to avoid sending malformed payloads
  if (!email || !password || !name || !username) {
    const msg = "All fields are required.";
    console.error(msg, { email, password, name, username });
    throw new Error(msg);
  }

  // Build the payload exactly as Supabase v2 expects
  const payload = {
    email: email.trim(),
    password,
    options: {
      data: {
        name: name.trim(),
        username: username.trim(),
      },
    },
  };

  // Log the payload so you can inspect it in DevTools Network/Console
  console.log("Outgoing signup payload", payload);

  try {
    // Use fetch directly so you can inspect the raw request/response
    const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch (e) {
      // not JSON
    }

    // Log status and body for debugging
    console.log("Supabase signup response status", res.status, "body:", json ?? text);

    if (!res.ok) {
      // Throw an error that includes the status and body so caller can show it
      const err = new Error(`Signup failed: ${res.status} ${res.statusText}`);
      // @ts-ignore attach debug info
      err.debug = { status: res.status, body: json ?? text };
      throw err;
    }

    return json;
  } catch (err: any) {
    console.error("signup caught error", err);
    throw err;
  }
};

/**
 * Optional helpers kept minimal
 */
export const login = async (email: string, password: string) => {
  if (!email || !password) throw new Error("Email and password are required.");
  const payload = { email: email.trim(), password };
  console.log("Outgoing login payload", payload);

  const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    console.error("Login failed", res.status, json);
    throw new Error(json?.error_description || json?.error || "Login failed");
  }
  return json;
};

export const logout = async () => {
  const res = await fetch(`${supabaseUrl}/auth/v1/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    console.error("Logout failed", res.status, body);
    throw new Error("Logout failed");
  }
  return true;
};
