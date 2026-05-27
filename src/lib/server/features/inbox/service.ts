/**
 * Inbox Service — Business logic untuk Emergency Inbox
 *
 * Semua operasi database untuk fitur inbox ada di sini.
 * Service layer dipisah dari routes agar mudah di-test dan reusable.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Ambil semua inbox items milik user (terbaru di atas)
 */
export async function getInboxItems(db: SupabaseClient, userId: string) {
	const { data, error } = await db
		.from('inbox')
		.select('*')
		.eq('user_id', userId)
		.order('created_at', { ascending: false });

	if (error) throw new Error(`Gagal mengambil inbox: ${error.message}`);
	return data;
}

/**
 * Tambah inbox item baru
 */
export async function addInboxItem(
	db: SupabaseClient,
	userId: string,
	content: string,
	type: string = 'text'
) {
	const { data, error } = await db
		.from('inbox')
		.insert({ user_id: userId, content, type })
		.select()
		.single();

	if (error) throw new Error(`Gagal menambah inbox item: ${error.message}`);
	return data;
}

/**
 * Hapus inbox item berdasarkan ID (hanya milik user sendiri)
 */
export async function deleteInboxItem(db: SupabaseClient, userId: string, id: string) {
	const { error } = await db.from('inbox').delete().eq('id', id).eq('user_id', userId);

	if (error) throw new Error(`Gagal menghapus inbox item: ${error.message}`);
	return { success: true };
}
