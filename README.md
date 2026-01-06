# Next.js Custom Cache Handler with Redis

A comprehensive demonstration of Next.js caching strategies using custom cache handlers with Redis for centralized, distributed caching across multiple rendering methods.

## Overview

This project showcases how to implement and configure custom cache handlers in Next.js to enable distributed caching with Redis. It demonstrates various caching strategies including SSG (Static Site Generation), ISR (Incremental Static Regeneration), SSR (Server-Side Rendering), and dynamic rendering with real-world examples using JSONPlaceholder API as a data source.

## Features

- **Custom Cache Handlers**: Two different implementations
  - Custom Redis cache handler with fallback to in-memory caching
  - [@neshca/cache-handler](https://github.com/caching-tools/next-shared-cache) integration with Redis Stack
- **Multiple Rendering Strategies**: Live examples of different Next.js caching patterns
- **App Router & Pages Router**: Examples for both routing paradigms
- **Centralized Caching**: Redis-backed cache shared across all server instances
- **Graceful Fallback**: Automatic fallback to in-memory caching when Redis is unavailable
- **Real-world Integration**: Connected to JSONPlaceholder API for realistic data fetching scenarios

## What This Demonstrates

### Caching Strategies

1. **Dynamic Rendering (No Cache)** - `cache: 'no-store'`
   - Fresh data on every request
   - Perfect for real-time, user-specific content
   - Example: `/` (Home page showing JSON data)

2. **ISR (Incremental Static Regeneration)** - `revalidate: 60`
   - Time-based revalidation (60 seconds)
   - Balances freshness with performance
   - Stale-while-revalidate pattern
   - Examples: `/app-isr`, `/app-isr/[id]`, `/page-static`, `/page-static/[id]`

3. **SSG (Static Site Generation)**
   - Pre-rendered at build time using `generateStaticParams`
   - Maximum performance
   - Ideal for rarely changing content
   - Examples: `/app-ssg`, `/app-ssg/[id]`

4. **SSR (Server-Side Rendering)**
   - Rendered on each request with `getServerSideProps`
   - Always fresh data, no static caching
   - Examples: `/page-server`, `/page-server/[id]`

### Cache Handler Implementations

#### 1. Custom Redis Handler (`cache-handler.js`)
- Built from scratch using `ioredis`
- Direct control over caching logic
- Implements `get`, `set`, and `revalidateTag` methods
- Automatic fallback to Map-based in-memory cache
- Connection status monitoring
- Wait-until-ready pattern for initialization

#### 2. Neshca Cache Handler (`cache-handler-neshca.js`)
- Uses [@neshca/cache-handler](https://www.npmjs.com/package/@neshca/cache-handler) library
- Redis Stack integration
- LRU (Least Recently Used) fallback handler
- Production-ready with robust error handling
- Skips Redis during build phase

## Prerequisites

- Node.js 18+
- Docker (for Redis)
- Yarn or npm

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nextjs-custom-cache
```

2. Install dependencies:
```bash
yarn install
# or
npm install
```

3. (Optional) Start Redis using Docker Compose:
```bash
docker-compose up -d
```

Or start Redis separately:
```bash
docker run -d -p 6379:6379 redis:latest
# or use Redis Stack for advanced features
docker run -d -p 6379:6379 redis/redis-stack-server:latest
```

4. (Optional) Create `.env.local` file in the project root:
```bash
# Redis Configuration for Centralized Caching
# Format: redis://[:password@]host[:port][/db-number]
REDIS_URL=redis://localhost:6379

# Alternative environment variable names (also supported)
# KV_URL=redis://localhost:6379
```

## Usage

### Development Mode

```bash
yarn dev
# or
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Exploring Different Routes

The application includes multiple examples demonstrating different caching strategies:

**App Router (Next.js 13+):**
- `/` - Dynamic rendering (no cache) with JSON viewer
- `/app-isr` - ISR list page (revalidate: 60s)
- `/app-isr/1` - ISR detail page for photo #1
- `/app-ssg` - SSG list page (built at build time)
- `/app-ssg/1` - SSG detail page with `generateStaticParams`

**Pages Router (Next.js 12):**
- `/page-server` - SSR list page with `getServerSideProps`
- `/page-server/1` - SSR detail page
- `/page-static` - ISR list page with `getStaticProps`
- `/page-static/1` - ISR detail page with `getStaticPaths`

### Production Mode

```bash
# Build the application
yarn build

# Start the production server
yarn start
```

## Project Structure

```
.
├── app/                          # App Router pages
│   ├── page.tsx                  # Dynamic rendering (no cache)
│   ├── app-isr/                  # ISR examples
│   └── app-ssg/                  # SSG examples
├── pages/                        # Pages Router examples
│   ├── page-server/              # SSR examples
│   └── page-static/              # Static generation examples
├── components/                   # Reusable components
│   ├── AppLayout.tsx
│   ├── PageHeader.tsx
│   ├── ItemCard.tsx              # Photo card component with thumbnails
│   └── ItemDetail.tsx            # Photo detail view
├── utils/
│   ├── api.ts                    # JSONPlaceholder API integration
│   └── redis.ts                  # Redis client utilities
├── cache-handler.js              # Custom Redis cache handler
├── cache-handler-neshca.js       # Neshca cache handler implementation
└── next.config.ts                # Next.js configuration
```

## Configuration

### Switching Cache Handlers

Edit `next.config.ts` to switch between cache handler implementations:

```typescript
// Option 1: Custom Redis Handler
const nextConfig: NextConfig = {
  cacheHandler: path.resolve('./cache-handler.js'),
  cacheMaxMemorySize: 0,
};

// Option 2: Neshca Cache Handler
const nextConfig: NextConfig = {
  cacheHandler: path.resolve('./cache-handler-neshca.js'),
  cacheMaxMemorySize: 0,
};
```

### Redis Configuration

The cache handlers support multiple environment variable names:
- `REDIS_URL` - Primary Redis connection string
- `KV_URL` - Alternative for compatibility with hosting providers (Vercel KV, etc.)

**Connection string format:**
```
redis://[:password@]host[:port][/db-number]
```

**Examples:**
```bash
# Local Redis without auth
REDIS_URL=redis://localhost:6379

# Redis with password
REDIS_URL=redis://:mypassword@localhost:6379

# Remote Redis with database selection
REDIS_URL=redis://:password@redis-host.com:6379/0
```

## Cache Handler Deep Dive

### Custom Handler Features

**`cache-handler.js`:**
- Singleton Redis client pattern
- Connection status tracking (`isRedisConnected()`)
- Retry strategy with exponential backoff
- Graceful degradation to in-memory Map
- TTL (Time To Live) support via `revalidate` config
- Tag-based cache invalidation
- Detailed logging for debugging

**Key Methods:**
```javascript
async get(key, options)     // Retrieve cached data
async set(key, data, ctx)   // Store data with TTL
async revalidateTag(tag)    // Invalidate by tag
```

### Neshca Handler Features

**`cache-handler-neshca.js`:**
- Multi-layer caching (Redis → LRU)
- Build-time safety (skips Redis during `next build`)
- Timeout protection (1000ms)
- Key prefixing for namespace isolation
- Production-tested implementation
- Automatic reconnection handling

## Data Structure

The application fetches photo data from JSONPlaceholder API with the following structure:

```typescript
interface Item {
  id: number;          // Photo ID
  albumId: number;     // Album ID
  title: string;       // Photo title
  url: string;         // Full-size image URL (600x600)
  thumbnailUrl: string; // Thumbnail URL (150x150)
}
```

## API Functions

```typescript
// Fetch multiple items (returns first 20 photos)
const data = await getItems(revalidate?: number);
// Returns: ItemsResponse = { data: Item[] } | { error: string }

// Fetch single item by ID
const result = await getItemById(id: string, revalidate?: number);
// Returns: ItemResponse = { item: Item } | { error: string }
```

## Caching Behavior Examples

### ISR (Incremental Static Regeneration)
```typescript
// app/app-isr/page.tsx
const data = await getItems(60); // Revalidate every 60 seconds
```
- First request: Generated and cached
- Next 60s: Served from cache (instant)
- After 60s: Next request triggers background revalidation

### SSG (Static Site Generation)
```typescript
// app/app-ssg/page.tsx
const data = await getItems(60);
```
- Built once during `npm run build`
- Served as static HTML
- Requires rebuild to update

### Dynamic Rendering
```typescript
// app/page.tsx
const data = await getItems(undefined); // cache: 'no-store'
```
- Fresh data on every request
- No caching applied

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `REDIS_URL` | No* | Redis connection string | `redis://localhost:6379` |
| `KV_URL` | No* | Alternative Redis connection string | `redis://localhost:6379` |

\* Either `REDIS_URL` or `KV_URL` required for Redis caching. Falls back to in-memory if neither is set.

**Note:** No API keys or authentication tokens are required. The application uses the public JSONPlaceholder API which requires no configuration.

## Monitoring Cache Performance

The custom cache handler includes detailed logging:

```bash
# Redis connection
[Redis] Connected successfully
[Redis] Ready to accept commands

# Cache operations
[Redis] cache HIT, key=/app-isr/page
[Redis] cache MISS, key=/app-ssg/detail/123

# Error handling
[Redis] Error: Connection timeout
[Cache] Redis get error: Connection closed
```

## Technologies Used

- **[Next.js 16.1+](https://nextjs.org/)** - React framework with App Router and Pages Router
- **[Redis](https://redis.io/)** - In-memory data store for distributed caching
- **[ioredis](https://github.com/redis/ioredis)** - Redis client for Node.js
- **[@neshca/cache-handler](https://github.com/caching-tools/next-shared-cache)** - Production-ready cache handler
- **[JSONPlaceholder](https://jsonplaceholder.typicode.com/)** - Free REST API for testing (5000 photos dataset)
- **[TailwindCSS 4](https://tailwindcss.com/)** - Modern utility-first CSS
- **[TypeScript](https://www.typescriptlang.org/)** - Full type safety with discriminated unions
- **[Docker](https://www.docker.com/)** - Container platform for Redis

## Troubleshooting

### Redis Connection Issues

**Problem:** `[Redis] Max retries reached, falling back to Next.js default caching`

**Solutions:**
1. Verify Redis is running: `docker ps | grep redis`
2. Check Redis connection: `redis-cli ping` (should return `PONG`)
3. Verify `REDIS_URL` in `.env.local`
4. Check firewall settings

### Build Errors

**Problem:** Redis connection errors during `next build`

**Solution:** The Neshca handler automatically skips Redis during build. For custom handler, ensure proper phase detection or set `REDIS_URL` to empty during build.

### Cache Not Working

**Problem:** Data always fresh, never cached

**Checklist:**
1. Verify cache handler is configured in `next.config.ts`
2. Check Redis is connected (look for `[Redis] Ready` in logs)
3. Ensure `revalidate` is set correctly in fetch options
4. Run in production mode (`yarn build && yarn start`)

## Learn More

- [Next.js Caching Documentation](https://nextjs.org/docs/app/building-your-application/caching)
- [Custom Cache Handler Guide](https://nextjs.org/docs/app/api-reference/next-config-js/incrementalCacheHandlerPath)
- [Redis Caching Patterns](https://redis.io/docs/manual/patterns/)
- [Neshca Cache Handler Docs](https://caching-tools.github.io/next-shared-cache/)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
