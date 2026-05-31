/**
 * Layout Client Load — Membuat Supabase browser client
 *
 * GRACEFUL DEGRADATION: Jika env vars belum diset, skip Supabase client.
 *
 * Ref: https://supabase.com/docs/guides/auth/server-side/sveltekit
 */

import { createBrowserClient, isBrowser, parse } from '@supabase/ssr';
import type { LayoutLoad } from './$types';

const PUBLIC_SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL || '';
const PUBLIC_SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
	depends('supabase:auth');

	// Graceful degradation — jika belum dikonfigurasi
	if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
		return { supabase: null, session: null, user: null };
	}

	const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: { fetch },
		cookies: {
			get(key) {
				if (!isBrowser()) return JSON.stringify(data.session);
				const cookie = parse(document.cookie);
				return cookie[key];
			}
		}
	});

	const {
		data: { session }
	} = await supabase.auth.getSession();

	const {
		data: { user }
	} = await supabase.auth.getUser();

	return { supabase, session, user };
};
