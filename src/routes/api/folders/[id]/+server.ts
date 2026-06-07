import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { updateFolder, deleteFolder } from '$lib/server/features/folders/service';

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	const updates = await request.json();
	return json(await updateFolder(locals.supabase, user.id, params.id, updates));
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await deleteFolder(locals.supabase, user.id, params.id));
};
