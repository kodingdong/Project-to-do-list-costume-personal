import { page } from '$app/stores';
import { get } from 'svelte/store';

export function getAuthHeaders() {
	const $page = get(page);
	const token = $page.data?.session?.access_token || '';
	return { Authorization: `Bearer ${token}` };
}
