import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

import { getSupabaseClient } from "@/lib/supabase";

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error && error.name !== "AuthSessionMissingError") {
    throw error;
  }

  return data.user;
}

export async function requireAuthentication() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
