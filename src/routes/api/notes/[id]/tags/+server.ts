import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { attachTag, detachTag } from '$lib/server/features/tags/service';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	const { tag_id } = await request.json();
	return json(await attachTag(locals.supabase, params.id, tag_id));
};

export const DELETE: RequestHandler = async ({ params, request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	const { tag_id } = await request.json();
	return json(await detachTag(locals.supabase, params.id, tag_id));
};
