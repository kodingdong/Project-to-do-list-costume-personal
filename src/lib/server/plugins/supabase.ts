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
import { env } from '$env/dynamic/public';

// Environment variables — diambil saat runtime dari $env/dynamic/public
const SUPABASE_URL = env.PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = env.PUBLIC_SUPABASE_ANON_KEY || '';

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
