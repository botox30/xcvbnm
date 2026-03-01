# restage - Ticket Marketplace

## Overview
A concert ticket marketplace built with React (Vite) frontend and Express backend, served together on port 5000. Users can browse official tickets and community resale tickets.

## Tech Stack
- **Frontend**: React 18, Vite, TailwindCSS, shadcn/ui (Radix), Wouter (routing), TanStack Query
- **Backend**: Express 5, TypeScript, tsx
- **Database**: PostgreSQL with Drizzle ORM
- **Build**: esbuild (server) + Vite (client), output to `dist/`

## Project Structure
```
client/          - React frontend (Vite root)
  src/           - React components and pages
  public/        - Static assets
server/          - Express backend
  index.ts       - Server entry point (serves API + client)
  routes.ts      - API routes and seed data
  db.ts          - Database connection (pg Pool + Drizzle)
  storage.ts     - Data access layer
  vite.ts        - Vite dev middleware setup
  static.ts      - Static file serving (production)
shared/          - Shared types and schemas
  schema.ts      - Drizzle schema (users, tickets)
  routes.ts      - API route definitions with Zod validation
script/          - Build scripts
```

## Key Commands
- `npm run dev` - Development server (port 5000)
- `npm run build` - Production build (client + server)
- `npm run start` - Production server
- `npm run db:push` - Push schema changes to database

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (defaults to 5000)

## Database Schema
- `users` - id, username, password
- `tickets` - id, title, description, price (cents), date, location, sellerId, type (creator/market), status (available/sold), imageUrl
