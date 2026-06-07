import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getHabits, addHabit } from '$lib/server/features/habits/service';

export const GET: RequestHandler = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await getHabits(locals.supabase, user.id));
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	const { title } = await request.json();
	return json(await addHabit(locals.supabase, user.id, title));
};
