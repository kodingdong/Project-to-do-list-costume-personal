/**
 * Quotes Routes — ElysiaJS API endpoints untuk Quotes
 */

import { Elysia } from 'elysia';
import { authGuardPlugin } from '../../plugins/supabase';
import { CreateQuoteSchema } from './model';
import { getQuotes, addQuote, deleteQuote } from './service';

export const quotesRoutes = new Elysia({ prefix: '/quotes' })
	.use(authGuardPlugin)

	// GET /api/quotes
	.get('/', async ({ db, user }) => {
		return await getQuotes(db, user.id);
	})

	// POST /api/quotes
	.post(
		'/',
		async ({ db, user, body }) => {
			return await addQuote(db, user.id, body.content, body.category || null);
		},
		{ body: CreateQuoteSchema }
	)

	// DELETE /api/quotes/:id
	.delete('/:id', async ({ db, user, params: { id } }) => {
		return await deleteQuote(db, user.id, id);
	});
