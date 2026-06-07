import type { SupabaseClient } from '@supabase/supabase-js';

export async function searchNotes(
	db: SupabaseClient,
	userId: string,
	query?: string | null,
	tags?: string[] | null,
	folderId?: string | null
) {
	let dbQuery = db
		.from('notes')
		.select('*, note_tags!inner(tag_id), folders(name)')
		.eq('user_id', userId);

	if (folderId) {
		dbQuery = dbQuery.eq('folder_id', folderId);
	}

	if (tags && tags.length > 0) {
		dbQuery = dbQuery.in('note_tags.tag_id', tags);
	}

	if (query) {
		// Coba FTS
		dbQuery = dbQuery.textSearch('fts', query, {
			type: 'websearch',
			config: 'indonesian'
		});
	}

	const { data, error } = await dbQuery.order('updated_at', { ascending: false });

	if (error) {
		// Jika FTS gagal (mungkin index belum digenerate, gunakan fallback ILIKE)
		if (query) {
			let fallbackQuery = db
				.from('notes')
				.select('*, note_tags!inner(tag_id), folders(name)')
				.eq('user_id', userId)
				.ilike('title', `%${query}%`);
			
			if (folderId) fallbackQuery = fallbackQuery.eq('folder_id', folderId);
			if (tags && tags.length > 0) fallbackQuery = fallbackQuery.in('note_tags.tag_id', tags);

			const fallback = await fallbackQuery.order('updated_at', { ascending: false });
			if (fallback.error) throw new Error(`Fallback search failed: ${fallback.error.message}`);
			return fallback.data;
		}
		throw new Error(`Search failed: ${error.message}`);
	}

	return data;
}
