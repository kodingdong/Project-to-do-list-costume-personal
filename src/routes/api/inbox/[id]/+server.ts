import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteInboxItem } from '$lib/server/features/inbox/service';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await deleteInboxItem(locals.supabase, user.id, params.id));
};
