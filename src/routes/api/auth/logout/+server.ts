import { json } from '@sveltejs/kit';
import { deleteSession } from '$lib/server/auth.js';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ cookies }) => {
  const token = cookies.get('session');
  if (token) {
    deleteSession(token);
    cookies.delete('session', { path: '/' });
  }
  return json({ success: true });
};
