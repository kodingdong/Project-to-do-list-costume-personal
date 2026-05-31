/**
 * Notes Service — Business logic untuk Notes
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Ambil semua notes milik user
 */
export async function getNotes(db: SupabaseClient, userId: string) {
	const { data, error } = await db
		.from('notes')
		.select('*')
		.eq('user_id', userId)
		.order('updated_at', { ascending: false });

	if (error) throw new Error(`Gagal mengambil notes: ${error.message}`);
	return data;
}

/**
 * Tambah note baru
 */
export async function addNote(
	db: SupabaseClient,
	userId: string,
	title: string,
	body: unknown = {}
) {
	const { data, error } = await db
		.from('notes')
		.insert({ user_id: userId, title, body })
		.select()
		.single();

	if (error) throw new Error(`Gagal menambah note: ${error.message}`);
	return data;
}

/**
 * Update note
 */
export async function updateNote(
	db: SupabaseClient,
	userId: string,
	noteId: string,
	updates: Record<string, unknown>
) {
	const { data, error } = await db
		.from('notes')
		.update(updates)
		.eq('id', noteId)
		.eq('user_id', userId)
		.select()
		.single();

	if (error) throw new Error(`Gagal mengupdate note: ${error.message}`);
	return data;
}

/**
 * Hapus note
 */
export async function deleteNote(db: SupabaseClient, userId: string, noteId: string) {
	const { error } = await db.from('notes').delete().eq('id', noteId).eq('user_id', userId);

	if (error) throw new Error(`Gagal menghapus note: ${error.message}`);
	return { success: true };
}
