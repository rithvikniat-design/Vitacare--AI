"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Activity, LogOut } from "lucide-react";
import { getProfile, updateProfile } from "@/lib/actions/profile";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState("");
  
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [language, setLanguage] = useState("en");

  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email || "");

      const data = await getProfile();
      if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        setAvatarUrl(data.avatar_url || "");
        setLanguage(data.language || "en");
      }
      setLoading(false);
    }
    loadProfile();
  }, [supabase.auth]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName,
        avatar_url: avatarUrl,
        language
      });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full pt-32">
        <Activity className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground">Manage your personal information.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 bg-card p-6 rounded-xl border shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email Address</label>
          <Input value={email} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground">Your email cannot be changed.</p>
        </div>

        {profile?.role === "admin" && (
           <div className="space-y-2">
             <label className="text-sm font-medium">Role</label>
             <Input value="Admin Privileges" disabled className="bg-muted font-bold text-primary" />
           </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Full Name</label>
          <Input 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
            placeholder="John Doe" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Avatar URL</label>
          <Input 
            value={avatarUrl} 
            onChange={(e) => setAvatarUrl(e.target.value)} 
            placeholder="https://example.com/avatar.jpg" 
          />
          <p className="text-xs text-muted-foreground">For now, please provide a direct image URL.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Preferred Language</label>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>

        <div className="flex gap-4 pt-4 border-t border-border/50">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </Button>

          <Button type="button" variant="destructive" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </form>
    </div>
  );
}
