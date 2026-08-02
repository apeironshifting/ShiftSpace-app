"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: "1rem" }}>
      <h2>Page Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href="/" style={{ padding: "0.5rem 1rem", background: "#000", color: "#fff", borderRadius: "4px" }}>
        Return Home
      </Link>
    </div>
  );
}
