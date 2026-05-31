/**
 * SvelteKit Catch-all Route → ElysiaJS
 *
 * Semua request ke /api/* di-delegate ke ElysiaJS app.handle()
 * Ini memungkinkan ElysiaJS berjalan embedded di dalam SvelteKit
 * dengan hanya 1 server dan 1 port.
 *
 * Ref: https://elysiajs.com/integrations/sveltekit.html
 */

import type { RequestHandler } from './$types';
import { app } from '$lib/server/elysia';

// Handler untuk semua HTTP methods — delegate ke ElysiaJS
const handler: RequestHandler = ({ request }) => app.handle(request);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
