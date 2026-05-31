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
		async ({ body }) => {
			const { provider_token, title, notes } = body;
			if (!provider_token) throw new Error('Provider token required');
			return await createGoogleTask(provider_token, title, notes);
		},
		{
			body: t.Object({
				provider_token: t.String(),
				title: t.String({ minLength: 1 }),
				notes: t.Optional(t.String())
			})
		}
	)

	// POST /api/google/calendar
	.post(
		'/calendar',
		async ({ body }) => {
			const { provider_token, title, datetime } = body;
			if (!provider_token) throw new Error('Provider token required');
			return await createCalendarEvent(provider_token, title, datetime);
		},
		{
			body: t.Object({
				provider_token: t.String(),
				title: t.String({ minLength: 1 }),
				datetime: t.String()
			})
		}
	);
