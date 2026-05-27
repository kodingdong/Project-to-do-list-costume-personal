/**
 * Notes Model — TypeBox schemas untuk validasi
 */

import { t } from 'elysia';

// Schema untuk membuat note baru
export const CreateNoteSchema = t.Object({
	title: t.String({ minLength: 1, maxLength: 500 }),
	body: t.Optional(t.Any()) // JSONB field
});

// Schema untuk update note
export const UpdateNoteSchema = t.Object({
	title: t.Optional(t.String({ minLength: 1, maxLength: 500 })),
	body: t.Optional(t.Any()) // JSONB field
});
