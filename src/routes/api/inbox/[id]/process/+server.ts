import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addNote } from '$lib/server/features/notes/service';
import { addTask } from '$lib/server/features/tasks/service';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');
	
	const { target, folder_id, tags, context, energy_level } = await request.json();
	const inboxId = params.id;

	// 1. Ambil inbox item content
	const { data: inboxItem, error: inboxErr } = await locals.supabase
		.from('inbox')
		.select('*')
		.eq('id', inboxId)
		.eq('user_id', user.id)
		.single();

	if (inboxErr || !inboxItem) {
		throw error(404, 'Inbox item not found');
	}

	let result;
	
	if (target === 'note') {
		const title = inboxItem.content.split('\n')[0].substring(0, 50) + '...';
		result = await addNote(locals.supabase, user.id, title, {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [{ type: 'text', text: inboxItem.content }]
				}
			]
		});
		
		// Update folder_id 
		if (folder_id) {
			await locals.supabase.from('notes').update({ folder_id }).eq('id', result.id);
		}
		
		// Attach tags
		if (tags && tags.length > 0) {
			const tagInserts = tags.map((t: string) => ({ note_id: result.id, tag_id: t }));
			await locals.supabase.from('note_tags').insert(tagInserts);
		}
		
	} else if (target === 'task') {
		result = await addTask(
			locals.supabase, 
			user.id, 
			inboxItem.content, 
			context || 'home', 
			energy_level || 'low'
		);
	} else {
		throw error(400, 'Invalid target');
	}

	// Hapus inbox item
	await locals.supabase.from('inbox').delete().eq('id', inboxId);

	return json(result);
};
