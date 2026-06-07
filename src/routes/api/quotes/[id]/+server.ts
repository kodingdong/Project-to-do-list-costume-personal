import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteQuote } from '$lib/server/features/quotes/service';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await deleteQuote(locals.supabase, user.id, params.id));
};
