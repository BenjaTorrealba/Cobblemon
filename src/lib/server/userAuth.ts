import { createHash, randomBytes } from 'crypto';
import { prisma } from './prisma.js';

const USER_SESSIONS = new Map<string, { userId: number; username: string; expires: number }>();

function getSecret(): string {
  return process.env.SESSION_SECRET ?? 'cobblemon-secret-change-me-in-production-abc123xyz';
}

export function hashUserPassword(password: string): string {
  return createHash('sha256').update(password + getSecret()).digest('hex');
}

export function createUserSession(userId: number, username: string, maxAgeSeconds = 28800): string {
  const token = randomBytes(32).toString('hex');
  const expires = Date.now() + maxAgeSeconds * 1000;
  USER_SESSIONS.set(token, { userId, username, expires });
  return token;
}

export function getUserSession(token: string): { userId: number; username: string } | null {
  const session = USER_SESSIONS.get(token);
  if (!session) return null;
  if (Date.now() > session.expires) {
    USER_SESSIONS.delete(token);
    return null;
  }
  return { userId: session.userId, username: session.username };
}

export function deleteUserSession(token: string): void {
  USER_SESSIONS.delete(token);
}

export async function validateUser(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return null;
  if (hashUserPassword(password) !== user.passwordHash) return null;
  return user;
}
