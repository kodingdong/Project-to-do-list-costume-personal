import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getQuotes, addQuote } from '$lib/server/features/quotes/service';

export const GET: RequestHandler = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await getQuotes(locals.supabase, user.id));
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	const body = await request.json();
	return json(await addQuote(locals.supabase, user.id, body));
};
