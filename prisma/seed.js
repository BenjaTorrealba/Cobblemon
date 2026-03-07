import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

// Load SESSION_SECRET from .env for hashing consistency
function loadEnv() {
  try {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const envPath = resolve(__dirname, '../.env');
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const match = line.match(/^SESSION_SECRET\s*=\s*"?([^"]+)"?/);
      if (match) return match[1].trim();
    }
  } catch { /* ignore */ }
  return 'cobblemon-secret-change-me-in-production-abc123xyz';
}

const SESSION_SECRET = loadEnv();

function hashPassword(password) {
  return createHash('sha256').update(password + SESSION_SECRET).digest('hex');
}

async function main() {
  // Create admin accounts
  // CHANGE THESE PASSWORDS before deploying!
  await prisma.admin.upsert({
    where: { username: 'admin1' },
    update: {},
    create: {
      username: 'admin1',
      passwordHash: hashPassword('changeme1'),
    },
  });

  await prisma.admin.upsert({
    where: { username: 'admin2' },
    update: {},
    create: {
      username: 'admin2',
      passwordHash: hashPassword('changeme2'),
    },
  });

  console.log('Seed complete. Remember to change admin passwords!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
