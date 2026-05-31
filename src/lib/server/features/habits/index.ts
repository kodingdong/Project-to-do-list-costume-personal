/**
 * Habits Routes — ElysiaJS API endpoints untuk Habit Tracker
 *
 * Feature-first structure: routes, service, dan model
 * tergabung dalam satu folder fitur.
 *
 * Endpoints:
 *   GET    /api/habits      → Ambil semua habits
 *   POST   /api/habits      → Tambah habit baru
 *   PUT    /api/habits/:id  → Toggle habit done today
 *   DELETE /api/habits/:id  → Hapus habit
 */

import { Elysia } from 'elysia';
import { authGuardPlugin } from '../../plugins/supabase';
import { CreateHabitSchema, ToggleHabitSchema } from './model';
import { getHabits, addHabit, toggleHabitDone, deleteHabit } from './service';

export const habitsRoutes = new Elysia({ prefix: '/habits' })
	// Semua routes memerlukan auth
	.use(authGuardPlugin)

	// GET /api/habits — Ambil semua habits user
	.get('/', async ({ db, user }) => {
		return await getHabits(db, user.id);
	})

	// POST /api/habits — Tambah habit baru
	.post(
		'/',
		async ({ db, user, body }) => {
			return await addHabit(db, user.id, body.title);
		},
		{ body: CreateHabitSchema }
	)

	// PUT /api/habits/:id — Toggle habit done today
	.put(
		'/:id',
		async ({ db, user, params: { id }, body }) => {
			return await toggleHabitDone(db, user.id, id, body.is_done_today);
		},
		{ body: ToggleHabitSchema }
	)

	// DELETE /api/habits/:id — Hapus habit
	.delete('/:id', async ({ db, user, params: { id } }) => {
		return await deleteHabit(db, user.id, id);
	});
