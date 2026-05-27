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

// Buat ElysiaJS app utama dengan prefix '/api'
const app = new Elysia({ prefix: '/api' })
	// Health check endpoint — untuk verifikasi API berjalan
	.get('/health', () => ({ status: 'OK', timestamp: new Date().toISOString() }))
	// Register feature modules
	.use(inboxRoutes)
	.use(tasksRoutes)
	.use(habitsRoutes);

// Export type untuk Eden Treaty (end-to-end type safety)
export type App = typeof app;

export { app };
