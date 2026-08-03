"use client";

console.log("use-user loaded from src/hooks/use-user.tsx");

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const signup = async (
  email: string,
  password: string,
  name: string,
  username: string
) => {
  if (!email || !password || !name || !username) {
    throw new Error("All fields are required.");
  }

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
    console.error("Signup error:", error);
    throw error;
  }

  return data;
};

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
