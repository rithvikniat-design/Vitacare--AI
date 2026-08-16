"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitFeedback(messageId: string, rating: "like" | "dislike", feedbackText?: string) {
  try {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Upsert feedback
    const { error } = await supabase
      .from("feedback")
      .upsert({
        message_id: messageId,
        user_id: user.id,
        rating,
        feedback_text: feedbackText || null
      }, {
        onConflict: 'message_id,user_id'
      });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error submitting feedback:", error);
    return { success: false, error: error.message };
  }
}

export async function removeFeedback(messageId: string) {
  try {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const { error } = await supabase
      .from("feedback")
      .delete()
      .eq("message_id", messageId)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error removing feedback:", error);
    return { success: false, error: error.message };
  }
}
