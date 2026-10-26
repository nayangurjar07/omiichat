# Omii: Stranger Chat — Anonymous 1-to-1 Chat, Public Topic Rooms & Private Communities (18+)

**Omii: Stranger Chat** is a modern, privacy-focused real-time stranger chat platform for adults (18+). Say hi to someone new. Chat anonymously with real people from around the world on Omii. No signup, no bots, moderated rooms. Start a free stranger chat in seconds.

---

## What's New & Core Features

### 1. Public Topic Rooms (`/rooms`)
- Live directory of topic rooms: **Gaming Hub**, **Music Lounge**, **Cinema & TV**, **College & Campus**, **Tech & Code**, **Chill Cafe**, and **Regional Hubs** (North America, Europe, Asia & Pacific, Latin America, Global).
- Real-time online participant counters (up to 200 users per room).
- Join with your existing nickname, real-time message stream, and system join/leave notices.
- Collapsible interactive member list with host crown badges and online indicators.
- Per-room sliding rate limiting, profanity/spam filtering, and message-level report button.
- Last 50 messages retained for new joiners.

### 2. Private Group Chats (`/r/<code>`)
- Instant "Create Room" modal generating a shareable 6-character code and invite link (`/r/<code>`).
- Full host privileges: room creator can **mute** and **kick** disruptive members.
- Auto-cleanup: empty private rooms automatically self-delete after 30 minutes of inactivity.

### 3. Voice Notes & Image Sharing (1-to-1 and Rooms)
- **Voice Notes**: In-browser audio recorder with a 30-second cap, live timer countdown, and waveform player.
- **Image Sharing**: Max 3 MB validation (JPEG, PNG, WebP) with binary magic byte validation and pluggable image moderation hook (`moderateImage`).
- **Safety Veil**: Images are blurred by default on the recipient's screen until explicitly clicked to reveal.
- **Pluggable Storage (`IStorageService`)**: Files are stored locally during dev behind a clean storage interface ready to be swapped with AWS S3 or Cloudflare R2 in production.

### 4. 24-Hour Reconnect Engine
- Both users can tap **"Chat again later"** during or after a conversation to generate a mutual 24-hour reconnect code.
- Entering the code or visiting `/chat?reconnect=<code>` pairs the two users directly back together.

### 5. Optional Accounts, Profiles & Friends
- Accounts are **100% optional**; anonymous mode remains fully functional by default.
- Email/password authentication or one-click Google login.
- Profile customization: custom nickname, avatar picker, bio, and up to 5 interest tags.
- Friends management: add friends by nickname or email, view status, and initiate chats.

### 6. SEO & Branding
- **Single Source of Truth**: Rename the site in one place (`web/src/config/site.ts` & `server/src/config.ts`).
- Full Open Graph metadata, Twitter cards, and JSON-LD structured data (`WebSite` & `WebApplication`).
- Dynamic `sitemap.xml` and `robots.txt` automatically served.

### 7. Safety & Extended Moderation (`/admin`)
- Strict 18+ confirmation gate.
- Auto-bans enforced after 3 reports within 24 hours.
- Extended `/admin` dashboard supporting both 1-to-1 reports and Room reports (with room name, reported message text, reported media, and chat transcript context).

---

## Quick Start (Windows / PowerShell)

### Terminal 1: Backend Server

```powershell
cd server

# 1. Install dependencies
npm.cmd install

# 2. Synchronize database (SQLite for local dev)
npm.cmd run db:generate
npm.cmd run db:push

# 3. Build & start the server
npm.cmd run build
node dist/index.js
```
*Server runs on `http://localhost:3001` with API health check at `http://localhost:3001/health`.*

---

### Terminal 2: Frontend Web App

```powershell
cd web

# 1. Install dependencies
npm.cmd install

# 2. Start Next.js development server
npm.cmd run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## Configuration & Environment Variables

### Server (`server/.env`)

| Variable | Default | Description |
|---|---|---|
| `SITE_NAME` | `Omii` | Site branding name displayed on the server |
| `PORT` | `3001` | Express & Socket.IO port |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed frontend origin |
| `ADMIN_PASSWORD` | `admin` | Password for `/admin` moderation endpoints |
| `DATABASE_URL` | `file:./dev.db` | SQLite file location (switch to `postgresql://...` for production) |
| `IMAGE_MODERATION_API_URL` | *(optional)* | External API endpoint for AI image moderation (e.g. AWS Rekognition, Sightengine) |
| `IMAGE_MODERATION_API_KEY` | *(optional)* | API key for external image moderation |

### Frontend (`web/src/config/site.ts` & `web/.env.local`)

- **Site Name & Branding**: Edit `web/src/config/site.ts`:
  ```ts
  export const siteConfig = {
    name: 'Omii', // Change here to rename the site across the entire application!
    tagline: 'Anonymous 1-to-1 Chat & Real-Time Topic Communities (18+)',
    ...
  };
  ```
- **Frontend Environment Variables (`web/.env.local`)**:
  | Variable | Default | Description |
  |---|---|---|
  | `NEXT_PUBLIC_SOCKET_URL` | `http://localhost:3001` | Socket.IO server URL |
  | `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Backend REST API URL |
  | `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Public website URL for canonical tags & sitemap |

---

## Storage & Cloud Deployment

### Swapping Local Storage with AWS S3 / Cloudflare R2
The file storage logic implements `IStorageService` (`server/src/storage/types.ts`):
```ts
export interface IStorageService {
  upload(buffer: Buffer, originalFilename: string, mimeType: string): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}
```
To use AWS S3 or Cloudflare R2, create an `S3StorageService` implementing `IStorageService` and pass it to `uploadRoutes` in `server/src/upload/routes.ts`.

### Switching to PostgreSQL in Production
1. In `server/prisma/schema.prisma`, change:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. In `server/.env`, set `DATABASE_URL="postgresql://user:password@host:5432/dbname"`.
3. Run `npm.cmd run db:push` or `npx.cmd prisma migrate deploy`.
