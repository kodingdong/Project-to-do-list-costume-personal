import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getInboxItems, addInboxItem } from '$lib/server/features/inbox/service';

export const GET: RequestHandler = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await getInboxItems(locals.supabase, user.id));
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	const { content, type } = await request.json();
	return json(await addInboxItem(locals.supabase, user.id, content, type || 'text'));
};
