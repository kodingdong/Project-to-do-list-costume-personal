-- Migration: create_inbox
-- Tabel untuk Emergency Inbox (quick capture ide/tugas)

-- 1. Buat tabel inbox
CREATE TABLE IF NOT EXISTS public.inbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'audio')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.inbox ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies — User hanya bisa akses data miliknya sendiri
CREATE POLICY "Users can view own inbox items"
    ON public.inbox FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inbox items"
    ON public.inbox FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own inbox items"
    ON public.inbox FOR DELETE
    USING (auth.uid() = user_id);

-- 4. Index untuk performa query per user
CREATE INDEX IF NOT EXISTS idx_inbox_user_id ON public.inbox(user_id);
CREATE INDEX IF NOT EXISTS idx_inbox_created_at ON public.inbox(created_at DESC);
