import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchNotes } from '$lib/server/features/search/service';

export const GET: RequestHandler = async ({ url, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');

	const q = url.searchParams.get('q');
	const folder = url.searchParams.get('folder');
	const tagsParam = url.searchParams.get('tags');
	const tags = tagsParam ? tagsParam.split(',') : null;

	return json(await searchNotes(locals.supabase, user.id, q, tags, folder));
};
