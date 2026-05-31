/**
 * Habits Model — TypeBox schemas untuk validasi
 *
 * TypeBox digunakan oleh ElysiaJS untuk validasi request body
 * dan response secara otomatis dengan type inference.
 */

import { t } from 'elysia';

// Schema untuk membuat habit baru
export const CreateHabitSchema = t.Object({
	title: t.String({ minLength: 1, maxLength: 300 })
});

// Schema untuk toggle habit done today
export const ToggleHabitSchema = t.Object({
	is_done_today: t.Boolean()
});
