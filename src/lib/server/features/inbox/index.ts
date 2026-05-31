/**
 * Inbox Routes — ElysiaJS API endpoints untuk Emergency Inbox
 *
 * Feature-first structure: routes, service, dan model
 * tergabung dalam satu folder fitur.
 *
 * Endpoints:
 *   GET    /api/inbox     → Ambil semua inbox items
 *   POST   /api/inbox     → Tambah inbox item baru
 *   DELETE /api/inbox/:id → Hapus inbox item
 */

import { Elysia } from 'elysia';
import { authGuardPlugin } from '../../plugins/supabase';
import { CreateInboxItemSchema } from './model';
import { getInboxItems, addInboxItem, deleteInboxItem } from './service';

export const inboxRoutes = new Elysia({ prefix: '/inbox' })
	// Semua routes di bawah ini memerlukan auth
	.use(authGuardPlugin)

	// GET /api/inbox — Ambil semua inbox items user
	.get('/', async ({ db, user }) => {
		return await getInboxItems(db, user.id);
	})

	// POST /api/inbox — Tambah inbox item baru
	.post(
		'/',
		async ({ db, user, body }) => {
			return await addInboxItem(db, user.id, body.content, body.type || 'text');
		},
		{ body: CreateInboxItemSchema }
	)

	// DELETE /api/inbox/:id — Hapus inbox item
	.delete('/:id', async ({ db, user, params: { id } }) => {
		return await deleteInboxItem(db, user.id, id);
	});
