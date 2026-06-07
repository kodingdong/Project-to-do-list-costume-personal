import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getNotes, addNote } from '$lib/server/features/notes/service';

export const GET: RequestHandler = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await getNotes(locals.supabase, user.id));
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	const body = await request.json();
	return json(await addNote(locals.supabase, user.id, body));
};
