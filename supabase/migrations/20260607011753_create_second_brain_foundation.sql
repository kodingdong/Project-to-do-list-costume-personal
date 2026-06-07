-- 1. Folders (PARA: project, area, resource, archive)
CREATE TABLE IF NOT EXISTS public.folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '📁',
    para_type TEXT CHECK (para_type IN ('project', 'area', 'resource', 'archive')),
    parent_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tags
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6c63ff',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, name)
);

-- 3. Note-Tags junction
CREATE TABLE IF NOT EXISTS public.note_tags (
    note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);

-- 4. Tambah kolom baru ke notes
ALTER TABLE public.notes
    ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS summary TEXT;

-- 5. Full-text search index
ALTER TABLE public.notes
    ADD COLUMN IF NOT EXISTS fts tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('indonesian', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('indonesian', coalesce(summary, '')), 'B')
    ) STORED;

CREATE INDEX IF NOT EXISTS idx_notes_fts ON public.notes USING GIN(fts);

-- 6. RLS
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own folders" ON public.folders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own tags" ON public.tags FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own note_tags" ON public.note_tags FOR ALL USING (
    EXISTS (SELECT 1 FROM public.notes WHERE notes.id = note_tags.note_id AND notes.user_id = auth.uid())
);

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_folders_user ON public.folders(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_user ON public.tags(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_folder ON public.notes(folder_id);
CREATE INDEX IF NOT EXISTS idx_note_tags_note ON public.note_tags(note_id);
CREATE INDEX IF NOT EXISTS idx_note_tags_tag ON public.note_tags(tag_id);
