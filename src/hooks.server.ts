/**
 * SvelteKit Auth Middleware (hooks.server.ts)
 *
 * Setiap request ke server melewati file ini.
 * Di sini kita inisialisasi Supabase client dengan cookie-based session.
 *
 * GRACEFUL DEGRADATION: Jika Supabase belum dikonfigurasi (.env.local belum ada),
 * middleware akan skip auth dan tetap melayani halaman tanpa error.
 *
 * Ref: https://supabase.com/docs/guides/auth/server-side/sveltekit
 */

import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const supabaseUrl = env.PUBLIC_SUPABASE_URL || '';
	const supabaseAnonKey = env.PUBLIC_SUPABASE_ANON_KEY || '';

	// Graceful degradation — jika Supabase belum dikonfigurasi, skip auth
	if (!supabaseUrl || !supabaseAnonKey) {
		event.locals.supabase = null as unknown as typeof event.locals.supabase;
		event.locals.safeGetSession = async () => ({ session: null, user: null });
		event.locals.session = null;
		event.locals.user = null;
		return resolve(event);
	}

	// Buat Supabase server client dengan cookie management
	event.locals.supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
			}
		}
	});

	/**
	 * safeGetSession — Verifikasi session secara aman
	 * Gunakan auth.getUser() untuk verifikasi JWT di server.
	 */
	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();

		if (!session) return { session: null, user: null };

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();

		if (error) return { session: null, user: null };
		return { session, user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};
