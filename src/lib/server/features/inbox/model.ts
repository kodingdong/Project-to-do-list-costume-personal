/**
 * Inbox Model — TypeBox schemas untuk validasi
 *
 * TypeBox digunakan oleh ElysiaJS untuk validasi request body
 * dan response secara otomatis dengan type inference.
 */

import { t } from 'elysia';

// Schema untuk membuat inbox item baru
export const CreateInboxItemSchema = t.Object({
	content: t.String({ minLength: 1, maxLength: 2000 }),
	type: t.Optional(t.Union([t.Literal('text'), t.Literal('audio')]))
});

// Schema untuk inbox item dari database
export const InboxItemSchema = t.Object({
	id: t.String(),
	user_id: t.String(),
	content: t.String(),
	type: t.String(),
	created_at: t.String()
});
