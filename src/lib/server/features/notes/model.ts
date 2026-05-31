/**
 * Notes Model — TypeBox schemas untuk validasi
 */

import { t } from 'elysia';

// Schema dasar untuk struktur TipTap JSON
const TipTapNodeSchema = t.Object(
	{
		type: t.Optional(t.String()),
		content: t.Optional(t.Array(t.Any()))
	},
	{ additionalProperties: true }
);

// Schema untuk membuat note baru
export const CreateNoteSchema = t.Object({
	title: t.String({ minLength: 1, maxLength: 500 }),
	body: t.Optional(TipTapNodeSchema) // JSONB field
});

// Schema untuk update note
export const UpdateNoteSchema = t.Object({
	title: t.Optional(t.String({ minLength: 1, maxLength: 500 })),
	body: t.Optional(TipTapNodeSchema) // JSONB field
});
