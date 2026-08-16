"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Activity } from "lucide-react";
import { getProfile, updateProfile } from "@/lib/actions/profile";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [theme, setTheme] = useState("system");
  const [aiProvider, setAiProvider] = useState("openai");
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      const data = await getProfile();
      if (data) {
        setTheme(data.theme || "system");
        setAiProvider(data.ai_provider || "openai");
        setVoiceEnabled(data.voice_enabled ?? true);
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        theme,
        ai_provider: aiProvider,
        voice_enabled: voiceEnabled
      });
      alert("Settings updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update settings.");
    } finally {
      setSaving(false);
    }
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
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">App Settings</h1>
          <p className="text-muted-foreground">Customize your app experience.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 bg-card p-6 rounded-xl border shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-medium">Theme</label>
          <select 
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="system">System Default</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Primary AI Provider</label>
          <select 
            value={aiProvider}
            onChange={(e) => setAiProvider(e.target.value)}
            className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="openai">OpenAI (GPT-4o)</option>
            <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
            <option value="google">Google (Gemini 1.5 Pro)</option>
            <option value="grok">xAI (Grok)</option>
          </select>
          <p className="text-xs text-muted-foreground">This provider will be used unless it fails, falling back to others.</p>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
          <div>
            <p className="font-medium text-sm">Voice Output (TTS)</p>
            <p className="text-xs text-muted-foreground">Enable the Listen button on AI responses</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={voiceEnabled} 
              onChange={(e) => setVoiceEnabled(e.target.checked)}
            />
            <div className="w-11 h-6 bg-muted-foreground/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}
