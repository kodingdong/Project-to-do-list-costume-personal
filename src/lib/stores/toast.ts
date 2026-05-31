export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
	id: string;
	message: string;
	type: ToastType;
}

import { writable } from 'svelte/store';

export const toasts = writable<Toast[]>([]);

export function addToast(message: string, type: ToastType = 'info', durationMs: number = 3000) {
	const id = crypto.randomUUID();
	toasts.update((all) => [...all, { id, message, type }]);

	if (durationMs > 0) {
		setTimeout(() => removeToast(id), durationMs);
	}
}

export function removeToast(id: string) {
	toasts.update((all) => all.filter((t) => t.id !== id));
}
