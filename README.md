# AutoHub

AutoHub is an all-in-one ecosystem for automotive enthusiasts, shop owners, and event organizers. It combines a personal
garage, marketplace, service bookings, events, messaging, reviews, and favorites into a single Next.js application backed by
PostgreSQL and Prisma.

## Tech stack

- **Framework:** Next.js 14 (App Router) with TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** Cookie-based JWT sessions
- **Validation:** Zod schemas in API routes

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file based on the provided template:

```bash
cp .env.example .env
```

Update the `DATABASE_URL` and `JWT_SECRET` for your environment. For local development you can use a Postgres instance started via
Docker:

```bash
docker run --name autohub-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
```

### 3. Migrate database

Run Prisma migrations to create the schema:

```bash
npx prisma migrate dev --name init
```

Generate the Prisma client:

```bash
npm run prisma:generate
```

### 4. Seed demo data (optional)

Populate the database with demo users, cars, listings, shops, services, bookings, events, conversations, and favorites:

```bash
npm run prisma:seed
```

Demo accounts:

- alice@example.com / password123 (enthusiast)
- bob@example.com / password123 (shop owner)
- charlotte@example.com / password123 (event host)

### 5. Start development server

```bash
npm run dev
```

Visit `http://localhost:3000` to explore AutoHub.

## Core features

- **Authentication**: Signup, login, logout, and session management with role support (`USER`, `SHOP_OWNER`, `ADMIN`).
- **Garage**: Manage personal builds, including modifications and public car profiles.
- **Marketplace**: Create and browse listings with filtering by type, query, and location.
- **Services**: Shop owners manage profiles, list services, and handle bookings.
- **Bookings**: Customers request appointments; shops track and update booking statuses.
- **Events**: Host events, allow RSVPs, and view attendee and review information.
- **Messaging**: 1:1 conversations between buyers, sellers, and shop owners with live message panels.
- **Reviews & Ratings**: Collect feedback on shops and events with aggregated scores.
- **Favorites**: Save cars, listings, shops, and events for quick access.
- **Search APIs**: Dedicated endpoints for listings, events, and shops with pagination and filtering.

## Project structure

```
app/               # Next.js app router pages and API routes
components/        # Reusable UI and feature components
lib/               # Shared utilities (Prisma, auth, http helpers, validation)
prisma/            # Prisma schema and seed script
```

## Testing & linting

This project relies on TypeScript and ESLint. You can run linting with:

```bash
npm run lint
```

Add your own unit or integration tests as the project grows.

## Deployment notes

- Set production environment variables (`DATABASE_URL`, `JWT_SECRET`).
- Run `prisma migrate deploy` on deployment targets.
- Configure a persistent Postgres database and replace local storage for file uploads with an object store (e.g., S3) as needed.
- Harden authentication flows (password reset, email verification, etc.) before releasing publicly.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
