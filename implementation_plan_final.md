# 📋 Implementation Plan Final v4.0

# Personal Productivity System (Junior / AI Murah)

> **Proyek**: All-in-One To-Do List + Habit Tracker + Notion-style Notes
> **Stack**: Bun + ElysiaJS (Backend API) + SvelteKit + Svelte 5 (Frontend) + Tailwind CSS + Supabase + TipTap
> **Type Safety**: Eden Treaty (end-to-end type safety Backend ↔ Frontend)
> **Durasi**: 4 Minggu | **Total Story Points**: 68

---

## ⚠️ ATURAN WAJIB (Baca Dulu, Baru Coding)

### A. Local-First Development

> **MENGAPA?** Coding di localhost = gratis, instan (<100ms reload), dan tidak menghabiskan kuota hosting internet. Semua pengujian dilakukan di komputer sendiri.

- Frontend: `bun run dev` → buka `localhost:5173` (Vite HMR auto-refresh)
- Backend API: ElysiaJS berjalan embedded di SvelteKit (otomatis via `bun run dev`)
- Database: `supabase start` → Supabase Studio di `localhost:54323`
- **Container Runtime**: Proyek ini menggunakan **Podman** (bukan Docker) untuk menjalankan Supabase lokal.
- **DILARANG** menembak database production selama development.

> **⚠️ WAJIB BACA — Podman sebagai Container Runtime**
> Supabase CLI secara default menganggap Docker tersedia. Karena kita menggunakan **Podman**, kita harus:
>
> 1. Mengaktifkan **Podman socket** (kompatibel dengan Docker API)
> 2. Mengarahkan `DOCKER_HOST` ke socket Podman
>
> Podman adalah container engine yang 100% kompatibel dengan Docker CLI, berjalan **tanpa daemon root** (rootless), lebih aman untuk lingkungan development personal.
> Ref: [Podman Documentation](https://podman.io/docs) | [Supabase Local Dev](https://supabase.com/docs/guides/local-development/overview)

> **MENGAPA Bun?** Bun adalah JavaScript runtime pengganti Node.js yang jauh lebih cepat (install dependency ~25x, start server ~4x). Semua perintah `npm` diganti `bun`. Ref: [Bun Docs](https://bun.sh/docs)
>
> **MENGAPA ElysiaJS?** Framework backend tercepat di Bun dengan fitur type safety bawaan (TypeBox). Kita embed ElysiaJS di dalam SvelteKit via catch-all route agar hanya perlu 1 server. Ref: [ElysiaJS Docs](https://elysiajs.com/introduction.html)

### B. Git Branching & Trik `[skip ci]`

> **MENGAPA?** Vercel/Netlify punya kuota build terbatas. Setiap `git push` ke branch `main` akan memicu build berbayar. Trik `[skip ci]` memberitahu server untuk mengabaikan push tersebut, sehingga kuota tetap utuh.

```bash
# ✅ BENAR — Pagi: mulai kerja di branch fitur
git checkout -b feature/nama-fitur

# ✅ BENAR — Malam: backup ke GitHub TANPA memicu build
git add .
git commit -m "progress hari ini [skip ci]"
git push origin feature/nama-fitur

# ❌ SALAH — Jangan pernah coding langsung di branch main!
```

### C. Cara Prompt AI (Context Prompting)

> **MENGAPA?** AI murah menghasilkan kode akurat jika diberi tugas **kecil dan spesifik**. Meminta "buatkan aplikasi lengkap" = hasil penuh bug.

**Template wajib untuk setiap prompt:**

```
[Peran]: Kamu adalah Senior Fullstack Developer (Bun + ElysiaJS + SvelteKit).
[Tahap]: Saya sedang di [Tahap X — nama tahap].
[Tugas]: Buatkan [1 komponen/fungsi spesifik] untuk [tujuan].
[Stack]: Bun runtime, ElysiaJS (backend API), SvelteKit + Svelte 5 (frontend),
         Tailwind CSS, Supabase (database), Eden Treaty (type-safe API client).
[Aturan]: Berikan kode bersih, modular, dengan komentar penjelasan.
```

### D. Micro-Testing

> **MENGAPA?** Memperbaiki 1 bug kecil jauh lebih mudah daripada debugging 10 bug sekaligus di akhir. Test setiap komponen selesai dibuat.

- Selesaikan & test 1 komponen → baru lanjut ke berikutnya.
- Jika error, **STOP**. Perbaiki dulu. Jangan skip.

---

## 🗂️ STRUKTUR FOLDER TARGET

> **MENGAPA struktur ini?** Arsitektur ini menggunakan pendekatan **Embedded ElysiaJS** — ElysiaJS berjalan di dalam SvelteKit via catch-all server route. Keuntungan: hanya 1 server, 1 port, dan type safety end-to-end via Eden Treaty.
>
> Ref: [ElysiaJS + SvelteKit Integration](https://elysiajs.com/integrations/sveltekit.html) | [Eden Treaty](https://elysiajs.com/eden/treaty/overview.html)

```
project/
├── src/
│   ├── hooks.server.ts          # ⭐ Middleware Auth (Supabase SSR cookies)
│   ├── app.d.ts                 # ⭐ TypeScript types untuk Locals & PageData
│   ├── lib/
│   │   ├── components/          # Komponen UI reusable (tombol, card, widget)
│   │   ├── eden.ts              # ⭐ Eden Treaty client (type-safe API calls)
│   │   ├── server/
│   │   │   ├── elysia.ts        # ⭐ ElysiaJS app utama + export type App
│   │   │   ├── features/        # ⭐ Feature modules (auth, inbox, tasks, dll)
│   │   │   │   ├── inbox/
│   │   │   │   │   ├── index.ts  # Routes (controller)
│   │   │   │   │   ├── service.ts# Business logic
│   │   │   │   │   └── model.ts  # TypeBox schemas (validasi)
│   │   │   │   ├── tasks/
│   │   │   │   ├── habits/
│   │   │   │   └── notes/
│   │   │   └── plugins/         # Shared plugins (auth guard, db client)
│   │   ├── state/               # Shared state (.svelte.ts, Svelte 5 Runes)
│   │   └── utils/               # Helper: reminder, formatting, dll
│   ├── routes/
│   │   ├── api/[...slugs]/+server.ts  # ⭐ Catch-all → delegate ke ElysiaJS
│   │   ├── +layout.svelte       # Layout + navigasi (semua halaman)
│   │   ├── +layout.server.ts    # Load session dari server
│   │   ├── +page.svelte         # Halaman utama: Emergency Inbox
│   │   ├── tasks/+page.svelte   # Halaman To-Do List
│   │   ├── habits/+page.svelte  # Halaman Habit Tracker
│   │   └── notes/+page.svelte   # Halaman Notes
│   └── app.html
├── supabase/
│   ├── migrations/              # File .sql via `supabase migration new`
│   └── seed.sql                 # Data sampel otomatis saat db reset
├── static/                      # Icon, manifest.json, asset statis
├── .env.local                   # Secret keys (JANGAN commit ke Git!)
├── .env.example                 # Template kosong (commit ke Git)
├── bunfig.toml                  # ⭐ Bun configuration (opsional)
└── package.json
```

> **Arsitektur API**: Frontend (Svelte) → **Eden Treaty** → `localhost:5173/api/*` → **ElysiaJS** → **Supabase**. Frontend TIDAK langsung akses database. Semua data melewati API ElysiaJS.
>
> **Catatan Svelte 5 Runes**: Gunakan `$state()`, `$derived()`, `$effect()`, `$props()` — BUKAN `export let`, `$:`, atau writable stores.
>
> **Catatan `src/lib/server/`**: SvelteKit otomatis **melarang** folder ini di-import dari client. ElysiaJS dan semua business logic aman di sini.
>
> **Catatan Feature-First Structure**: Setiap fitur (inbox, tasks, habits, notes) punya folder sendiri berisi `index.ts` (routes), `service.ts` (logic), `model.ts` (validasi TypeBox). Ref: [ElysiaJS Structure](https://elysiajs.com/essential/structure.html)

---

## 🔴 TAHAP 1: Fondasi, Auth, Inbox & Navigasi (Minggu 1) — 21 SP

### Task 1.1 — Inisialisasi Proyek dengan Bun (SP: 3)

**Tujuan**: SvelteKit + Tailwind + ESLint/Prettier + Bun runtime berjalan di localhost.

**Langkah eksak**:

1. Install Bun (jika belum): `powershell -c "irm bun.sh/install.ps1 | iex"`
2. `bun create svelte@latest ./` → pilih **Skeleton**, **TypeScript**, **ESLint + Prettier** ✅
3. `bun install`
4. Install Tailwind CSS: `bun add -d tailwindcss @tailwindcss/vite` (ikuti docs SvelteKit)
5. `bun run dev` → pastikan halaman default muncul di browser
6. `bun run lint` → pastikan berjalan tanpa error

> **Ref**: [Bun Installation](https://bun.sh/docs/installation) | [SvelteKit + Bun](https://svelte.dev/docs/kit/adapter-node)

**Checklist**:

- [ ] Bun terinstall (`bun --version` tampil versi)
- [ ] `localhost:5173` menampilkan halaman SvelteKit
- [ ] Tailwind berfungsi (test: tambah class `bg-blue-500` di elemen)
- [ ] `bun run lint` berjalan tanpa error

---

### Task 1.2 — Setup Supabase + ElysiaJS + Eden Treaty (SP: 5)

**Tujuan**: Database lokal + ElysiaJS backend + Eden Treaty type-safe client.

> **MENGAPA arsitektur ini?** Frontend TIDAK langsung akses database. Semua request melewati ElysiaJS API yang ter-embed di SvelteKit. Ini lebih aman (validasi di server) dan memberi end-to-end type safety via Eden Treaty.

**Langkah eksak**:

#### 🐳 LANGKAH 0 — Setup Podman (WAJIB sebelum `supabase start`)

> **MENGAPA?** Supabase CLI membutuhkan container runtime (default: Docker). Karena kita pakai Podman, kita harus mengaktifkan Podman socket agar Supabase CLI "mengira" Docker tersedia.

```powershell
# 1. Install Podman Desktop (jika belum)
# Download dari: https://podman-desktop.io/
# Atau via winget:
winget install -e --id RedHat.Podman
winget install -e --id RedHat.Podman-Desktop

# 2. Aktifkan Podman machine (VM untuk menjalankan container di Windows)
podman machine init
podman machine start

# 3. Verifikasi Podman berjalan
podman info

# 4. Dapatkan path socket Podman
podman machine inspect --format '{{.ConnectionInfo.PodmanPipe.Path}}'
# Output biasanya: \\.\pipe\dockerDesktopLinuxEngine
# atau: \\.\pipe\podman-machine-default

# 5. Set environment variable DOCKER_HOST agar Supabase CLI mengarah ke Podman
# Di PowerShell (sesi ini saja):
$env:DOCKER_HOST = "npipe:////./pipe/podman-machine-default"

# ATAU — Agar permanen, tambahkan di System Environment Variables:
# Nama variabel : DOCKER_HOST
# Nilai         : npipe:////./pipe/podman-machine-default

# 6. Verifikasi — Supabase CLI sekarang bisa "melihat" Podman sebagai Docker:
podman system service --log-level=debug &
```

> **💡 Tips**: Di Podman Desktop, pastikan setting **"Expose Podman API on Docker socket"** atau **"Docker compatibility"** diaktifkan. Ini membuat Podman merespons di path yang sama dengan Docker socket.

#### 📦 LANGKAH 1–4 — Setup Supabase & Dependencies

1. Install Supabase CLI via Bun:

   ```bash
   bun install -g supabase
   ```

2. Init dan start Supabase (pastikan `DOCKER_HOST` sudah diset di atas):

   ```bash
   supabase init
   supabase start   # ← Supabase akan pull container via Podman
   # Tunggu beberapa menit saat pertama kali (pull image)
   # Catat output: API URL, anon key, service_role key
   ```

3. Buat `.env.local`:

   ```
   PUBLIC_SUPABASE_URL=http://localhost:54321
   PUBLIC_SUPABASE_ANON_KEY=<anon-key-dari-terminal>
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   ```

4. Install semua dependencies:
   ```bash
   bun add @supabase/supabase-js @supabase/ssr elysia @elysiajs/eden
   ```

> **⚠️ Troubleshooting Podman + Supabase**:
>
> - Jika `supabase start` error `"cannot connect to Docker"` → pastikan `DOCKER_HOST` sudah benar dan `podman machine start` sudah dijalankan.
> - Jika port 54321 conflict → jalankan `supabase stop` lalu `supabase start` lagi.
> - Cek container berjalan: `podman ps` (harus muncul beberapa container supabase).
> - Ref: [Supabase CLI + Podman](https://github.com/supabase/cli/issues/341)

> Pecah menjadi **3 prompt terpisah**:

**Prompt AI #1 (ElysiaJS App + Catch-all Route)**:

```
[Peran]: Senior Fullstack Developer (Bun + ElysiaJS + SvelteKit).
[Tahap]: Tahap 1 — Setup ElysiaJS embedded di SvelteKit.
[Tugas]: Buatkan 2 file:
(1) 'src/lib/server/elysia.ts' — ElysiaJS app utama dengan prefix '/api'.
    Tambahkan route GET /api/health yang return { status: 'OK' }.
    Export type App = typeof app.
(2) 'src/routes/api/[...slugs]/+server.ts' — SvelteKit catch-all route
    yang mendelegasikan semua method (GET, POST, PUT, DELETE) ke app.handle.
[Stack]: Bun + ElysiaJS + SvelteKit.
[Aturan]: Kode bersih, modular, dengan komentar.
```

Ref: [ElysiaJS SvelteKit Integration](https://elysiajs.com/integrations/sveltekit.html)

**Prompt AI #2 (Eden Treaty Client)**:

```
[Peran]: Senior Fullstack Developer (Bun + ElysiaJS).
[Tahap]: Tahap 1 — Setup Eden Treaty untuk type-safe API calls.
[Tugas]: Buatkan file 'src/lib/eden.ts' yang:
- Import type App dari '$lib/server/elysia'
- Export eden client menggunakan treaty<App>('http://localhost:5173')
Ref: Eden Treaty docs.
[Stack]: @elysiajs/eden + TypeScript.
```

Ref: [Eden Treaty](https://elysiajs.com/eden/treaty/overview.html)

**Prompt AI #3 (Supabase Plugin untuk ElysiaJS)**:

```
[Peran]: Senior ElysiaJS & Supabase Developer.
[Tahap]: Tahap 1 — Plugin Supabase untuk ElysiaJS.
[Tugas]: Buatkan file 'src/lib/server/plugins/supabase.ts'.
Buat Elysia plugin yang menggunakan .derive() untuk menambahkan
Supabase client ke context. Plugin membaca token dari Authorization
header, lalu memanggil supabase.auth.getUser(token) untuk verifikasi.
Jika valid, tambahkan { db: supabaseClient, user: userData } ke context.
[Stack]: ElysiaJS + @supabase/supabase-js.
[Aturan]: Gunakan Elysia derive pattern, TypeScript ketat.
```

Ref: [ElysiaJS Lifecycle](https://elysiajs.com/essential/life-cycle.html)

**Checklist**:

- [ ] `bun run dev` → buka `localhost:5173/api/health` → tampil `{"status":"OK"}`
- [ ] Eden client bisa import type App tanpa error
- [ ] Supabase plugin berjalan (test via Postman/curl)
- [ ] `.gitignore` memuat `.env*`

---

### Task 1.3 — Setup Auth SSR: hooks.server.ts + Google OAuth (SP: 5)

**Tujuan**: Auth yang aman via `hooks.server.ts` (cookie-based SSR) + Google login.

> **MENGAPA hooks.server.ts?** File ini adalah "middleware" SvelteKit. Setiap request ke server melewati file ini. Di sinilah kita inisialisasi Supabase client agar session tersedia di semua halaman secara otomatis.

> Pecah menjadi **3 prompt terpisah**:

**Prompt AI #1 (hooks.server.ts + app.d.ts)**:

```
[Peran]: Kamu adalah Senior SvelteKit & Supabase SSR Expert.
[Tahap]: Tahap 1 — Setup Auth middleware.
[Tugas]: Buatkan file 'src/hooks.server.ts' menggunakan package '@supabase/ssr'.
Gunakan createServerClient() dengan cookie getAll/setAll.
Buatkan juga helper 'safeGetSession' di event.locals yang memanggil
auth.getUser() (BUKAN hanya getSession()) untuk verifikasi JWT.
Buatkan juga file 'src/app.d.ts' dengan types untuk Locals dan PageData.
[Stack]: SvelteKit + @supabase/ssr + TypeScript.
[Aturan]: Ikuti best practice dari docs resmi Supabase SvelteKit Auth.
```

**Prompt AI #2 (Layout server load)**:

```
[Peran]: Senior SvelteKit & Supabase Developer.
[Tahap]: Tahap 1 — Load session dari server ke client.
[Tugas]: Buatkan 'src/routes/+layout.server.ts' yang memanggil
event.locals.safeGetSession() dan meneruskan session + user ke PageData.
Buatkan juga 'src/routes/+layout.ts' yang membuat Supabase browser client.
[Stack]: SvelteKit + @supabase/ssr.
```

**Prompt AI #3 (Login page + AuthGuard)**:

```
[Peran]: Senior SvelteKit & Supabase Developer.
[Tahap]: Tahap 1 — Halaman login dan proteksi route.
[Tugas]: Buatkan halaman login dengan tombol 'Login with Google'
menggunakan supabase.auth.signInWithOAuth({ provider: 'google' }).
Buatkan juga komponen AuthGuard.svelte yang redirect ke /login
jika user belum terautentikasi. Sertakan fungsi signOut().
[Stack]: SvelteKit + Svelte 5 + Tailwind CSS + Supabase.
```

**Checklist**:

- [ ] File `src/hooks.server.ts` ada dan menggunakan `@supabase/ssr`
- [ ] File `src/app.d.ts` mendefinisikan types Locals
- [ ] Tombol "Login with Google" berfungsi
- [ ] Setelah login, redirect ke halaman utama
- [ ] Session persist saat refresh halaman (cookie-based)
- [ ] Tombol logout berfungsi

> **Ref**: [Supabase Docs: SvelteKit Auth](https://supabase.com/docs/guides/auth/server-side/sveltekit)

---

### Task 1.4 — Database: Tabel `inbox` + RLS (SP: 2)

**Tujuan**: Tabel untuk menyimpan quick capture dengan keamanan per-user.

**Prompt AI**:

```
[Peran]: Kamu adalah Senior Supabase & PostgreSQL Architect.
[Tahap]: Saya sedang di Tahap 1 — Membangun skema database Inbox.
[Tugas]: Buatkan SQL migration untuk tabel 'inbox'. Kolom: id (uuid PK default
gen_random_uuid()), user_id (uuid references auth.users), content (text not null),
type (text check in 'text','audio' default 'text'), created_at (timestamptz default now()).
Tambahkan RLS policy: user hanya bisa SELECT, INSERT, DELETE data miliknya sendiri.
[Aturan]: Berikan kode SQL lengkap siap eksekusi.
```

**Buat migration via CLI** (JANGAN buat file manual):

```bash
# Pastikan Podman machine sudah running sebelum perintah ini!
podman machine start   # (jika belum aktif)

supabase migration new create_inbox
# → Output: supabase/migrations/20260526XXXXXX_create_inbox.sql
# Buka file tersebut, paste SQL dari AI ke dalamnya
```

**Jalankan**: `supabase db reset` untuk apply & verifikasi

> **Catatan Podman**: `supabase db reset` akan restart container PostgreSQL via Podman. Proses ini normal memakan waktu 30–60 detik.

**Checklist**:

- [ ] Tabel `inbox` muncul di Supabase Studio lokal
- [ ] RLS policy aktif (cek di tab Policies)

---

### Task 1.5 — API + Komponen Emergency Inbox (SP: 3)

**Tujuan**: ElysiaJS API endpoint + halaman mobile-first untuk tangkap ide cepat.

> Pecah menjadi **3 prompt terpisah** (Backend API → Frontend UI → Halaman):

**Prompt AI #1 (ElysiaJS Feature: Inbox API)**:

```
[Peran]: Senior ElysiaJS & Supabase Developer.
[Tahap]: Tahap 1 — API endpoint untuk Emergency Inbox.
[Tugas]: Buatkan feature module inbox di 'src/lib/server/features/inbox/':
(1) model.ts — TypeBox schema untuk inbox item (content: string, type: 'text'|'audio')
(2) service.ts — Fungsi: addInboxItem, getInboxItems, deleteInboxItem. Pakai Supabase client.
(3) index.ts — ElysiaJS routes: GET /api/inbox, POST /api/inbox, DELETE /api/inbox/:id.
    Gunakan Supabase plugin dari plugins/supabase.ts untuk auth.
Register module ini di src/lib/server/elysia.ts.
[Stack]: Bun + ElysiaJS + Supabase + TypeBox.
[Aturan]: Feature-first structure, kode bersih, validasi via TypeBox.
```

Ref: [ElysiaJS Validation](https://elysiajs.com/essential/validation.html)

**Prompt AI #2 (Komponen UI)**:

```
[Peran]: Senior SvelteKit Developer (Svelte 5).
[Tahap]: Tahap 1 — Komponen UI Quick Capture.
[Tugas]: Buatkan komponen 'src/lib/components/QuickCapture.svelte' dengan Tailwind CSS.
Fitur: (1) Input teks + tombol Submit, (2) Tombol mikrofon (Web Speech API
untuk voice-to-text), (3) Panggil ElysiaJS API via Eden Treaty client
(import dari '$lib/eden'): api.api.inbox.post({ content, type }).
Desain mobile-first, bersih, minimalis. Gunakan Svelte 5 ($state, $derived).
```

**Prompt AI #3 (Halaman)**:

```
[Peran]: Senior SvelteKit Developer (Svelte 5).
[Tahap]: Tahap 1 — Halaman utama Inbox.
[Tugas]: Buatkan 'src/routes/+page.svelte' yang menampilkan QuickCapture
di atas dan daftar inbox items di bawahnya. Setiap item punya tombol hapus.
Data diambil via Eden Treaty: api.api.inbox.get() saat halaman mount ($effect).
Gunakan Svelte 5 syntax.
```

**Checklist**:

- [ ] Ketik teks → Submit → data masuk database via API
- [ ] Tombol mikrofon → speech-to-text → input terisi otomatis
- [ ] Daftar inbox muncul & bisa dihapus
- [ ] `bun run lint` bersih

---

### Task 1.6 — Seed Data untuk Testing (SP: 1)

**Tujuan**: Data sampel otomatis agar database tidak kosong setelah `supabase db reset`.

**Prompt AI**:

```
[Peran]: Senior Supabase Developer.
[Tahap]: Tahap 1 — Seed data untuk development.
[Tugas]: Buatkan file 'supabase/seed.sql' berisi INSERT statements:
- 5 contoh inbox items (campuran teks dan audio)
- 5 kutipan motivasi untuk tabel quotes nanti
Gunakan user_id placeholder yang bisa diganti.
[Aturan]: SQL bersih, mudah diedit oleh junior.
```

**Checklist**:

- [ ] `supabase db reset` mengisi tabel inbox dengan data sampel

> **Ref**: [Supabase Docs: Seeding Data](https://supabase.com/docs/guides/local-development/overview#seeding-data)

---

### Task 1.7 — Navigation Layout (SP: 2)

**Tujuan**: Bottom navigation yang muncul di semua halaman.

> **MENGAPA di Tahap 1?** Layout navigasi adalah fondasi UI — lebih baik dibangun di awal agar semua halaman berikutnya langsung memiliki navigasi.

**Prompt AI**:

```
[Peran]: Senior SvelteKit Developer (Svelte 5).
[Tahap]: Tahap 1 — Layout navigasi global.
[Tugas]: Buatkan 'src/routes/+layout.svelte' dengan bottom navigation bar
(mobile-first) menggunakan Tailwind. Menu: 📥 Inbox (/), ✅ Tasks (/tasks),
🔥 Habits (/habits), 📝 Notes (/notes). Highlight menu aktif berdasarkan
$page.url.pathname. Sertakan juga tombol logout di header atas.
Gunakan Svelte 5 syntax ($state, $derived) — BUKAN Svelte 4.
```

**Checklist**:

- [ ] Navigasi bawah muncul di semua halaman
- [ ] Menu aktif ter-highlight
- [ ] Navigasi lancar tanpa reload halaman

---

### Task 1.8 — Git Commit & Backup Tahap 1

```bash
git add .
git commit -m "feat: tahap 1 - fondasi, auth, inbox, nav [skip ci]"
git push origin feature/tahap-1
```

---

## 🟡 TAHAP 2: To-Do List & Habit Engine (Minggu 2) — 19 SP

### Task 2.1 — Database: Tabel `tasks`, `sub_tasks`, `habits` (SP: 5)

**Tujuan**: Skema relasional untuk manajemen tugas & kebiasaan.

**Prompt AI**:

```
[Peran]: Kamu adalah Senior Supabase & PostgreSQL Architect.
[Tahap]: Tahap 2 — Skema database Tasks & Habits.
[Tugas]: Buatkan SQL migration untuk 3 tabel:
1. tasks: id (uuid PK), user_id (uuid ref auth.users), title (text),
   context (text — contoh: '@Online','@Rumah','@DeepWork'),
   energy_level (text check 'tinggi','sedang','rendah'),
   is_completed (boolean default false), reminder_at (timestamptz nullable),
   created_at (timestamptz default now()).
2. sub_tasks: id (uuid PK), task_id (uuid ref tasks ON DELETE CASCADE),
   title (text), is_completed (boolean default false).
3. habits: id (uuid PK), user_id (uuid ref auth.users), title (text),
   streak_count (int default 0), last_completed (date nullable),
   is_done_today (boolean default false).
Tambahkan RLS policies untuk ketiga tabel.
Buatkan PostgreSQL trigger+function pada habits:
- Jika is_done_today diubah ke true → cek last_completed.
  Jika kemarin → increment streak_count. Jika bukan → reset ke 1.
  Set last_completed = today.
- Buatkan juga function untuk daily reset is_done_today = false.
[Aturan]: SQL lengkap siap eksekusi, dengan komentar penjelasan tiap bagian.
```

**Buat migration via CLI**:

```bash
# Pastikan Podman machine aktif: podman machine start
supabase migration new create_tasks_habits
```

**Checklist**:

- [ ] 3 tabel muncul di Supabase Studio
- [ ] Test manual: update `is_done_today` → streak naik
- [ ] RLS aktif di ketiga tabel

---

### Task 2.2 — ElysiaJS API: Tasks & Habits (SP: 3)

**Prompt AI #1 (Tasks API)**:

```
[Peran]: Senior ElysiaJS & Supabase Developer.
[Tahap]: Tahap 2 — API endpoint Tasks.
[Tugas]: Buatkan feature module di 'src/lib/server/features/tasks/':
(1) model.ts — TypeBox schemas untuk task dan sub_task.
(2) service.ts — Fungsi: getTasks, addTask, updateTask, deleteTask,
    getSubTasks, addSubTask, toggleSubTask. Pakai Supabase client.
(3) index.ts — ElysiaJS routes: CRUD /api/tasks dan /api/tasks/:id/subtasks.
    Gunakan Supabase plugin untuk auth.
[Stack]: Bun + ElysiaJS + Supabase + TypeBox.
```

**Prompt AI #2 (Habits API)**:

```
[Peran]: Senior ElysiaJS & Supabase Developer.
[Tahap]: Tahap 2 — API endpoint Habits.
[Tugas]: Buatkan feature module di 'src/lib/server/features/habits/':
(1) model.ts — TypeBox schema untuk habit.
(2) service.ts — Fungsi: getHabits, addHabit, toggleHabitDone, deleteHabit.
(3) index.ts — ElysiaJS routes: CRUD /api/habits.
[Stack]: Bun + ElysiaJS + Supabase + TypeBox.
```

**Checklist**:

- [ ] Semua fungsi CRUD bisa dipanggil tanpa error di console

---

### Task 2.3 — Halaman To-Do List + Progress Bar (SP: 5)

**Prompt AI**:

```
[Peran]: Senior SvelteKit Developer (Svelte 5 Runes).
[Tahap]: Tahap 2 — Halaman To-Do List interaktif.
[Tugas]: Buatkan 'src/routes/tasks/+page.svelte' dengan fitur:
1. Form tambah task (input: title, dropdown context, dropdown energy_level)
2. Daftar tasks — setiap task bisa di-expand untuk lihat sub_tasks
3. Checkbox sub_task menggunakan bind:checked
4. Progress bar menggunakan $derived() untuk menghitung % sub_tasks selesai secara reaktif
5. Filter berdasarkan context dan energy_level
Gunakan Svelte 5 syntax ($state, $derived, $props). BUKAN Svelte 4 ($: atau stores).
Panggil API via Eden Treaty (import dari '$lib/eden').
Tailwind CSS, desain bersih.
```

**Checklist**:

- [ ] Tambah task dengan context & energy level ✓
- [ ] Tambah sub-task di dalam task ✓
- [ ] Progress bar bergerak saat sub-task dicentang ✓
- [ ] Filter berfungsi ✓

---

### Task 2.4 — Halaman Habit Tracker (SP: 3)

**Prompt AI**:

```
[Peran]: Senior SvelteKit Developer (Svelte 5 Runes).
[Tahap]: Tahap 2 — Habit Tracker dengan streak system.
[Tugas]: Buatkan 'src/routes/habits/+page.svelte'. Fitur:
(1) Daftar habits harian, setiap habit ada tombol centang.
(2) Tampilkan streak count dengan emoji api 🔥.
(3) Jika streak >= 7, tampilkan pesan apresiasi kustom.
(4) Form tambah habit baru.
Gunakan Svelte 5 syntax ($state, $derived). BUKAN Svelte 4.
Panggil API via Eden Treaty (import dari '$lib/eden'). Tailwind CSS.
```

**Checklist**:

- [ ] Habit muncul sebagai daftar harian
- [ ] Centang habit → streak naik (verifikasi di database)
- [ ] Pesan apresiasi muncul saat streak >= 7

---

### Task 2.5 — Reminder Notification (SP: 2)

**Prompt AI**:

```
[Peran]: Senior SvelteKit Developer (Svelte 5).
[Tahap]: Tahap 2 — Sistem pengingat tugas.
[Tugas]: Buatkan 'src/lib/utils/reminder.ts'. Fungsi checkReminders():
- Dipanggil setiap 60 detik via setInterval
- Query tasks yang punya reminder via Eden Treaty: api.api.tasks.get()
- Filter tasks yang reminder_at mendekati waktu sekarang (selisih < 5 menit)
- Tampilkan notifikasi via browser Notification API
- Handle edge case: minta izin notifikasi dulu, jangan duplikat notifikasi
  untuk task yang sama, handle jika tab tidak aktif.
```

**Checklist**:

- [ ] Browser minta izin notifikasi saat pertama kali
- [ ] Notifikasi muncul saat waktu reminder tiba
- [ ] Tidak ada duplikat notifikasi

---

### Task 2.6 — Git Commit Tahap 2

```bash
git add .
git commit -m "feat: tahap 2 - todo, habits, reminder [skip ci]"
git push origin feature/tahap-2
```

---

## 🟢 TAHAP 3: Notes & Motivation Engine (Minggu 3) — 15 SP

### Task 3.1 — Database: Tabel `notes` & `quotes` (SP: 2)

**Prompt AI**:

```
[Peran]: Senior Supabase & PostgreSQL Architect.
[Tahap]: Tahap 3 — Skema database Notes & Quotes.
[Tugas]: Buatkan SQL migration untuk 2 tabel:
1. notes: id (uuid PK), user_id (uuid ref auth.users), title (text),
   body (jsonb), created_at, updated_at (timestamptz default now()).
2. quotes: id (uuid PK), user_id (uuid ref auth.users), content (text),
   category (text nullable — contoh: 'finansial','coding','motivasi').
Tambahkan RLS policies dan trigger auto-update updated_at pada notes.
```

**Buat migration via CLI**:

```bash
# Pastikan Podman machine aktif: podman machine start
supabase migration new create_notes_quotes
```

**Checklist**:

- [ ] Kedua tabel muncul di Supabase Studio

---

### Task 3.2 — Integrasi TipTap Editor (SP: 5)

**Install dulu**: `bun add @tiptap/core @tiptap/starter-kit @tiptap/pm`

**Prompt AI**:

```
[Peran]: Senior SvelteKit Developer & TipTap Expert (Svelte 5).
[Tahap]: Tahap 3 — Rich text editor block-based.
[Tugas]: Buatkan komponen 'src/lib/components/BlockEditor.svelte'.
Fitur: toolbar Bold, Italic, Heading 1/2/3, Bullet List.
Output editor = format JSON (bukan HTML) untuk disimpan ke kolom JSONB Supabase.
Komponen menerima prop via $props() dan callback on:save dengan data JSON.

⚠️ PENTING (SSR Guard): TipTap mengakses DOM secara langsung.
Inisialisasi editor HARUS di dalam onMount() atau lindungi dengan:
import { browser } from '$app/environment';
JANGAN inisialisasi di top-level <script>. Ini akan crash saat SSR.

Gunakan Svelte 5 syntax. Tailwind CSS untuk styling toolbar.
```

**Checklist**:

- [ ] Editor muncul dengan toolbar formatting
- [ ] Output berupa JSON (bukan HTML)
- [ ] Tidak ada error SSR saat refresh halaman

> **Ref**: [TipTap Docs: Svelte Setup](https://tiptap.dev/docs/guides/first-steps)

---

### Task 3.3 — ElysiaJS API + Halaman Notes CRUD (SP: 5)

> Pecah menjadi **2 prompt** (Backend API → Frontend):

**Prompt AI #1 (Notes API)**:

```
[Peran]: Senior ElysiaJS & Supabase Developer.
[Tahap]: Tahap 3 — API endpoint Notes.
[Tugas]: Buatkan feature module di 'src/lib/server/features/notes/':
(1) model.ts — TypeBox schema untuk note (title: string, body: jsonb).
(2) service.ts — Fungsi: getNotes, addNote, updateNote, deleteNote. Pakai Supabase.
(3) index.ts — ElysiaJS routes: GET /api/notes, POST, PUT /api/notes/:id, DELETE.
Register di src/lib/server/elysia.ts.
[Stack]: Bun + ElysiaJS + Supabase + TypeBox.
```

**Prompt AI #2 (Halaman Notes)**:

```
[Peran]: Senior SvelteKit Developer (Svelte 5).
[Tahap]: Tahap 3 — Halaman manajemen Notes.
[Tugas]: Buatkan 'src/routes/notes/+page.svelte'.
Layout: daftar notes di sidebar kiri, editor BlockEditor di area kanan.
Klik note → load content ke editor. Tombol Save → simpan JSON via
Eden Treaty: api.api.notes({ id }).put({ title, body }).
Gunakan Svelte 5 syntax.
```

**Checklist**:

- [ ] Bisa buat, edit, hapus notes via API
- [ ] Konten JSONB bisa di-load kembali ke editor

---

### Task 3.4 — Motivation Engine Widget (SP: 3)

**Prompt AI**:

```
[Peran]: Senior SvelteKit Developer (Svelte 5).
[Tahap]: Tahap 3 — Widget motivasi dinamis.
[Tugas]: Buatkan 2 hal:
(1) Komponen 'src/lib/components/MotivationWidget.svelte' — saat mount ($effect),
query via Eden Treaty: api.api.quotes.get(), pilih 1 secara acak,
tampilkan dalam card inspiratif. Jika kosong, tampilkan "Tambahkan kutipan motivasimu!".
(2) Halaman 'src/routes/notes/quotes/+page.svelte' untuk CRUD kutipan
via Eden Treaty. Kategori: finansial, coding, motivasi, public speaking, bahasa Inggris.
Gunakan Svelte 5 syntax.
```

**Checklist**:

- [ ] Widget menampilkan kutipan acak berbeda tiap refresh
- [ ] Bisa tambah/edit/hapus kutipan per kategori

---

### Task 3.5 — Git Commit Tahap 3

```bash
git add .
git commit -m "feat: tahap 3 - notes, tiptap, motivasi [skip ci]"
git push origin feature/tahap-3
```

---

## 🔵 TAHAP 4: Google Integration & PWA (Minggu 4) — 13 SP

### Task 4.1 — Google OAuth Scopes (SP: 3)

**Prompt AI**:

```
[Peran]: Senior Backend & OAuth Expert.
[Tahap]: Tahap 4 — Konfigurasi Google API scopes.
[Tugas]: Jelaskan langkah-langkah mengaktifkan scope 'tasks' dan 'calendar'
di Google Cloud Console untuk Supabase Auth. Lalu buatkan fungsi di SvelteKit
untuk mengambil provider_token Google dari session Supabase setelah login.
```

**Checklist**:

- [ ] Google Cloud Console dikonfigurasi
- [ ] `provider_token` berhasil diambil

---

### Task 4.2 — Sync Engine: Google Tasks & Calendar (SP: 5)

**Prompt AI**:

```
[Peran]: Senior ElysiaJS & Google API Integration Expert.
[Tahap]: Tahap 4 — Sinkronisasi dengan ekosistem Google.
[Tugas]: Buatkan feature module di 'src/lib/server/features/google-sync/':
(1) service.ts — 2 fungsi:
    createGoogleTaskList(token, title) — panggil Google Tasks API via fetch()
    createCalendarEvent(token, title, datetime) — panggil Google Calendar API
(2) index.ts — ElysiaJS routes: POST /api/google/tasks, POST /api/google/calendar.
    Ambil provider_token dari context user.
Keduanya menggunakan Authorization: Bearer token. Handle error & response.
[Stack]: Bun + ElysiaJS.
```

**Checklist**:

- [ ] Buat project → tasklist muncul di Google Tasks HP
- [ ] Set deadline → event muncul di Google Calendar

---

### Task 4.3 — PWA Configuration (SP: 3)

**Install**: `bun add -d vite-plugin-pwa`

**Prompt AI**:

```
[Peran]: Senior SvelteKit & PWA Expert.
[Tahap]: Tahap 4 — Progressive Web App.
[Tugas]: Berikan konfigurasi 'vite-plugin-pwa' untuk SvelteKit.
Setup manifest.json dan Service Worker dengan strategi:
- Cache First untuk asset statis (CSS, JS, gambar)
- Network First untuk request API ElysiaJS (/api/*)
Agar aplikasi bisa dibuka offline dan muncul tombol "Install App".
```

**Checklist**:

- [ ] "Add to Home Screen" muncul di browser mobile
- [ ] Halaman statis bisa dibuka offline

---

### Task 4.4 — Code Review & QA (SP: 1)

**Prompt AI (untuk setiap file penting)**:

```
[Peran]: Bertindaklah sebagai Senior Developer dan QA Engineer.
[Tugas]: Review kode berikut. Cari: bug, celah keamanan, memory leak,
pemborosan performa. Berikan skor 1-10 dan daftar perbaikan prioritas.
[Kode]: <paste kode file>
```

**Tugas Manual**:

1. Hapus semua `console.log`
2. `bun run lint` → perbaiki semua error
3. `bun run build` → pastikan build sukses
4. Test manual: buka setiap halaman, coba setiap fitur
5. Test semua API endpoint via `localhost:5173/api/health`

**Checklist**:

- [ ] Zero linting errors
- [ ] Build sukses tanpa warning kritis
- [ ] Semua 4 pilar berfungsi: Inbox ✓ Tasks ✓ Habits ✓ Notes ✓

---

### Task 4.5 — Deployment ke Production (SP: 1)

> **INI SATU-SATUNYA MOMEN PUSH KE MAIN.** Gunakan branch `dev` sebagai buffer keamanan sebelum production.

```bash
# 1. Merge semua feature branches ke dev (buffer)
git checkout dev
git merge feature/tahap-1
git merge feature/tahap-2
git merge feature/tahap-3
git merge feature/tahap-4

# 2. Test final di branch dev
bun run build && bun run lint

# 3. Jika semua hijau, merge ke main & deploy
git checkout main
git merge dev
git push origin main
# → Vercel/Netlify otomatis build & deploy (1x build bersih)
```

**Checklist**:

- [ ] Aplikasi live di URL production
- [ ] HTTPS aktif
- [ ] Login Google berfungsi di production
- [ ] Semua fitur berjalan normal

---

## 📊 RINGKASAN ESTIMASI

| Tahap | Fokus                                         | Tasks  | SP     | Durasi       |
| :---- | :-------------------------------------------- | :----- | :----- | :----------- |
| 🔴 1  | Fondasi + Bun + ElysiaJS + Auth + Inbox + Nav | 8      | 21     | Minggu 1     |
| 🟡 2  | Tasks API + Habits API + Reminder             | 6      | 19     | Minggu 2     |
| 🟢 3  | Notes API + TipTap + Motivasi                 | 5      | 15     | Minggu 3     |
| 🔵 4  | Google Sync API + PWA + Deploy                | 5      | 13     | Minggu 4     |
|       | **TOTAL**                                     | **24** | **68** | **4 Minggu** |

---

## ✅ CHECKLIST AKHIR PROYEK

- [ ] Semua fitur MVP berjalan di production
- [ ] Semua API endpoints berfungsi (`/api/health`, `/api/inbox`, `/api/tasks`, dll.)
- [ ] RLS policies aktif di semua tabel (inbox, tasks, sub_tasks, habits, notes, quotes)
- [ ] Eden Treaty type-check bersih (no TypeScript errors)
- [ ] `.env.example` ada di repo (tanpa nilai sensitif)
- [ ] `README.md` berisi setup guide (Bun + Supabase CLI + **Podman**)
- [ ] `CHANGELOG.md` mencatat perubahan per tahap
- [ ] Git history bersih dan terstruktur (branch per tahap)
- [ ] Lighthouse score >= 90
- [ ] `bun audit` bersih (tidak ada vulnerability kritis)
- [ ] **[PODMAN]** `podman machine start` didokumentasikan di README sebagai prasyarat
- [ ] **[PODMAN]** `DOCKER_HOST` environment variable terdokumentasi di `.env.example` atau README
- [ ] **[PODMAN]** `podman ps` menampilkan container Supabase saat development

---

> 💡 **Pesan untuk Junior / AI:**
> "Kerjakan **satu Task pada satu waktu**. Jangan loncat ke Task berikutnya sebelum yang sekarang 100% beres dan lolos checklist. Satu komponen kecil = satu prompt = hasil akurat. Jangan panik bila menemui error — itu normal. Perbaiki, test, lanjut. Semoga berhasil! 🚀"
