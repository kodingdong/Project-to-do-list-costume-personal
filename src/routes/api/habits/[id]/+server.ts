import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { toggleHabitDone, deleteHabit } from '$lib/server/features/habits/service';

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	const { is_done_today } = await request.json();
	return json(await toggleHabitDone(locals.supabase, user.id, params.id, is_done_today));
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await deleteHabit(locals.supabase, user.id, params.id));
};
