import { json } from '@sveltejs/kit';
import { validateUser, createUserSession } from '$lib/server/userAuth.js';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const body = await request.json();
  const { username, password } = body;
  if (!username || !password) return json({ error: 'Credenciales requeridas' }, { status: 400 });

  const user = await validateUser(String(username), String(password));
  if (!user) return json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 });

  const token = createUserSession(user.id, user.username);
  cookies.set('user-session', token, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 28800,
  });

  return json({ success: true, username: user.username });
};