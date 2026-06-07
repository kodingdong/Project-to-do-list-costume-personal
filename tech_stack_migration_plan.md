# 🔧 Tech Stack Migration Plan (Opsi A — SvelteKit Native)

> **Untuk**: Junior Developer / AI (Gemini Flash, Claude Haiku)
> **Runtime**: Bun (BUKAN npm). Semua command pakai `bun`.
> **Referensi kode**: Lihat `tech_stack_migration_code.md` untuk kode lengkap setiap file.
> **Aturan utama**: JANGAN hapus file `service.ts` dan `service.test.ts`.

---

## 🔀 Git Workflow (WAJIB DIIKUTI)

### Sebelum mulai

```bash
git checkout main
git pull origin main
git checkout -b refactor/sveltekit-native-api
```

### Setiap selesai 1 fase → commit

Format commit: `<type>(<scope>): <deskripsi singkat>`

| Fase | Commit Message |
|:-----|:---------------|
| 1 | `chore(deps): hapus elysia tailwind dan package-lock` |
| 2 | `feat(api): buat sveltekit native api routes` |
| 3 | `refactor(frontend): migrasi eden treaty ke native fetch` |
| 4 | `chore(cleanup): hapus file elysia dan google-sync` |
| 5 | `test: verifikasi build lint dan unit test` |

### Setelah semua fase selesai

```bash
git push origin refactor/sveltekit-native-api
```

Lalu buat **Pull Request** ke `main` di GitHub dengan judul:
`refactor: migrasi ElysiaJS ke SvelteKit native API`

---

## 🔴 FASE 1 — Hapus Dependencies (commit setelah selesai)

### Langkah 1.1 — Hapus package-lock.json

```powershell
Remove-Item "package-lock.json" -ErrorAction SilentlyContinue
```

Buka `.gitignore`, tambahkan baris baru di akhir file:

```
package-lock.json
```

### Langkah 1.2 — Hapus packages

```powershell
bun remove tailwindcss @tailwindcss/vite prettier-plugin-tailwindcss elysia @elysiajs/eden @elysiajs/cors
```

### Langkah 1.3 — Edit `vite.config.ts`

**HAPUS** baris 1 (`import tailwindcss...`) dan baris 8 (`tailwindcss(),`). Hasil akhir harus seperti ini:

```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			injectRegister: 'auto',
			manifest: {
				name: 'FlowDo',
				short_name: 'FlowDo',
				description: 'All-in-One To-Do List & Habit Tracker',
				theme_color: '#1e1e42',
				background_color: '#0f0f1a',
				display: 'standalone',
				icons: [
					{ src: 'favicon.svg', sizes: '192x192', type: 'image/svg+xml' },
					{ src: 'favicon.svg', sizes: '512x512', type: 'image/svg+xml' }
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
				runtimeCaching: [
					{
						urlPattern: /^\/api\//,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'api-cache',
							networkTimeoutSeconds: 5,
							expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }
						}
					}
				]
			}
		})
	]
});
```

### Langkah 1.4 — Edit `src/routes/layout.css`

**HAPUS** baris 7 saja (`@import 'tailwindcss';`). Baris lain JANGAN diubah.

### Langkah 1.5 — Verifikasi lalu commit

```powershell
bun install
bun run check
git add .
git commit -m "chore(deps): hapus elysia tailwind dan package-lock"
```

Jika `bun run check` error, perbaiki dulu sebelum commit.

---

## 🟡 FASE 2 — Buat SvelteKit Native API Routes (commit setelah selesai)

Buat semua file baru sesuai kode di `tech_stack_migration_code.md` bagian **FASE 2**.

Daftar file yang harus dibuat (16 file):

| # | File | Methods |
|:--|:-----|:--------|
| 1 | `src/routes/api/health/+server.ts` | GET |
| 2 | `src/routes/api/inbox/+server.ts` | GET, POST |
| 3 | `src/routes/api/inbox/[id]/+server.ts` | DELETE |
| 4 | `src/routes/api/tasks/+server.ts` | GET, POST |
| 5 | `src/routes/api/tasks/[id]/+server.ts` | PUT, DELETE |
| 6 | `src/routes/api/tasks/[id]/subtasks/+server.ts` | GET, POST |
| 7 | `src/routes/api/tasks/subtasks/[id]/+server.ts` | PUT, DELETE |
| 8 | `src/routes/api/tasks/reminders/+server.ts` | GET |
| 9 | `src/routes/api/habits/+server.ts` | GET, POST |
| 10 | `src/routes/api/habits/[id]/+server.ts` | PUT, DELETE |
| 11 | `src/routes/api/notes/+server.ts` | GET, POST |
| 12 | `src/routes/api/notes/[id]/+server.ts` | PUT, DELETE |
| 13 | `src/routes/api/quotes/+server.ts` | GET, POST |
| 14 | `src/routes/api/quotes/[id]/+server.ts` | DELETE |

**ATURAN untuk setiap file:**
1. Import `json` dan `error` dari `@sveltejs/kit`
2. Import type `RequestHandler` dari `./$types`
3. Import fungsi dari `$lib/server/features/<nama>/service`
4. Auth: `const { user } = await locals.safeGetSession();`
5. Jika `!user` → return `error(401, 'Unauthorized')`
6. Gunakan `locals.supabase` sebagai parameter `db` ke service

### Verifikasi lalu commit

```powershell
bun run check
git add .
git commit -m "feat(api): buat sveltekit native api routes"
```

---

## 🟢 FASE 3 — Migrasi Frontend: Eden → Fetch (commit setelah selesai)

Edit 8 file. Untuk setiap file, lakukan 3 hal:
1. **HAPUS** `import { api } from '$lib/eden';`
2. **HAPUS** `import { getAuthHeaders } from '$lib/utils/auth';`
3. **GANTI** setiap `api.api.*` call dengan `fetch()` (lihat kode di `tech_stack_migration_code.md`)

### Daftar file dan perubahan

| # | File | Perubahan |
|:--|:-----|:----------|
| 1 | `src/routes/+page.svelte` | Ganti Eden calls di fetchItems dan deleteItem |
| 2 | `src/lib/components/QuickCapture.svelte` | Ganti Eden call di handleSubmit |
| 3 | `src/routes/tasks/+page.svelte` | Ganti semua Eden calls + HAPUS blok Google Sync (baris ~102-129) |
| 4 | `src/routes/habits/+page.svelte` | Ganti Eden calls di fetch/add/toggle/delete |
| 5 | `src/routes/notes/+page.svelte` | Ganti Eden calls di fetch/add/update/delete |
| 6 | `src/routes/notes/quotes/+page.svelte` | Ganti Eden calls di fetch/add/delete |
| 7 | `src/lib/components/MotivationWidget.svelte` | Ganti Eden call, hapus token manual |
| 8 | `src/lib/utils/reminder.ts` | Ganti Eden call, hapus parameter `accessToken` |

### Juga edit `src/routes/+layout.svelte`

Ubah baris 21 dan 52-55:

**SEBELUM:**
```typescript
let accessToken = $derived($page.data?.session?.access_token || '');
// ...
if (browser && userData && accessToken) {
    startReminders(accessToken);
}
```

**SESUDAH:**
```typescript
// HAPUS baris accessToken sepenuhnya
// ...
if (browser && userData) {
    startReminders();
}
```

### Pola penggantian API calls

**GET (ambil data):**
```diff
-const { data, error } = await api.api.inbox.get({ headers: getAuthHeaders() });
-if (!error) items = data || [];
+const res = await fetch('/api/inbox');
+if (res.ok) items = await res.json();
```

**POST (tambah data):**
```diff
-const { error } = await api.api.inbox.post({ content, type }, { headers: getAuthHeaders() });
+const res = await fetch('/api/inbox', {
+    method: 'POST',
+    headers: { 'Content-Type': 'application/json' },
+    body: JSON.stringify({ content, type })
+});
+const error = !res.ok;
```

**PUT (update data):**
```diff
-const { error } = await api.api.tasks({ id }).put(updates, { headers: getAuthHeaders() });
+const res = await fetch(`/api/tasks/${id}`, {
+    method: 'PUT',
+    headers: { 'Content-Type': 'application/json' },
+    body: JSON.stringify(updates)
+});
+const error = !res.ok;
```

**DELETE (hapus data):**
```diff
-const { error } = await api.api.inbox({ id }).delete({ headers: getAuthHeaders() });
+const res = await fetch(`/api/inbox/${id}`, { method: 'DELETE' });
+const error = !res.ok;
```

### Verifikasi lalu commit

```powershell
bun run check
git add .
git commit -m "refactor(frontend): migrasi eden treaty ke native fetch"
```

---

## 🔵 FASE 4 — Cleanup File Lama (commit setelah selesai)

### Langkah 4.1 — Hapus file ElysiaJS

Jalankan di PowerShell dari root project:

```powershell
Remove-Item "src\lib\server\elysia.ts"
Remove-Item "src\lib\server\plugins" -Recurse -Force
Remove-Item "src\lib\server\features\google-sync" -Recurse -Force
Remove-Item "src\lib\eden.ts"
Remove-Item "src\lib\utils\auth.ts"
Remove-Item "src\routes\api\[...slugs]" -Recurse -Force
```

### Langkah 4.2 — Hapus index.ts dan model.ts dari setiap feature

```powershell
# HATI-HATI: Hanya hapus index.ts dan model.ts, BUKAN service.ts!
Remove-Item "src\lib\server\features\inbox\index.ts"
Remove-Item "src\lib\server\features\inbox\model.ts"
Remove-Item "src\lib\server\features\tasks\index.ts"
Remove-Item "src\lib\server\features\tasks\model.ts"
Remove-Item "src\lib\server\features\habits\index.ts" -ErrorAction SilentlyContinue
Remove-Item "src\lib\server\features\habits\model.ts" -ErrorAction SilentlyContinue
Remove-Item "src\lib\server\features\notes\index.ts" -ErrorAction SilentlyContinue
Remove-Item "src\lib\server\features\notes\model.ts" -ErrorAction SilentlyContinue
Remove-Item "src\lib\server\features\quotes\index.ts" -ErrorAction SilentlyContinue
Remove-Item "src\lib\server\features\quotes\model.ts" -ErrorAction SilentlyContinue
```

### Langkah 4.3 — Verifikasi file yang HARUS masih ada

Jalankan:
```powershell
Get-ChildItem "src\lib\server\features\*\service.ts" | ForEach-Object { Write-Host "OK: $_" }
```

Harus muncul 5 file service.ts (inbox, tasks, habits, notes, quotes).

### Commit

```powershell
git add .
git commit -m "chore(cleanup): hapus file elysia dan google-sync"
```

---

## ✅ FASE 5 — Verifikasi Final (commit setelah selesai)

### Langkah 5.1 — Jalankan semua checks

```powershell
bun run check
bun run lint
bun run build
bun run test
```

Semua HARUS pass tanpa error. Jika ada error, perbaiki dulu.

### Langkah 5.2 — Manual test

```powershell
bun run dev
```

Buka browser, test:
1. `http://localhost:5173/api/health` → harus return `{"status":"OK",...}`
2. Login via Google → harus redirect dan session persist
3. Inbox: tambah item, hapus item
4. Tasks: tambah, toggle, filter, subtasks
5. Habits: centang, cek streak naik
6. Notes: buat note, edit, save
7. Quotes: tambah, hapus

### Langkah 5.3 — Final commit + push + PR

```powershell
git add .
git commit -m "test: verifikasi build lint dan unit test" --allow-empty
git push origin refactor/sveltekit-native-api
```

Buat Pull Request di GitHub:
- **Title**: `refactor: migrasi ElysiaJS ke SvelteKit native API`
- **Base**: `main`
- **Description**: Salin tabel ringkasan dari bagian atas dokumen ini

Setelah review dan merge:
```powershell
git checkout main
git pull origin main
git branch -d refactor/sveltekit-native-api
```

---

## 📊 Ringkasan

| Metrik | Sebelum | Sesudah |
|:-------|:--------|:--------|
| Dependencies | 19 | 12 (-37%) |
| Routing layers | 2 (SvelteKit+ElysiaJS) | 1 (SvelteKit) |
| Auth | Cookie + Bearer token | Cookie saja |
| Frameworks | 2 | 1 |
| Google Sync | Incomplete | Dihapus |
| Tailwind CSS | Installed tapi tidak dipakai | Dihapus |
| Lock files | 2 (bun.lock + package-lock) | 1 (bun.lock) |
