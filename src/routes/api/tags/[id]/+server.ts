import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteTag } from '$lib/server/features/tags/service';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await deleteTag(locals.supabase, user.id, params.id));
};
