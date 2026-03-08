import type { Handle } from '@sveltejs/kit';
import { getSession } from '$lib/server/auth.js';
import { getUserSession } from '$lib/server/userAuth.js';

export const handle: Handle = async ({ event, resolve }) => {
  // Admin session
  const adminToken = event.cookies.get('session');
  if (adminToken) {
    const session = getSession(adminToken);
    event.locals.admin = session
      ? { id: session.adminId, username: session.username }
      : null;
  } else {
    event.locals.admin = null;
  }

  // User session
  const userToken = event.cookies.get('user-session');
  if (userToken) {
    const session = getUserSession(userToken);
    event.locals.user = session
      ? { id: session.userId, username: session.username }
      : null;
  } else {
    event.locals.user = null;
  }

  return resolve(event);
};
