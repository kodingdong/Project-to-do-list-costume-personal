/**
 * Google Sync Routes — ElysiaJS API endpoints untuk Sinkronisasi Google
 */

import { Elysia, t } from 'elysia';
import { authGuardPlugin } from '../../plugins/supabase';
import { createGoogleTask, createCalendarEvent } from './service';

// Untuk SvelteKit Supabase SSR, provider_token dari OAuth tersimpan
// di session.provider_token. Frontend harus mengirimkan token tersebut
// saat memanggil API ini.

export const googleSyncRoutes = new Elysia({ prefix: '/google' })
	.use(authGuardPlugin)

	// POST /api/google/tasks
	.post(
		'/tasks',
		async ({ headers, body }) => {
			const providerToken = headers['x-provider-token'];
			if (!providerToken) throw new Error('Provider token required');
			return await createGoogleTask(providerToken, body.title, body.notes);
		},
		{
			headers: t.Object({
				'x-provider-token': t.String(),
				authorization: t.Optional(t.String())
			}),
			body: t.Object({
				title: t.String({ minLength: 1 }),
				notes: t.Optional(t.String())
			})
		}
	)

	// POST /api/google/calendar
	.post(
		'/calendar',
		async ({ headers, body }) => {
			const providerToken = headers['x-provider-token'];
			if (!providerToken) throw new Error('Provider token required');
			return await createCalendarEvent(providerToken, body.title, body.datetime);
		},
		{
			headers: t.Object({
				'x-provider-token': t.String(),
				authorization: t.Optional(t.String())
			}),
			body: t.Object({
				title: t.String({ minLength: 1 }),
				datetime: t.String()
			})
		}
	);
