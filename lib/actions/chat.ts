"use server";

import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database.types";
import { revalidatePath } from "next/cache";

export async function createConversation(title: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: user.id,
      title: title,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating conversation:", error);
    throw new Error("Failed to create conversation");
  }

  revalidatePath("/");
  return data;
}

export async function getConversations() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }

  return data;
}

export async function getMessages(conversationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return data;
}

export async function saveMessage(
  conversationId: string,
  role: "user" | "assistant" | "system",
  content: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: role,
      content: content,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving message:", error);
    throw new Error("Failed to save message");
  }

  // Update conversation updated_at
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return data;
}

export async function saveFeedback(
  messageId: string,
  rating: "like" | "dislike",
  feedbackText?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Upsert feedback
  const { data, error } = await supabase
    .from("feedback")
    .upsert(
      {
        message_id: messageId,
        user_id: user.id,
        rating: rating,
        feedback_text: feedbackText || null,
      },
      { onConflict: 'message_id,user_id' }
    )
    .select()
    .single();

  if (error) {
    console.error("Error saving feedback:", error);
    throw new Error("Failed to save feedback");
  }

  return data;
}
