/**
 * Layout Server Load — Meneruskan session ke semua halaman
 *
 * File ini dijalankan di server setiap kali halaman di-load.
 * Mengambil session dari hooks.server.ts dan meneruskannya ke PageData.
 */

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession } }) => {
	const { session, user } = await safeGetSession();

	return {
		session,
		user
	};
};
