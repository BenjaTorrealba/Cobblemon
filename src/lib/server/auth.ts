import { createHash, randomBytes } from 'crypto';
import { prisma } from './prisma.js';
import { SESSION_SECRET } from '$env/static/private';

const SESSIONS = new Map<string, { adminId: number; username: string; expires: number }>();

export function hashPassword(password: string): string {
  return createHash('sha256').update(password + SESSION_SECRET).digest('hex');
}

export function createSession(adminId: number, username: string, maxAgeSeconds = 28800): string {
  const token = randomBytes(32).toString('hex');
  const expires = Date.now() + maxAgeSeconds * 1000;
  SESSIONS.set(token, { adminId, username, expires });
  return token;
}

export function getSession(token: string): { adminId: number; username: string } | null {
  const session = SESSIONS.get(token);
  if (!session) return null;
  if (Date.now() > session.expires) {
    SESSIONS.delete(token);
    return null;
  }
  return { adminId: session.adminId, username: session.username };
}

export function deleteSession(token: string): void {
  SESSIONS.delete(token);
}

export async function validateAdmin(username: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) return null;
  const hash = hashPassword(password);
  if (hash !== admin.passwordHash) return null;
  return admin;
}
