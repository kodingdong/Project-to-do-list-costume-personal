/**
 * Habits Service — Business logic untuk Habit Tracker
 *
 * Semua operasi database untuk fitur habits ada di sini.
 * Streak management ditangani oleh PostgreSQL trigger (handle_habit_streak).
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Ambil semua habits milik user
 */
export async function getHabits(db: SupabaseClient, userId: string) {
	const { data, error } = await db
		.from('habits')
		.select('*')
		.eq('user_id', userId)
		.order('created_at', { ascending: true });

	if (error) throw new Error(`Gagal mengambil habits: ${error.message}`);
	return data;
}

/**
 * Tambah habit baru
 */
export async function addHabit(db: SupabaseClient, userId: string, title: string) {
	const { data, error } = await db
		.from('habits')
		.insert({ user_id: userId, title })
		.select()
		.single();

	if (error) throw new Error(`Gagal menambah habit: ${error.message}`);
	return data;
}

/**
 * Toggle habit done/undone hari ini
 * Streak dikelola oleh trigger PostgreSQL secara otomatis
 */
export async function toggleHabitDone(
	db: SupabaseClient,
	userId: string,
	habitId: string,
	isDoneToday: boolean
) {
	const { data, error } = await db
		.from('habits')
		.update({ is_done_today: isDoneToday })
		.eq('id', habitId)
		.eq('user_id', userId)
		.select()
		.single();

	if (error) throw new Error(`Gagal toggle habit: ${error.message}`);
	return data;
}

/**
 * Hapus habit
 */
export async function deleteHabit(db: SupabaseClient, userId: string, habitId: string) {
	const { error } = await db.from('habits').delete().eq('id', habitId).eq('user_id', userId);

	if (error) throw new Error(`Gagal menghapus habit: ${error.message}`);
	return { success: true };
}
