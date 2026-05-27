-- Migration: create_tasks_habits
-- Tabel untuk Smart To-Do List + Habit Tracker (Tahap 2)

-- ============================================================
-- 1. Tabel: tasks
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    context TEXT DEFAULT '@Online' CHECK (context IN ('@Online', '@Rumah', '@DeepWork', '@Kantor', '@Errand')),
    energy_level TEXT DEFAULT 'sedang' CHECK (energy_level IN ('tinggi', 'sedang', 'rendah')),
    is_completed BOOLEAN NOT NULL DEFAULT false,
    reminder_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own tasks"
    ON public.tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
    ON public.tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
    ON public.tasks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
    ON public.tasks FOR DELETE
    USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);

-- ============================================================
-- 2. Tabel: sub_tasks
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sub_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.sub_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies — User bisa akses sub_tasks via parent task ownership
CREATE POLICY "Users can view own sub_tasks"
    ON public.sub_tasks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.tasks
            WHERE tasks.id = sub_tasks.task_id
            AND tasks.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own sub_tasks"
    ON public.sub_tasks FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tasks
            WHERE tasks.id = sub_tasks.task_id
            AND tasks.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own sub_tasks"
    ON public.sub_tasks FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.tasks
            WHERE tasks.id = sub_tasks.task_id
            AND tasks.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own sub_tasks"
    ON public.sub_tasks FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.tasks
            WHERE tasks.id = sub_tasks.task_id
            AND tasks.user_id = auth.uid()
        )
    );

-- Index
CREATE INDEX IF NOT EXISTS idx_sub_tasks_task_id ON public.sub_tasks(task_id);

-- ============================================================
-- 3. Tabel: habits
-- ============================================================
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    streak_count INTEGER NOT NULL DEFAULT 0,
    last_completed DATE,
    is_done_today BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own habits"
    ON public.habits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits"
    ON public.habits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
    ON public.habits FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits"
    ON public.habits FOR DELETE
    USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);

-- ============================================================
-- 4. Trigger: Auto-manage streak saat habit di-toggle
-- ============================================================

-- Function: handle streak logic saat is_done_today berubah
CREATE OR REPLACE FUNCTION public.handle_habit_streak()
RETURNS TRIGGER AS $$
BEGIN
    -- Hanya proses jika is_done_today berubah ke true
    IF NEW.is_done_today = true AND (OLD.is_done_today = false OR OLD.is_done_today IS NULL) THEN
        -- Cek apakah last_completed adalah kemarin
        IF OLD.last_completed = CURRENT_DATE - INTERVAL '1 day' THEN
            -- Streak berlanjut: increment
            NEW.streak_count := OLD.streak_count + 1;
        ELSE
            -- Streak baru atau terputus: reset ke 1
            NEW.streak_count := 1;
        END IF;
        NEW.last_completed := CURRENT_DATE;
    END IF;

    -- Jika is_done_today berubah ke false (undo), jangan ubah streak
    -- Biarkan user membatalkan centang hari ini tanpa kehilangan streak
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: jalankan function saat UPDATE pada habits
CREATE TRIGGER trigger_habit_streak
    BEFORE UPDATE ON public.habits
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_habit_streak();

-- ============================================================
-- 5. Function: Daily reset is_done_today (dipanggil via cron/manual)
-- ============================================================
CREATE OR REPLACE FUNCTION public.reset_habits_daily()
RETURNS void AS $$
BEGIN
    UPDATE public.habits
    SET is_done_today = false
    WHERE is_done_today = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
