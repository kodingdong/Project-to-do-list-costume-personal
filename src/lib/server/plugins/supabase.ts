/**
 * Supabase Plugin untuk ElysiaJS
 *
 * Plugin ini menggunakan .derive() untuk menambahkan Supabase client
 * ke context setiap request. Membaca token dari Authorization header,
 * lalu verifikasi via supabase.auth.getUser(token).
 *
 * Ref: https://elysiajs.com/essential/life-cycle.html
 */

import { Elysia } from 'elysia';
import { createClient } from '@supabase/supabase-js';

// Environment variables — diambil saat runtime
const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Plugin Supabase (tanpa auth wajib)
 * Menambahkan db (service role client) ke context.
 * Cocok untuk endpoint publik yang tidak butuh auth.
 */
export const supabasePlugin = new Elysia({ name: 'supabase' }).derive(({ headers }) => {
	// Service role client — untuk operasi yang memerlukan bypass RLS
	const adminDb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

	// User-scoped client — untuk operasi yang mengikuti RLS
	const token = headers['authorization']?.replace('Bearer ', '');
	const userDb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
		global: {
			headers: token ? { Authorization: `Bearer ${token}` } : {}
		}
	});

	return { db: userDb, adminDb };
});

/**
 * Plugin Auth Guard — verifikasi user wajib login
 * Menambahkan { db, user } ke context. Error 401 jika tidak terautentikasi.
 */
export const authGuardPlugin = new Elysia({ name: 'auth-guard' }).derive(
	async ({ headers, error }) => {
		const token = headers['authorization']?.replace('Bearer ', '');

		if (!token) {
			throw error(401, 'Unauthorized: Token tidak ditemukan');
		}

		// Buat client dengan token user
		const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
			global: {
				headers: { Authorization: `Bearer ${token}` }
			}
		});

		// Verifikasi token via getUser() — lebih aman daripada getSession()
		const {
			data: { user },
			error: authError
		} = await supabase.auth.getUser(token);

		if (authError || !user) {
			throw error(401, 'Unauthorized: Token tidak valid');
		}

		return { db: supabase, user };
	}
);
