import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSubTasks, addSubTask, toggleSubTask, deleteSubTask } from '$lib/server/features/tasks/service';

export const GET: RequestHandler = async ({ params, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	return json(await getSubTasks(locals.supabase, params.id));
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	const { title } = await request.json();
	return json(await addSubTask(locals.supabase, params.id, title));
};

export const PUT: RequestHandler = async ({ request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	const { subTaskId, is_completed } = await request.json();
	return json(await toggleSubTask(locals.supabase, subTaskId, is_completed));
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	const { subTaskId } = await request.json();
	return json(await deleteSubTask(locals.supabase, subTaskId));
};
