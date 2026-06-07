import type { SupabaseClient } from '@supabase/supabase-js';

export async function getFolders(db: SupabaseClient, userId: string) {
	const { data, error } = await db
		.from('folders')
		.select('*')
		.eq('user_id', userId)
		.order('sort_order', { ascending: true })
		.order('created_at', { ascending: true });

	if (error) throw new Error(`Gagal mengambil folders: ${error.message}`);
	return data;
}

export async function addFolder(
	db: SupabaseClient,
	userId: string,
	name: string,
	icon: string = '📁',
	paraType: 'project' | 'area' | 'resource' | 'archive',
	parentId: string | null = null
) {
	const { data, error } = await db
		.from('folders')
		.insert({
			user_id: userId,
			name,
			icon,
			para_type: paraType,
			parent_id: parentId
		})
		.select()
		.single();

	if (error) throw new Error(`Gagal menambah folder: ${error.message}`);
	return data;
}

export async function updateFolder(
	db: SupabaseClient,
	userId: string,
	folderId: string,
	updates: { name?: string; icon?: string; sort_order?: number; parent_id?: string | null }
) {
	const { data, error } = await db
		.from('folders')
		.update(updates)
		.eq('id', folderId)
		.eq('user_id', userId)
		.select()
		.single();

	if (error) throw new Error(`Gagal update folder: ${error.message}`);
	return data;
}

export async function deleteFolder(db: SupabaseClient, userId: string, folderId: string) {
	const { error } = await db
		.from('folders')
		.delete()
		.eq('id', folderId)
		.eq('user_id', userId);

	if (error) throw new Error(`Gagal menghapus folder: ${error.message}`);
	return { success: true };
}
