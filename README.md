# Cobbleverse Tournament Platform

A fullstack SvelteKit application for managing Cobblemon tournaments.

## Tech Stack

- **SvelteKit** (fullstack)
- **TailwindCSS** (dark esports theme)
- **Prisma ORM** + **SQLite**
- **Node.js adapter** (for self-hosted Linux deployment)
- **minecraft-server-util** (for server status)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env` and edit as needed:

```bash
cp .env .env.local
```

Required variables:
- `DATABASE_URL` — SQLite DB path (e.g., `file:./dev.db`)
- `SESSION_SECRET` — **Change this to a strong random string in production!**

### 3. Setup database

```bash
npm run db:push      # Create tables
npm run db:seed      # Create admin users
```

Default admin credentials (change immediately!):
- `admin1` / `changeme1`
- `admin2` / `changeme2`

**To change passwords**, edit `prisma/seed.js`, run `npm run db:seed`, or update directly via Prisma Studio:

```bash
npm run db:studio
```

### 4. Run development server

```bash
npm run dev
```

### 5. Build for production

```bash
npm run build
npm start
```

## Deployment (Linux + Cloudflare)

1. Build the app: `npm run build`
2. Copy the `build/` folder to your server
3. Run with Node: `node build/index.js`
4. Use a process manager like `pm2`:

```bash
pm2 start build/index.js --name cobbleverse
pm2 save
pm2 startup
```

5. Reverse proxy with Nginx:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. Point Cloudflare to your server IP.

## Routes

### Public
- `/` — Home: server status, active tournaments, upcoming matches
- `/tournaments/[id]` — Tournament detail: standings, participants, matches

### Admin (requires login)
- `/admin/login` — Login page
- `/admin` — Dashboard
- `/admin/tournaments` — Manage tournaments & players
- `/admin/players` — Manage players
- `/admin/matches` — Manage matches, assign winners

### API
- `GET /api/server-status`
- `GET/POST /api/tournaments`
- `GET/PUT/DELETE /api/tournaments/[id]`
- `POST/DELETE /api/tournaments/[id]/players`
- `GET/POST /api/players`
- `DELETE /api/players/[id]`
- `GET/POST /api/matches`
- `PUT/DELETE /api/matches/[id]`
- `POST /api/auth/login`
- `POST /api/auth/logout`

## Scoring

- Win = 3 points
- Loss = 0 points

Standings are calculated automatically from completed matches.
