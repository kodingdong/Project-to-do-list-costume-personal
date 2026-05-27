/**
 * Eden Treaty Client — Type-safe API calls dari Frontend ke ElysiaJS
 *
 * Eden Treaty membaca type definition dari ElysiaJS app,
 * sehingga setiap API call memiliki autocomplete dan type checking.
 *
 * Ref: https://elysiajs.com/eden/treaty/overview.html
 */

import { treaty } from '@elysiajs/eden';
import type { App } from '$lib/server/elysia';

// Buat Eden Treaty client yang mengarah ke origin yang sama
// Di browser, ini akan otomatis menggunakan URL halaman saat ini
export const api = treaty<App>(
	typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'
);
