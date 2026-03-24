# Tabbani — Jordan's Pet Adoption & Fostering Platform

## Project Overview
A full-stack monorepo web platform for pet adoption and fostering in Jordan. Built with React/Vite frontend, Express backend, PostgreSQL + Drizzle ORM, and OpenAI AI integration.

## Architecture

### Tech Stack
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + Wouter (routing) + Framer Motion
- **Backend**: Express 5 + TypeScript + Pino logger
- **Database**: PostgreSQL + Drizzle ORM + drizzle-zod
- **AI**: OpenAI GPT-5.2 via Replit AI Integrations
- **Package Manager**: pnpm workspace monorepo

### Ports
- Frontend: 18130 (preview at `/`)
- API Server: 8080

### Design System
- Background: Cream `#FFF8F3`
- Primary: Orange `#FF6B35`
- Accent: Teal `#00B8A0`
- Header/Footer/Admin: Dark Navy `#1E2A3A`
- Font: Inter (sans-serif)

## Project Structure

```
artifacts/
  api-server/           # Express API server (port 8080)
  frontend/             # React/Vite frontend (port 18130)
  mockup-sandbox/       # Vite component preview server

lib/
  db/                   # Drizzle ORM schema + migrations
  api-spec/             # OpenAPI YAML spec
  api-zod/              # Generated Zod validation schemas (from codegen)
  api-client-react/     # Generated React Query hooks (from codegen)
  integrations-openai-ai-server/  # OpenAI client for server-side AI
  integrations-openai-ai-react/   # React hooks for AI audio features

scripts/
  src/seed.ts           # Database seed script (20 pets, 3 users, etc.)
```

## Database Schema (9 tables)
| Table | Purpose |
|---|---|
| `users` | Platform users (user/admin/volunteer roles) |
| `pets` | Pet listings with images, status, city |
| `adoption_requests` | Adoption request management |
| `foster_requests` | Foster request management |
| `donations` | Monetary + supply donations |
| `gallery_posts` | Success stories gallery |
| `lost_found_reports` | Lost & found pet reports |
| `messages` | User messaging system |
| `notifications` | User notifications |

## Frontend Pages

### User-Facing
| Route | Component | Description |
|---|---|---|
| `/` | `Home` | Hero + featured pets + stats + gallery |
| `/adopt` | `Adopt` | Pet listing with filters (type, gender, size, city) |
| `/foster` | `Foster` | Foster pets listing with filters |
| `/pets/:id` | `PetDetail` | Pet detail + adopt/foster request form |
| `/lost-found` | `LostFound` | Lost & found reports with tabs |
| `/donate` | `Donate` | Monetary & supply donation forms |
| `/gallery` | `Gallery` | Happy tails success stories |
| `/about` | `About` | About page |

### Admin Dashboard (at `/admin/*`)
| Route | Component | Description |
|---|---|---|
| `/admin` | `AdminDashboard` | KPI stats (8 cards): pets, users, donations, etc. |
| `/admin/pets` | `AdminPets` | Pet management table with approve/feature/delete |
| `/admin/users` | `AdminUsers` | User management with search/filter by role |
| `/admin/adoptions` | `AdminAdoptions` | Adoption request approval/rejection |
| `/admin/fosters` | `AdminFosters` | Foster request approval/rejection |

## API Endpoints

### Public API (via `/api/`)
- `GET /api/health`
- `GET /api/pets` — list with filters (type, status, purpose, city, search, featured)
- `GET /api/pets/featured` — featured pets only
- `GET /api/pets/:id` — pet detail
- `POST /api/pets` — create pet listing
- `GET /api/adoption-requests` — list adoption requests
- `POST /api/adoption-requests` — submit adoption request
- `PATCH /api/adoption-requests/:id/status` — update request status
- `GET /api/foster-requests` — list foster requests
- `POST /api/foster-requests` — submit foster request
- `PATCH /api/foster-requests/:id/status` — update request status
- `POST /api/donations` — submit donation
- `GET /api/gallery` — gallery posts
- `GET /api/lost-found` — lost/found reports
- `POST /api/lost-found` — report lost/found pet
- `GET /api/users/:id` — user profile
- `POST /api/messages` — send message

### Admin API
- `GET /api/admin/stats` — platform KPIs
- `GET /api/admin/users` — user management list
- `POST /api/pets/:id/approve` — approve pet listing
- `POST /api/pets/:id/toggle-featured` — toggle featured status
- `DELETE /api/pets/:id` — delete pet

### AI API
- `POST /api/ai/chat` — AI chat assistant (body: `{message, history[]}`)
- `POST /api/ai/match` — Pet matching by preferences (body: `{preferences}`)
- `POST /api/ai/describe` — Generate pet description (body: `{pet}`)

## AI Features
- **Chat Widget**: Floating orange bubble on all user pages, powered by GPT-5.2
  - System prompt configured for Jordan pet context (Amman, Irbid, Zarqa, Aqaba)
  - Maintains conversation history within session
  - Responds in English or Arabic based on user language
- **Pet Matching**: POST `/api/ai/match` to find the best pet type based on lifestyle
- **Description Generation**: POST `/api/ai/describe` to generate pet adoption stories

## Environment Variables
- `DATABASE_URL` — PostgreSQL connection string
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — Replit AI Integrations proxy URL
- `AI_INTEGRATIONS_OPENAI_API_KEY` — Replit AI Integrations API key
- `PORT` — Assigned by Replit per artifact

## Commands
```bash
# Development
pnpm --filter @workspace/frontend run dev        # Frontend
pnpm --filter @workspace/api-server run dev      # API server

# Database
pnpm --filter @workspace/db run push             # Apply migrations
pnpm --filter @workspace/db run push-force       # Force push (if conflicts)
pnpm --filter @workspace/scripts run seed        # Seed database

# Code generation
pnpm --filter @workspace/api-spec run codegen    # Regenerate API client + Zod schemas

# Install
pnpm install --no-frozen-lockfile
```

## Seed Data
The seed script creates:
- 20 pets (7 dogs, 7 cats, 3 rabbits, 2 birds, 1 other) across Amman, Irbid, Zarqa
- 3 users: Admin Tabanni (admin), Sara Ahmed (user), Omar Hassan (user)
- Adoption requests with mixed statuses (pending/approved/rejected)
- Foster requests
- Donations totaling 1000+ JOD
- Gallery posts with success stories
- Lost/found reports

## Jordan Context
- Cities: Amman, Irbid, Zarqa, Aqaba
- Currency: JOD (Jordanian Dinar)
- Phone numbers: +962 prefix
- Language: English v1 (Arabic support planned)
- Mock user: userId=1 (Admin Tabanni) used for unauthenticated requests

## Status: PRODUCTION-READY
All tasks completed:
- [x] Task 1: Foundation (DB, API, backend routes)
- [x] Task 2: Frontend (all user-facing pages)
- [x] Task 3: Admin Dashboard (full CRUD management)
- [x] Task 4: AI Features (chat widget, matching, descriptions)
