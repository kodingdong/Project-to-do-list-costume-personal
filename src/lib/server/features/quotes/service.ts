/**
 * Quotes Service — Business logic untuk Quotes
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export async function getQuotes(db: SupabaseClient, userId: string) {
	const { data, error } = await db
		.from('quotes')
		.select('*')
		.eq('user_id', userId)
		.order('created_at', { ascending: false });

	if (error) throw new Error(`Gagal mengambil quotes: ${error.message}`);
	return data;
}

export async function addQuote(
	db: SupabaseClient,
	userId: string,
	content: string,
	category: string | null = null
) {
	const { data, error } = await db
		.from('quotes')
		.insert({ user_id: userId, content, category })
		.select()
		.single();

	if (error) throw new Error(`Gagal menambah quote: ${error.message}`);
	return data;
}

export async function deleteQuote(db: SupabaseClient, userId: string, quoteId: string) {
	const { error } = await db.from('quotes').delete().eq('id', quoteId).eq('user_id', userId);

	if (error) throw new Error(`Gagal menghapus quote: ${error.message}`);
	return { success: true };
}
