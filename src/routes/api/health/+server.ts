import { json } from '@sveltejs/kit';
export const GET = async () => json({ status: 'OK', timestamp: new Date().toISOString() });
