import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getReminders } from '$lib/server/features/tasks/service';

export const GET: RequestHandler = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await getReminders(locals.supabase, user.id));
};
