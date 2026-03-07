import { json } from '@sveltejs/kit';
import { validateAdmin, createSession } from '$lib/server/auth.js';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const body = await request.json();
  const { username, password } = body;

  if (!username || !password) {
    return json({ error: 'Credentials required' }, { status: 400 });
  }

  const admin = await validateAdmin(String(username), String(password));
  if (!admin) {
    return json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = createSession(admin.id, admin.username);

  cookies.set('session', token, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 28800,
  });

  return json({ success: true, username: admin.username });
};
