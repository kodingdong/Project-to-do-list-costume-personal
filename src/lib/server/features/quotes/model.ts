/**
 * Quotes Model — TypeBox schemas
 */

import { t } from 'elysia';

export const CreateQuoteSchema = t.Object({
	content: t.String({ minLength: 1, maxLength: 1000 }),
	category: t.Optional(
		t.Union([
			t.Literal('finansial'),
			t.Literal('coding'),
			t.Literal('motivasi'),
			t.Literal('public speaking'),
			t.Literal('bahasa inggris')
		])
	)
});
