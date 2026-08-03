"use client";

import React, { useState } from "react";
import { signup } from "@/hooks/use-user";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!email.trim() || !password.trim() || !name.trim() || !username.trim()) {
      setError("All fields are required.");
      return false;
    }
    // basic email check
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const data = await signup(email.trim(), password, name.trim(), username.trim());
      // Supabase returns data with user or confirmation info
      setMessage("Signup successful. Check your email to confirm (if required).");
      console.log("signup success:", data);
      // optionally clear form
      setEmail("");
      setPassword("");
      setName("");
      setUsername("");
    } catch (err: any) {
      console.error("Signup failed:", err);
      // Supabase error objects often have message or statusText
      const msg = err?.message || err?.error_description || "Signup failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 520, margin: "40px auto", padding: 20 }}>
      <h1>Sign up</h1>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          <div style={{ fontSize: 14, marginBottom: 6 }}>Name</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            required
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          <div style={{ fontSize: 14, marginBottom: 6 }}>Username</div>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            required
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          <div style={{ fontSize: 14, marginBottom: 6 }}>Email</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            type="email"
            required
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          <div style={{ fontSize: 14, marginBottom: 6 }}>Password</div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            required
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 14px",
            background: "#0b5fff",
            color: "white",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Signing up…" : "Sign up"}
        </button>

        {message && <div style={{ color: "green", marginTop: 8 }}>{message}</div>}
        {error && <div style={{ color: "crimson", marginTop: 8 }}>{error}</div>}
      </form>
    </main>
  );
}
