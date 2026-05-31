/**
 * Tasks Routes — ElysiaJS API endpoints untuk Smart To-Do List
 *
 * Feature-first structure: routes, service, dan model
 * tergabung dalam satu folder fitur.
 *
 * Endpoints:
 *   GET    /api/tasks              → Ambil semua tasks + sub-tasks
 *   POST   /api/tasks              → Tambah task baru
 *   PUT    /api/tasks/:id          → Update task
 *   DELETE /api/tasks/:id          → Hapus task
 *   GET    /api/tasks/:id/subtasks → Ambil sub-tasks
 *   POST   /api/tasks/:id/subtasks → Tambah sub-task
 *   PUT    /api/tasks/subtasks/:id → Toggle sub-task
 *   DELETE /api/tasks/subtasks/:id → Hapus sub-task
 */

import { Elysia } from 'elysia';
import { authGuardPlugin } from '../../plugins/supabase';
import {
	CreateTaskSchema,
	UpdateTaskSchema,
	CreateSubTaskSchema,
	ToggleSubTaskSchema
} from './model';
import {
	getTasks,
	addTask,
	updateTask,
	deleteTask,
	getSubTasks,
	addSubTask,
	toggleSubTask,
	deleteSubTask,
	getReminders
} from './service';

export const tasksRoutes = new Elysia({ prefix: '/tasks' })
	// Semua routes memerlukan auth
	.use(authGuardPlugin)

	// GET /api/tasks — Ambil semua tasks user (termasuk sub-tasks)
	.get('/', async ({ db, user }) => {
		return await getTasks(db, user.id);
	})

	// POST /api/tasks — Tambah task baru
	.post(
		'/',
		async ({ db, user, body }) => {
			return await addTask(
				db,
				user.id,
				body.title,
				body.context || '@Online',
				body.energy_level || 'sedang',
				body.reminder_at || null
			);
		},
		{ body: CreateTaskSchema }
	)

	// GET /api/tasks/reminders — Ambil reminders
	.get('/reminders', async ({ db, user }) => {
		return await getReminders(db, user.id);
	})

	// PUT /api/tasks/:id — Update task
	.put(
		'/:id',
		async ({ db, user, params: { id }, body }) => {
			return await updateTask(db, user.id, id, body);
		},
		{ body: UpdateTaskSchema }
	)

	// DELETE /api/tasks/:id — Hapus task
	.delete('/:id', async ({ db, user, params: { id } }) => {
		return await deleteTask(db, user.id, id);
	})

	// GET /api/tasks/:id/subtasks — Ambil sub-tasks
	.get('/:id/subtasks', async ({ db, params: { id } }) => {
		return await getSubTasks(db, id);
	})

	// POST /api/tasks/:id/subtasks — Tambah sub-task
	.post(
		'/:id/subtasks',
		async ({ db, params: { id }, body }) => {
			return await addSubTask(db, id, body.title);
		},
		{ body: CreateSubTaskSchema }
	)

	// PUT /api/tasks/subtasks/:id — Toggle sub-task
	.put(
		'/subtasks/:id',
		async ({ db, params: { id }, body }) => {
			return await toggleSubTask(db, id, body.is_completed);
		},
		{ body: ToggleSubTaskSchema }
	)

	// DELETE /api/tasks/subtasks/:id — Hapus sub-task
	.delete('/subtasks/:id', async ({ db, params: { id } }) => {
		return await deleteSubTask(db, id);
	});
