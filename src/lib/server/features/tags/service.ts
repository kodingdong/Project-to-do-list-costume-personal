import type { SupabaseClient } from '@supabase/supabase-js';

export async function getTags(db: SupabaseClient, userId: string) {
	const { data, error } = await db
		.from('tags')
		.select('*')
		.eq('user_id', userId)
		.order('name', { ascending: true });

	if (error) throw new Error(`Gagal mengambil tags: ${error.message}`);
	return data;
}

export async function addTag(db: SupabaseClient, userId: string, name: string, color: string = '#6c63ff') {
	const { data, error } = await db
		.from('tags')
		.insert({ user_id: userId, name, color })
		.select()
		.single();

	if (error) throw new Error(`Gagal menambah tag: ${error.message}`);
	return data;
}

export async function deleteTag(db: SupabaseClient, userId: string, tagId: string) {
	const { error } = await db
		.from('tags')
		.delete()
		.eq('id', tagId)
		.eq('user_id', userId);

	if (error) throw new Error(`Gagal menghapus tag: ${error.message}`);
	return { success: true };
}

export async function attachTag(db: SupabaseClient, noteId: string, tagId: string) {
	const { data, error } = await db
		.from('note_tags')
		.insert({ note_id: noteId, tag_id: tagId })
		.select()
		.single();

	if (error) throw new Error(`Gagal attach tag: ${error.message}`);
	return data;
}

export async function detachTag(db: SupabaseClient, noteId: string, tagId: string) {
	const { error } = await db
		.from('note_tags')
		.delete()
		.eq('note_id', noteId)
		.eq('tag_id', tagId);

	if (error) throw new Error(`Gagal detach tag: ${error.message}`);
	return { success: true };
}
