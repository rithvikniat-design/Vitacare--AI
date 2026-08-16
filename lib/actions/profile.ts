"use server";

import { createClient } from "@/lib/supabase/server";

export async function getProfile() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return profile;
}

export async function updateProfile(data: {
  full_name?: string;
  avatar_url?: string;
  language?: string;
  theme?: string;
  ai_provider?: string;
  voice_enabled?: boolean;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", user.id);

  if (error) {
    throw error;
  }

  return { success: true };
}
