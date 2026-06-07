# 🧠 Implementation Plan: Second Brain untuk FlowDo

> **Tujuan**: Mengubah FlowDo menjadi **Personal Knowledge Management System**
> **Stack**: Bun + SvelteKit + Svelte 5 + Supabase + TipTap + Custom CSS
> **Estimasi**: 3 Sprint (3 Minggu) | **Total SP: 55**
> **Pre-requisite**: Jalankan `tech_stack_migration_plan.md` terlebih dahulu (Opsi A — SvelteKit native)
> **API Pattern**: SvelteKit `+server.ts` (auth via `locals.safeGetSession()`)

---

## 🔀 Git Workflow

Setiap sprint = 1 branch. Setiap task = 1 commit.

```bash
# Sprint 1
git checkout main && git pull
git checkout -b feature/second-brain-sprint-1

# Setelah semua task sprint 1 selesai
git push origin feature/second-brain-sprint-1
# Buat PR → merge ke main → lanjut sprint 2
```

Format commit: `feat(brain): <deskripsi>` atau `chore(brain): <deskripsi>`

---

## 📐 Konsep: Framework CODE (Building a Second Brain)

| Pilar | Arti | Implementasi |
|:------|:------|:------------|
| **C**apture | Tangkap ide | ✅ Sudah ada (Inbox + Quick Capture) |
| **O**rganize | Kategorisasi | Tags, Folders (PARA), Bi-directional Links |
| **D**istill | Ringkas jadi insight | Progressive Summarization, Highlight |
| **E**xpress | Gunakan kembali | Search, Graph View, Daily Review |

---

## 🔴 SPRINT 1: Tags, Folders & Search (Minggu 1) — 21 SP

### Task 1.1 — Database Migration (SP: 5)

Jalankan: `supabase migration new create_second_brain_foundation`

Isi file migration:

```sql
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
```

Verifikasi: `supabase db reset` → cek semua tabel muncul.

Commit: `chore(brain): database migration folders tags fts`

---

### Task 1.2 — Service Layer: Folders & Tags (SP: 3)

Buat 2 service files (business logic saja, TANPA route):

**`src/lib/server/features/folders/service.ts`**

Fungsi yang perlu dibuat:

| Fungsi | Parameter | Return |
|:-------|:----------|:-------|
| `getFolders(db, userId)` | SupabaseClient, string | folders[] ordered by sort_order |
| `addFolder(db, userId, name, icon, paraType, parentId)` | | folder object |
| `updateFolder(db, userId, folderId, updates)` | updates: {name?, icon?, sort_order?} | folder object |
| `deleteFolder(db, userId, folderId)` | | { success: true } |

**`src/lib/server/features/tags/service.ts`**

| Fungsi | Parameter | Return |
|:-------|:----------|:-------|
| `getTags(db, userId)` | SupabaseClient, string | tags[] |
| `addTag(db, userId, name, color)` | | tag object |
| `deleteTag(db, userId, tagId)` | | { success: true } |
| `attachTag(db, noteId, tagId)` | | junction row |
| `detachTag(db, noteId, tagId)` | | { success: true } |

Ikuti pattern dari `src/lib/server/features/inbox/service.ts` — semua fungsi menerima `db: SupabaseClient` sebagai parameter pertama.

Commit: `feat(brain): service layer folders dan tags`

---

### Task 1.3 — API Routes: Folders, Tags, Search (SP: 3)

Buat SvelteKit `+server.ts` routes. Ikuti pattern dari `src/routes/api/inbox/+server.ts` (yang dibuat di migration plan).

| File | Methods | Service Import |
|:-----|:--------|:---------------|
| `src/routes/api/folders/+server.ts` | GET, POST | folders/service |
| `src/routes/api/folders/[id]/+server.ts` | PUT, DELETE | folders/service |
| `src/routes/api/tags/+server.ts` | GET, POST | tags/service |
| `src/routes/api/tags/[id]/+server.ts` | DELETE | tags/service |
| `src/routes/api/notes/[id]/tags/+server.ts` | POST, DELETE | tags/service (attach/detach) |
| `src/routes/api/search/+server.ts` | GET | lihat di bawah |

**Search API** (`GET /api/search?q=keyword&tags=id1,id2&folder=id`):
1. Jika `q` ada → gunakan PostgreSQL `to_tsquery` pada kolom `fts`
2. Jika `tags` ada → JOIN `note_tags` dan filter
3. Jika `folder` ada → filter `folder_id`
4. Fallback: `ILIKE '%keyword%'` jika FTS tidak match
5. Return: notes dengan tags dan folder info

Buat service-nya di `src/lib/server/features/search/service.ts`.

Commit: `feat(brain): api routes folders tags search`

---

### Task 1.4 — UI: Sidebar Folders + Tags + Search (SP: 5)

Modifikasi `src/routes/notes/+page.svelte` — transformasi sidebar jadi Second Brain navigation.

Layout target:

```
┌─────────────────────────────────────────────┐
│ 🧠 Second Brain              [🔍 Search]   │
├──────────────┬──────────────────────────────┤
│ PARA Folders │        Note Editor           │
│ 📂 Projects  │        (TipTap)              │
│ 📂 Areas     │                              │
│ 📂 Resources │   Tags: [#tag1] [#tag2] [+]  │
│ 📂 Archive   │                              │
│ ──────────── │                              │
│ Tags         │                              │
│ #coding      │                              │
│ #ideas       │                              │
│ ──────────── │                              │
│ Notes List   │                              │
└──────────────┴──────────────────────────────┘
```

Buat 3 komponen baru:

| Komponen | Fungsi |
|:---------|:-------|
| `src/lib/components/FolderTree.svelte` | Tampilkan folders PARA, klik = filter notes |
| `src/lib/components/TagPicker.svelte` | Attach/detach tags pada note yang sedang diedit |
| `src/lib/components/SearchBar.svelte` | Input search, panggil `/api/search`, tampilkan hasil |

Styling: gunakan CSS Custom Properties dari `layout.css` (`.glass-card`, `--bg-elevated`, dst). JANGAN gunakan Tailwind.

Commit: `feat(brain): ui sidebar folders tags search`

---

### Task 1.5 — UI: Inbox Processing (SP: 5)

Modifikasi `src/routes/+page.svelte` — tambah tombol aksi pada setiap inbox item:
- **📝 → Note**: Konversi inbox item ke note (pilih folder + tags)
- **✅ → Task**: Konversi inbox item ke task (set context + energy level)

Buat API: `src/routes/api/inbox/[id]/process/+server.ts` (POST)
- Body: `{ target: 'note' | 'task', folder_id?, tags?, context?, energy_level? }`
- Logic: buat note/task dari inbox content → hapus inbox item → return created item

Commit: `feat(brain): inbox processing ke note atau task`

---

## 🟡 SPRINT 2: Links & Knowledge Graph (Minggu 2) — 19 SP

### Task 2.1 — Database: `note_links` (SP: 2)

Migration baru:

```sql
CREATE TABLE IF NOT EXISTS public.note_links (
    source_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (source_id, target_id),
    CHECK (source_id != target_id)
);

ALTER TABLE public.note_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own note_links" ON public.note_links FOR ALL USING (
    EXISTS (SELECT 1 FROM public.notes WHERE notes.id = note_links.source_id AND notes.user_id = auth.uid())
);

CREATE INDEX IF NOT EXISTS idx_note_links_source ON public.note_links(source_id);
CREATE INDEX IF NOT EXISTS idx_note_links_target ON public.note_links(target_id);
```

API: `src/routes/api/notes/[id]/links/+server.ts` — GET (return backlinks + forward links)

Commit: `chore(brain): database note_links dan api`

---

### Task 2.2 — TipTap Extension: Wiki Links `[[...]]` (SP: 5)

Buat TipTap custom extension: `src/lib/components/tiptap/WikiLinkExtension.ts`

Behavior:
1. User ketik `[[` → muncul dropdown autocomplete (daftar note titles)
2. User pilih note → insert `[[Note Title]]` sebagai inline node
3. Klik link di editor → navigasi ke note tersebut
4. Saat save note → extract semua `[[links]]` → sync ke tabel `note_links`

Register extension di `BlockEditor.svelte`.

Commit: `feat(brain): tiptap wiki link extension`

---

### Task 2.3 — UI: Backlinks Panel (SP: 3)

Buat `src/lib/components/BacklinksPanel.svelte` — tampilkan di bawah editor.

```
🔗 Backlinks (3)
├─ Meeting Notes 2026-06-01
├─ Project Ideas
└─ Weekly Review
```

Klik backlink → navigasi ke note sumber.

Commit: `feat(brain): backlinks panel component`

---

### Task 2.4 — Knowledge Graph (SP: 5)

Buat halaman baru: `src/routes/notes/graph/+page.svelte`

Visualisasi menggunakan **Canvas 2D API** (TANPA library eksternal):
- Setiap note = node (lingkaran)
- Setiap link = edge (garis)
- Node size = jumlah connections
- Warna = folder/PARA category
- Hover = highlight connections, klik = navigasi ke note
- Force-directed layout (simple physics simulation)

API: `src/routes/api/notes/graph/+server.ts` — GET
Return: `{ nodes: [{id, title, folder, linkCount}], edges: [{source, target}] }`

Commit: `feat(brain): knowledge graph visualization`

---

### Task 2.5 — Navigasi: Rename "Notes" → "Brain" (SP: 4)

Edit `src/routes/+layout.svelte` — ubah nav item:

```typescript
{ href: '/notes', icon: '🧠', label: 'Brain' }  // sebelumnya: 📝 Notes
```

Tambah sub-navigation di `/notes`:
- **Notes** (default) — daftar notes + editor
- **Graph** — knowledge graph
- **Review** — daily review (Sprint 3)

Commit: `feat(brain): rename nav ke brain dan sub-navigation`

---

## 🟢 SPRINT 3: Review & Dashboard (Minggu 3) — 15 SP

### Task 3.1 — Database: `review_log` (SP: 2)

```sql
CREATE TABLE IF NOT EXISTS public.review_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    next_review DATE,
    ease_factor REAL DEFAULT 2.5
);

ALTER TABLE public.review_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own reviews" ON public.review_log FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_review_user ON public.review_log(user_id);
CREATE INDEX IF NOT EXISTS idx_review_next ON public.review_log(next_review);
```

Commit: `chore(brain): database review_log`

---

### Task 3.2 — Daily Review System (SP: 5)

Buat halaman: `src/routes/notes/review/+page.svelte`

API routes:
- `src/routes/api/review/today/+server.ts` — GET: notes yang perlu review hari ini
- `src/routes/api/review/[noteId]/+server.ts` — POST: log review `{ rating: 'easy'|'medium'|'hard' }`

Algoritma SM-2 (simplified):
- easy → next = today + (interval × ease × 1.3)
- medium → next = today + (interval × ease)
- hard → next = today + 1, ease -= 0.2

UI: tampilkan note summary + 3 tombol rating + progress bar.

Commit: `feat(brain): daily review spaced repetition`

---

### Task 3.3 — Progressive Summarization (SP: 3)

Modifikasi `BlockEditor.svelte` — tambah di toolbar:
- 🖍️ **Highlight** — mark text dengan background kuning (TipTap highlight extension)
- 📋 **Auto-Summary** — extract highlighted text → simpan sebagai `note.summary`

Summary digunakan untuk search ranking (tsweight 'B' di FTS index).

Commit: `feat(brain): highlight dan auto-summary`

---

### Task 3.4 — Brain Dashboard (SP: 5)

Buat section overview di halaman `/notes` sebagai landing page:

```
🧠 Your Second Brain
┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐
│📝 42 │ │🔗 18 │ │🏷️ 12│ │📚 5 due  │
│Notes │ │Links │ │Tags  │ │Reviews   │
└──────┘ └──────┘ └──────┘ └──────────┘

📊 Recent Activity
├─ Updated "Project Ideas" — 2m ago
├─ Created "Meeting Notes" — 1h ago
└─ Linked "API Design" ↔ "Backend" — 3h

🔥 Most Connected Notes (by link count)
🏷️ Tag Cloud
```

API: `src/routes/api/brain/stats/+server.ts` — GET
Return: `{ noteCount, linkCount, tagCount, reviewsDue, recentActivity[], topConnected[] }`

Commit: `feat(brain): dashboard overview`

---

## 📊 Ringkasan

| Sprint | Fokus | SP |
|:-------|:------|:---|
| 🔴 1 | Tags, Folders, Search, Inbox Processing | 21 |
| 🟡 2 | Wiki Links, Backlinks, Graph, Navigation | 19 |
| 🟢 3 | Daily Review, Summarization, Dashboard | 15 |
| | **Total** | **55** |

## 🎯 Prioritas (MoSCoW)

| Priority | Fitur | Sprint |
|:---------|:------|:-------|
| **Must** | Tags & Folders (PARA) | 1 |
| **Must** | Full-Text Search | 1 |
| **Must** | Inbox Processing | 1 |
| **Should** | Wiki Links `[[...]]` | 2 |
| **Should** | Backlinks Panel | 2 |
| **Should** | Brain Dashboard | 3 |
| **Could** | Knowledge Graph | 2 |
| **Could** | Daily Review | 3 |
| **Could** | Progressive Summarization | 3 |

## ⚠️ Dependency Baru

```
Tidak ada dependency baru.
- Graph: Canvas 2D API (native browser)
- Search: PostgreSQL FTS (native Supabase)
- Spaced repetition: Custom algorithm
- Styling: Custom CSS (layout.css)
```
