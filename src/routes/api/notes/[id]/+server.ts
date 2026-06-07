import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { updateNote, deleteNote } from '$lib/server/features/notes/service';

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	const body = await request.json();
	return json(await updateNote(locals.supabase, user.id, params.id, body));
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await deleteNote(locals.supabase, user.id, params.id));
};
