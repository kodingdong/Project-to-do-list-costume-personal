/**
 * Tasks Service — Business logic untuk Smart To-Do List
 *
 * Semua operasi database untuk fitur tasks & sub-tasks ada di sini.
 * Service layer dipisah dari routes agar mudah di-test dan reusable.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

// ============================================================
// TASKS
// ============================================================

/**
 * Ambil semua tasks milik user (terbaru di atas), termasuk sub-tasks
 */
export async function getTasks(db: SupabaseClient, userId: string) {
	const { data, error } = await db
		.from('tasks')
		.select('*, sub_tasks(*)')
		.eq('user_id', userId)
		.order('created_at', { ascending: false });

	if (error) throw new Error(`Gagal mengambil tasks: ${error.message}`);
	return data;
}

/**
 * Tambah task baru
 */
export async function addTask(
	db: SupabaseClient,
	userId: string,
	title: string,
	context: string = '@Online',
	energyLevel: string = 'sedang',
	reminderAt: string | null = null
) {
	const { data, error } = await db
		.from('tasks')
		.insert({
			user_id: userId,
			title,
			context,
			energy_level: energyLevel,
			reminder_at: reminderAt
		})
		.select()
		.single();

	if (error) throw new Error(`Gagal menambah task: ${error.message}`);
	return data;
}

/**
 * Update task (title, context, energy_level, is_completed, reminder_at)
 */
export async function updateTask(
	db: SupabaseClient,
	userId: string,
	taskId: string,
	updates: Record<string, unknown>
) {
	const { data, error } = await db
		.from('tasks')
		.update(updates)
		.eq('id', taskId)
		.eq('user_id', userId)
		.select()
		.single();

	if (error) throw new Error(`Gagal mengupdate task: ${error.message}`);
	return data;
}

/**
 * Hapus task (cascade ke sub-tasks)
 */
export async function deleteTask(db: SupabaseClient, userId: string, taskId: string) {
	const { error } = await db.from('tasks').delete().eq('id', taskId).eq('user_id', userId);

	if (error) throw new Error(`Gagal menghapus task: ${error.message}`);
	return { success: true };
}

// ============================================================
// SUB-TASKS
// ============================================================

/**
 * Ambil sub-tasks untuk task tertentu
 */
export async function getSubTasks(db: SupabaseClient, taskId: string) {
	const { data, error } = await db.from('sub_tasks').select('*').eq('task_id', taskId);

	if (error) throw new Error(`Gagal mengambil sub-tasks: ${error.message}`);
	return data;
}

/**
 * Tambah sub-task baru
 */
export async function addSubTask(db: SupabaseClient, taskId: string, title: string) {
	const { data, error } = await db
		.from('sub_tasks')
		.insert({ task_id: taskId, title })
		.select()
		.single();

	if (error) throw new Error(`Gagal menambah sub-task: ${error.message}`);
	return data;
}

/**
 * Toggle status sub-task (completed/uncompleted)
 */
export async function toggleSubTask(db: SupabaseClient, subTaskId: string, isCompleted: boolean) {
	const { data, error } = await db
		.from('sub_tasks')
		.update({ is_completed: isCompleted })
		.eq('id', subTaskId)
		.select()
		.single();

	if (error) throw new Error(`Gagal toggle sub-task: ${error.message}`);
	return data;
}

/**
 * Hapus sub-task
 */
export async function deleteSubTask(db: SupabaseClient, subTaskId: string) {
	const { error } = await db.from('sub_tasks').delete().eq('id', subTaskId);

	if (error) throw new Error(`Gagal menghapus sub-task: ${error.message}`);
	return { success: true };
}
