import { json } from '@sveltejs/kit';
import { deleteUserSession } from '$lib/server/userAuth.js';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ cookies }) => {
  const token = cookies.get('user-session');
  if (token) {
    deleteUserSession(token);
    cookies.delete('user-session', { path: '/' });
  }
  return json({ success: true });
};