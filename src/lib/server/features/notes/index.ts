/**
 * Notes Routes — ElysiaJS API endpoints untuk Notes
 *
 * Endpoints:
 *   GET    /api/notes      → Ambil semua notes
 *   POST   /api/notes      → Tambah note baru
 *   PUT    /api/notes/:id  → Update note
 *   DELETE /api/notes/:id  → Hapus note
 */

import { Elysia } from 'elysia';
import { authGuardPlugin } from '../../plugins/supabase';
import { CreateNoteSchema, UpdateNoteSchema } from './model';
import { getNotes, addNote, updateNote, deleteNote } from './service';

export const notesRoutes = new Elysia({ prefix: '/notes' })
	.use(authGuardPlugin)

	// GET /api/notes
	.get('/', async ({ db, user }) => {
		return await getNotes(db, user.id);
	})

	// POST /api/notes
	.post(
		'/',
		async ({ db, user, body }) => {
			return await addNote(db, user.id, body.title, body.body);
		},
		{ body: CreateNoteSchema }
	)

	// PUT /api/notes/:id
	.put(
		'/:id',
		async ({ db, user, params: { id }, body }) => {
			return await updateNote(db, user.id, id, body);
		},
		{ body: UpdateNoteSchema }
	)

	// DELETE /api/notes/:id
	.delete('/:id', async ({ db, user, params: { id } }) => {
		return await deleteNote(db, user.id, id);
	});
