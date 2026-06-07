import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTasks, addTask } from '$lib/server/features/tasks/service';

export const GET: RequestHandler = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await getTasks(locals.supabase, user.id));
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	const body = await request.json();
	return json(await addTask(locals.supabase, user.id, body));
};
