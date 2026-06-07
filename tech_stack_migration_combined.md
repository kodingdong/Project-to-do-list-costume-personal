# 🚀 High-Level Tech Stack Migration Guide (SvelteKit Native)

> **Target**: Junior Developer / AI Model (Gemini Flash, Claude Haiku)
> **Tujuan**: Migrasi backend dari ElysiaJS ke SvelteKit Native, hapus dependensi tidak terpakai, dan hapus fitur Google Sync.
> **Penting**: Gunakan `bun` untuk semua perintah. **JANGAN hapus file `service.ts` dan `service.test.ts`.**

---

## 🔀 Persiapan Git
Buat branch baru sebelum memulai:
```bash
git checkout main && git pull origin main
git checkout -b refactor/sveltekit-native-api
```

---

## 🔴 FASE 1: Hapus Dependensi & File Lock

1. **Hapus package-lock.json** dan tambahkan `package-lock.json` ke dalam baris baru di file `.gitignore`.
2. **Jalankan perintah ini di terminal:**
   ```bash
   bun remove tailwindcss @tailwindcss/vite prettier-plugin-tailwindcss elysia @elysiajs/eden @elysiajs/cors
   ```
3. **Edit `vite.config.ts`**: Hapus `import tailwindcss...` dan plugin `tailwindcss(),`.
4. **Edit `src/routes/layout.css`**: Hapus baris `@import 'tailwindcss';` (berada di sekitar baris 7).
5. **Verifikasi**: Jalankan `bun install` dan `bun run check`. Commit dengan pesan `chore(deps): hapus elysia tailwind dan package-lock`.

---

## 🟡 FASE 2: Buat SvelteKit API Routes

Buat file `+server.ts` baru di dalam folder `src/routes/api/`. Semua file endpoint menggunakan pola yang sama: Memastikan Auth via cookie (`locals.safeGetSession()`) lalu memanggil fungsi database dari `service.ts`.

Berikut adalah referensi kode utama. Buat file-file berikut dan copy-paste kodenya:

### 1. `src/routes/api/health/+server.ts`
```typescript
import { json } from '@sveltejs/kit';
export const GET = async () => json({ status: 'OK', timestamp: new Date().toISOString() });
```

### 2. Patter Utama untuk semua Endpoint (Contoh: Inbox)
**File: `src/routes/api/inbox/+server.ts`**
```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getInboxItems, addInboxItem } from '$lib/server/features/inbox/service';

// Ambil Data
export const GET: RequestHandler = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await getInboxItems(locals.supabase, user.id));
};

// Tambah Data
export const POST: RequestHandler = async ({ request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	const { content, type } = await request.json();
	return json(await addInboxItem(locals.supabase, user.id, content, type || 'text'));
};
```

**Terapkan pola yang sama persis** untuk endpoint lainnya dengan mengambil fungsi `service.ts` yang sesuai:
* **Tasks**: `src/routes/api/tasks/+server.ts`, `[id]/+server.ts`, `[id]/subtasks/+server.ts`, `reminders/+server.ts`
* **Habits**: `src/routes/api/habits/+server.ts`, `[id]/+server.ts`
* **Notes**: `src/routes/api/notes/+server.ts`, `[id]/+server.ts`
* **Quotes**: `src/routes/api/quotes/+server.ts`, `[id]/+server.ts`

Commit dengan pesan `feat(api): buat sveltekit native api routes`.

---

## 🟢 FASE 3: Migrasi Frontend (Eden Treaty ke Native Fetch)

Buka semua file Svelte (`+page.svelte` dan `QuickCapture.svelte`) di folder Inbox, Tasks, Habits, Notes:
1. **HAPUS**: `import { api } from '$lib/eden';` dan `import { getAuthHeaders } from '$lib/utils/auth';`
2. **GANTI** pemanggilan API Eden dengan `fetch()` bawaan browser.

**Contoh Penggantian:**
```diff
// ❌ SEBELUM (Elysia Eden)
-const { data, error } = await api.api.inbox.get({ headers: getAuthHeaders() });
-if (!error) items = data || [];

// ✅ SESUDAH (Native Fetch)
+const res = await fetch('/api/inbox');
+if (res.ok) items = await res.json();
```
*(Gunakan pola yang sama untuk POST, PUT, DELETE dengan format `fetch(url, { method: '...', body: JSON.stringify(...) })`)*

3. **Ganti isi file `src/lib/utils/reminder.ts`** agar menggunakan `fetch('/api/tasks/reminders')` dan hapus logika `accessToken`.
4. **Edit `src/routes/+layout.svelte`**: Hapus referensi `accessToken` (auth sekarang fully cookie-based otomatis).
```diff
// ❌ SEBELUM
-let accessToken = $derived($page.data?.session?.access_token || '');
-if (browser && userData && accessToken) startReminders(accessToken);

// ✅ SESUDAH
+if (browser && userData) startReminders();
```

Commit dengan pesan `refactor(frontend): migrasi eden treaty ke native fetch`.

---

## 🔵 FASE 4: Hapus File Lama

Hapus folder dan file sisa ElysiaJS yang sudah tidak terpakai. **HATI-HATI: JANGAN hapus file `service.ts` atau `service.test.ts`!**

Jalankan perintah ini:
```bash
Remove-Item "src/lib/server/elysia.ts"
Remove-Item "src/lib/server/plugins" -Recurse -Force
Remove-Item "src/lib/server/features/google-sync" -Recurse -Force
Remove-Item "src/lib/eden.ts"
Remove-Item "src/lib/utils/auth.ts"
Remove-Item "src/routes/api/[...slugs]" -Recurse -Force

# Hapus route file lama dari folder features:
Remove-Item "src/lib/server/features/*/index.ts"
Remove-Item "src/lib/server/features/*/model.ts"
```

Commit dengan pesan `chore(cleanup): hapus file elysia dan google-sync`.

---

## ✅ FASE 5: Testing & Penyelesaian

1. Jalankan pengujian penuh di terminal:
   ```bash
   bun run check
   bun run lint
   bun run build
   bun run test
   ```
2. Pastikan tidak ada error. Jika aman, jalankan `bun run dev` dan tes fungsionalitas UI secara manual (Login, tambah task, dll).
3. Buat commit terakhir: `git commit -m "test: verifikasi build lint dan unit test" --allow-empty`.
4. Push ke GitHub dan buat **Pull Request**:
   ```bash
   git push origin refactor/sveltekit-native-api
   ```
