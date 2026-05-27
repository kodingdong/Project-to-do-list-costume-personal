-- Migration: create_notes_quotes
-- Tabel untuk Notes & Motivation Engine (Tahap 3)

-- ============================================================
-- 1. Tabel: notes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notes"
    ON public.notes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
    ON public.notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
    ON public.notes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
    ON public.notes FOR DELETE
    USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON public.notes(updated_at DESC);

-- ============================================================
-- 2. Trigger: Auto-update updated_at pada notes
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 3. Tabel: quotes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    category TEXT CHECK (category IN ('finansial', 'coding', 'motivasi', 'public speaking', 'bahasa inggris')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own quotes"
    ON public.quotes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quotes"
    ON public.quotes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotes"
    ON public.quotes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quotes"
    ON public.quotes FOR DELETE
    USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON public.quotes(user_id);
