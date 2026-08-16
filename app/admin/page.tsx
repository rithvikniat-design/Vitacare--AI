import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Shield, Users, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboard() {
  const supabase = createClient();
  
  // Verify Admin Role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    // If not admin, redirect or show not authorized
    redirect("/");
  }

  // Fetch Stats (in a real app, use count queries instead of selecting all for scale)
  const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  const { count: convosCount } = await supabase.from("conversations").select("*", { count: "exact", head: true });
  const { count: likesCount } = await supabase.from("feedback").select("*", { count: "exact", head: true }).eq("rating", "like");
  const { count: dislikesCount } = await supabase.from("feedback").select("*", { count: "exact", head: true }).eq("rating", "dislike");

  // Fetch Recent Feedback
  const { data: recentFeedback } = await supabase
    .from("feedback")
    .select(`
      rating, 
      feedback_text, 
      created_at,
      profiles:user_id (email, full_name),
      messages:message_id (content)
    `)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of application usage and feedback.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersCount || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{convosCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positive Feedback</CardTitle>
            <ThumbsUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{likesCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Negative Feedback</CardTitle>
            <ThumbsDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dislikesCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Recent Feedback</h2>
        <div className="border rounded-lg overflow-hidden bg-card">
          {(!recentFeedback || recentFeedback.length === 0) ? (
            <div className="p-8 text-center text-muted-foreground">No feedback yet.</div>
          ) : (
            <div className="divide-y">
              {recentFeedback.map((fb: any, idx: number) => (
                <div key={idx} className="p-4 flex gap-4">
                  <div className="mt-1 flex-shrink-0">
                    {fb.rating === "like" ? (
                      <ThumbsUp className="w-5 h-5 text-green-500" />
                    ) : (
                      <ThumbsDown className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <p className="text-sm font-medium">
                      {(fb.profiles as any)?.full_name || (fb.profiles as any)?.email}
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(fb.created_at).toLocaleDateString()}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground truncate border-l-2 pl-2">
                      "{(fb.messages as any)?.content?.substring(0, 100)}..."
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
