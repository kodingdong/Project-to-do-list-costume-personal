/**
 * ElysiaJS App — Main API server embedded in SvelteKit
 *
 * Arsitektur: SvelteKit catch-all route → ElysiaJS app.handle()
 * Semua API endpoints di-prefix dengan '/api'
 *
 * Ref: https://elysiajs.com/integrations/sveltekit.html
 */

import { Elysia } from 'elysia';
import { inboxRoutes } from './features/inbox';
import { tasksRoutes } from './features/tasks';
import { habitsRoutes } from './features/habits';
import { notesRoutes } from './features/notes';
import { quotesRoutes } from './features/quotes';
import { googleSyncRoutes } from './features/google-sync';
import { cors } from '@elysiajs/cors';
import { rateLimit } from '@elysiajs/rate-limit';

// Buat ElysiaJS app utama dengan prefix '/api'
const app = new Elysia({ prefix: '/api' })
	.use(cors())
	.use(rateLimit({ max: 100, duration: 60000 })) // 100 requests per minute
	.onError(({ code, error, set }) => {
		console.error(`[API Error] ${code}:`, error);
		const statusMap: Record<string, number> = {
			NOT_FOUND: 404,
			VALIDATION: 422,
			PARSE: 400,
			INTERNAL_SERVER_ERROR: 500
		};
		set.status = statusMap[code as string] || (typeof code === 'number' ? code : 500);
		return {
			success: false,
			error: 'Terjadi kesalahan pada server. Silakan coba lagi.'
		};
	})
	// Health check endpoint — untuk verifikasi API berjalan
	.get('/health', () => ({ status: 'OK', timestamp: new Date().toISOString() }))
	// Register feature modules
	.use(inboxRoutes)
	.use(tasksRoutes)
	.use(habitsRoutes)
	.use(notesRoutes)
	.use(quotesRoutes)
	.use(googleSyncRoutes);

// Export type untuk Eden Treaty (end-to-end type safety)
export type App = typeof app;

export { app };
