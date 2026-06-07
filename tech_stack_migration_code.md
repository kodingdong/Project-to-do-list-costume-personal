# 📝 Kode Referensi: Tech Stack Migration

> File ini berisi kode lengkap untuk setiap file baru di Fase 2.
> Copy-paste langsung ke file yang sesuai.

---

## FASE 2 — Kode untuk Setiap API Route

### 1. `src/routes/api/health/+server.ts`

```typescript
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return json({ status: 'OK', timestamp: new Date().toISOString() });
};
```

### 2. `src/routes/api/inbox/+server.ts`

```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getInboxItems, addInboxItem } from '$lib/server/features/inbox/service';

export const GET: RequestHandler = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await getInboxItems(locals.supabase, user.id));
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	const { content, type } = await request.json();
	if (!content || typeof content !== 'string' || content.trim().length === 0) {
		throw error(422, 'Content wajib diisi');
	}
	return json(await addInboxItem(locals.supabase, user.id, content.trim(), type || 'text'));
};
```

### 3. `src/routes/api/inbox/[id]/+server.ts`

```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteInboxItem } from '$lib/server/features/inbox/service';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await deleteInboxItem(locals.supabase, user.id, params.id));
};
```

### 4. `src/routes/api/tasks/+server.ts`

```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTasks, addTask } from '$lib/server/features/tasks/service';

export const GET: RequestHandler = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await getTasks(locals.supabase, user.id));
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	const { title, context, energy_level, reminder_at } = await request.json();
	if (!title || typeof title !== 'string' || title.trim().length === 0) {
		throw error(422, 'Title wajib diisi');
	}
	return json(await addTask(locals.supabase, user.id, title.trim(), context, energy_level, reminder_at));
};
```

### 5. `src/routes/api/tasks/[id]/+server.ts`

```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { updateTask, deleteTask } from '$lib/server/features/tasks/service';

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	const updates = await request.json();
	return json(await updateTask(locals.supabase, user.id, params.id, updates));
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await deleteTask(locals.supabase, user.id, params.id));
};
```

### 6. `src/routes/api/tasks/[id]/subtasks/+server.ts`

```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSubTasks, addSubTask } from '$lib/server/features/tasks/service';

export const GET: RequestHandler = async ({ params, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await getSubTasks(locals.supabase, params.id));
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	const { title } = await request.json();
	if (!title || typeof title !== 'string' || title.trim().length === 0) {
		throw error(422, 'Title wajib diisi');
	}
	return json(await addSubTask(locals.supabase, params.id, title.trim()));
};
```

### 7. `src/routes/api/tasks/subtasks/[id]/+server.ts`

```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { toggleSubTask, deleteSubTask } from '$lib/server/features/tasks/service';

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	const { is_completed } = await request.json();
	return json(await toggleSubTask(locals.supabase, params.id, is_completed));
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await deleteSubTask(locals.supabase, params.id));
};
```

### 8. `src/routes/api/tasks/reminders/+server.ts`

```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getReminders } from '$lib/server/features/tasks/service';

export const GET: RequestHandler = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await getReminders(locals.supabase, user.id));
};
```

### 9. `src/routes/api/habits/+server.ts`

```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getHabits, addHabit } from '$lib/server/features/habits/service';

export const GET: RequestHandler = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await getHabits(locals.supabase, user.id));
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	const { title } = await request.json();
	if (!title || typeof title !== 'string' || title.trim().length === 0) {
		throw error(422, 'Title wajib diisi');
	}
	return json(await addHabit(locals.supabase, user.id, title.trim()));
};
```

### 10. `src/routes/api/habits/[id]/+server.ts`

```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { toggleHabitDone, deleteHabit } from '$lib/server/features/habits/service';

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	const { is_done_today } = await request.json();
	return json(await toggleHabitDone(locals.supabase, user.id, params.id, is_done_today));
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await deleteHabit(locals.supabase, user.id, params.id));
};
```

### 11. `src/routes/api/notes/+server.ts`

```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getNotes, addNote } from '$lib/server/features/notes/service';

export const GET: RequestHandler = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await getNotes(locals.supabase, user.id));
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	const { title, body } = await request.json();
	if (!title || typeof title !== 'string' || title.trim().length === 0) {
		throw error(422, 'Title wajib diisi');
	}
	return json(await addNote(locals.supabase, user.id, title.trim(), body || {}));
};
```

### 12. `src/routes/api/notes/[id]/+server.ts`

```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { updateNote, deleteNote } from '$lib/server/features/notes/service';

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	const updates = await request.json();
	return json(await updateNote(locals.supabase, user.id, params.id, updates));
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await deleteNote(locals.supabase, user.id, params.id));
};
```

### 13. `src/routes/api/quotes/+server.ts`

```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getQuotes, addQuote } from '$lib/server/features/quotes/service';

export const GET: RequestHandler = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await getQuotes(locals.supabase, user.id));
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	const { content, category } = await request.json();
	if (!content || typeof content !== 'string' || content.trim().length === 0) {
		throw error(422, 'Content wajib diisi');
	}
	return json(await addQuote(locals.supabase, user.id, content.trim(), category || null));
};
```

### 14. `src/routes/api/quotes/[id]/+server.ts`

```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteQuote } from '$lib/server/features/quotes/service';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await deleteQuote(locals.supabase, user.id, params.id));
};
```

---

## FASE 3 — Kode Pengganti untuk `src/lib/utils/reminder.ts`

Ganti SELURUH isi file dengan:

```typescript
/**
 * Reminder Utility — Sistem pengingat tugas via Browser Notification API
 *
 * Fitur:
 * - Polling setiap 60 detik untuk cek tasks dengan reminder
 * - Notifikasi browser saat waktu reminder tiba (selisih < 5 menit)
 * - Mencegah duplikat notifikasi untuk task yang sama
 * - Handle permission request dan tab visibility
 */

const notifiedTaskIds = new Map<string, number>();
let intervalId: ReturnType<typeof setInterval> | null = null;

interface TaskWithReminder {
	id: string;
	title: string;
	context?: string;
	is_completed: boolean;
	reminder_at: string | null;
}

async function requestNotificationPermission(): Promise<boolean> {
	if (!('Notification' in window)) return false;
	if (Notification.permission === 'granted') return true;
	if (Notification.permission === 'denied') return false;
	const permission = await Notification.requestPermission();
	return permission === 'granted';
}

function showNotification(title: string, body: string) {
	if (Notification.permission !== 'granted') return;
	const notification = new Notification(title, {
		body,
		icon: '⏰',
		badge: '⚡',
		tag: `flowdo-reminder-${title}`,
		requireInteraction: true
	});
	setTimeout(() => notification.close(), 30000);
}

async function checkReminders() {
	try {
		const res = await fetch('/api/tasks/reminders');
		if (!res.ok) return;
		const data: TaskWithReminder[] = await res.json();

		const now = Date.now();
		const FIVE_MINUTES = 5 * 60 * 1000;

		for (const [taskId, time] of notifiedTaskIds.entries()) {
			if (now - time > 60 * 60 * 1000) notifiedTaskIds.delete(taskId);
		}

		for (const task of data) {
			if (!task.reminder_at || task.is_completed || notifiedTaskIds.has(task.id)) continue;
			const reminderTime = new Date(task.reminder_at).getTime();
			const diff = reminderTime - now;
			if (diff <= FIVE_MINUTES && diff >= -FIVE_MINUTES) {
				showNotification('⏰ Pengingat Task', `${task.title}\n${task.context || ''}`);
				notifiedTaskIds.set(task.id, now);
			}
		}
	} catch {
		// Silently fail — jaringan bisa offline
	}
}

export function startReminders() {
	stopReminders();
	requestNotificationPermission();
	checkReminders();
	intervalId = setInterval(() => checkReminders(), 60000);
}

export function stopReminders() {
	if (intervalId) {
		clearInterval(intervalId);
		intervalId = null;
	}
}

export function clearNotifiedTask(taskId: string) {
	notifiedTaskIds.delete(taskId);
}
```
