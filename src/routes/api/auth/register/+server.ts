import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import { hashUserPassword, createUserSession } from '$lib/server/userAuth.js';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { username, password, code } = await request.json();

  if (!username || !password || !code) {
    return json({ error: 'Todos los campos son obligatorios' }, { status: 400 });
  }

  // Validate registration code
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  const validCode = settings?.registrationCode ?? '';

  if (!validCode) {
    return json({ error: 'El registro está deshabilitado. Contacta al admin.' }, { status: 403 });
  }
  if (code.trim() !== validCode.trim()) {
    return json({ error: 'Código de registro incorrecto' }, { status: 403 });
  }

  const usernameClean = String(username).trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (!usernameClean || usernameClean.length < 3) {
    return json({ error: 'El usuario debe tener mínimo 3 caracteres (solo letras, números y _)' }, { status: 400 });
  }
  if (String(password).length < 4) {
    return json({ error: 'La contraseña debe tener mínimo 4 caracteres' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username: usernameClean } });
  if (existing) {
    return json({ error: 'Ese nombre de usuario ya está en uso' }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: { username: usernameClean, passwordHash: hashUserPassword(String(password)) },
  });

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
