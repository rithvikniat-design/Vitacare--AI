-- Migration 00004: Update Profiles for user settings and profile details

ALTER TABLE public.profiles
ADD COLUMN full_name TEXT,
ADD COLUMN avatar_url TEXT,
ADD COLUMN language TEXT DEFAULT 'en' NOT NULL,
ADD COLUMN theme TEXT DEFAULT 'system' NOT NULL,
ADD COLUMN ai_provider TEXT DEFAULT 'openai' NOT NULL,
ADD COLUMN voice_enabled BOOLEAN DEFAULT true NOT NULL;
