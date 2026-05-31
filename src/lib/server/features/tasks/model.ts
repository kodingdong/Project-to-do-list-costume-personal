/**
 * Tasks Model — TypeBox schemas untuk validasi
 *
 * TypeBox digunakan oleh ElysiaJS untuk validasi request body
 * dan response secara otomatis dengan type inference.
 */

import { t } from 'elysia';

// Schema untuk membuat task baru
export const CreateTaskSchema = t.Object({
	title: t.String({ minLength: 1, maxLength: 500 }),
	context: t.Optional(
		t.Union([
			t.Literal('@Online'),
			t.Literal('@Rumah'),
			t.Literal('@DeepWork'),
			t.Literal('@Kantor'),
			t.Literal('@Errand')
		])
	),
	energy_level: t.Optional(
		t.Union([t.Literal('tinggi'), t.Literal('sedang'), t.Literal('rendah')])
	),
	reminder_at: t.Optional(t.Union([t.String(), t.Null()]))
});

// Schema untuk update task
export const UpdateTaskSchema = t.Object({
	title: t.Optional(t.String({ minLength: 1, maxLength: 500 })),
	context: t.Optional(
		t.Union([
			t.Literal('@Online'),
			t.Literal('@Rumah'),
			t.Literal('@DeepWork'),
			t.Literal('@Kantor'),
			t.Literal('@Errand')
		])
	),
	energy_level: t.Optional(
		t.Union([t.Literal('tinggi'), t.Literal('sedang'), t.Literal('rendah')])
	),
	is_completed: t.Optional(t.Boolean()),
	reminder_at: t.Optional(t.Union([t.String(), t.Null()]))
});

// Schema untuk membuat sub-task
export const CreateSubTaskSchema = t.Object({
	title: t.String({ minLength: 1, maxLength: 500 })
});

// Schema untuk toggle sub-task
export const ToggleSubTaskSchema = t.Object({
	is_completed: t.Boolean()
});
