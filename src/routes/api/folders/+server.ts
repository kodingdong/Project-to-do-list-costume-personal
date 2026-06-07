import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getFolders, addFolder } from '$lib/server/features/folders/service';

export const GET: RequestHandler = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await getFolders(locals.supabase, user.id));
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	const { name, icon, para_type, parent_id } = await request.json();
	return json(await addFolder(locals.supabase, user.id, name, icon, para_type, parent_id));
};
