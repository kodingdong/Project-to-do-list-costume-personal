import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTags, addTag } from '$lib/server/features/tags/service';

export const GET: RequestHandler = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await getTags(locals.supabase, user.id));
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	const { name, color } = await request.json();
	return json(await addTag(locals.supabase, user.id, name, color));
};
