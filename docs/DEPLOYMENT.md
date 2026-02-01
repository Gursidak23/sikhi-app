# Deployment Guide

## Prerequisites

- Node.js 18.x or later
- PostgreSQL database (Aiven recommended)
- Vercel account (recommended) or other hosting

---

## Environment Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd sikhi-vidhya-platform
npm install
```

### 2. Configure Environment

Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Application
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# Error Tracking (Optional but recommended)
SENTRY_DSN="your-sentry-dsn"
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"
```

### 3. Database Setup

Generate Prisma client:
```bash
npm run db:generate
```

Push schema to database:
```bash
npm run db:push
```

Seed initial data:
```bash
npm run db:seed
```

Cache Gurbani data (optional, improves performance):
```bash
npm run seed:gurbani
```

---

## Development

Start development server:
```bash
npm run dev
```

Run tests:
```bash
npm test
```

Lint code:
```bash
npm run lint
```

---

## Production Build

### Local Build

```bash
npm run build
npm start
```

### Vercel Deployment

1. Connect repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

**Build Settings**:
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t sikhi-vidhya .
docker run -p 3000:3000 --env-file .env sikhi-vidhya
```

---

## Database Configuration

### Aiven PostgreSQL (Recommended)

1. Create account at [aiven.io](https://aiven.io)
2. Create PostgreSQL service
3. Copy connection string from Overview tab
4. Add to `DATABASE_URL` environment variable

### Connection Pooling

For production with high traffic, enable connection pooling:

```env
DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require&connection_limit=10"
```

---

## Security Checklist

- [ ] Environment variables set (not in code)
- [ ] DATABASE_URL uses SSL (`sslmode=require`)
- [ ] SENTRY_DSN configured for error tracking
- [ ] Rate limiting enabled on API routes
- [ ] Security headers configured (automatic via next.config.js)
- [ ] No sensitive data in client-side code

---

## Performance Optimization

### Caching

Gurbani data is cached in PostgreSQL to reduce BaniDB API calls:
```bash
npm run seed:gurbani
```

### Bundle Analysis

Analyze bundle size:
```bash
ANALYZE=true npm run build
```

### Core Web Vitals

Monitor with:
- Vercel Analytics (automatic)
- Google Lighthouse
- Web Vitals Chrome extension

---

## Monitoring

### Error Tracking (Sentry)

1. Create project at [sentry.io](https://sentry.io)
2. Add DSN to environment variables
3. Errors automatically captured

### Logs

View logs:
- Vercel: Dashboard → Logs
- Docker: `docker logs <container-id>`

---

## Troubleshooting

### Database Connection Errors

```
Error: Can't reach database server
```

Solutions:
1. Check DATABASE_URL is correct
2. Ensure database is running
3. Check firewall/network rules
4. Verify SSL mode

### Build Errors

```
Error: Cannot find module
```

Solutions:
1. Delete `node_modules` and reinstall
2. Run `npx prisma generate`
3. Check TypeScript errors: `npm run lint`

### Rate Limiting Issues

If users hit rate limits too often:
1. Increase `RATE_LIMIT_REQUESTS_PER_MINUTE`
2. Implement caching on client side
3. Consider Redis-based rate limiting for distributed deployments

---

## Scaling

### Horizontal Scaling

- Deploy multiple instances behind load balancer
- Use Redis for rate limiting (instead of in-memory)
- Use database connection pooling

### Vertical Scaling

- Increase server resources
- Enable caching layers
- Optimize database queries

---

## Backup & Recovery

### Database Backups

Aiven provides automatic daily backups. For manual backups:
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Restore

```bash
psql $DATABASE_URL < backup.sql
```

---

## Updates & Maintenance

### Updating Dependencies

```bash
npm update
npm audit fix
```

### Database Migrations

```bash
npm run db:migrate
```

### Prisma Schema Changes

1. Edit `prisma/schema.prisma`
2. Run `npm run db:push` (dev) or `npm run db:migrate` (production)
3. Regenerate client: `npm run db:generate`
