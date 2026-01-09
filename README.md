# Next.js Custom Cache Handler with Redis - Multi-Pod EKS Ready

A production-ready Next.js application demonstrating distributed caching with Redis, featuring pod hostname visibility and resilient fallback mechanisms for multi-pod Kubernetes deployments on Amazon EKS.

<img width="800" height="600" alt="image" src="https://github.com/user-attachments/assets/d7e03014-66f1-4d93-b7b8-1439840cd68c" />

## Features

### Core Caching Features
- **Custom Cache Handlers**: Two different implementations
  - Custom Redis cache handler with fallback to in-memory caching
  - [@neshca/cache-handler](https://github.com/caching-tools/next-shared-cache) integration with Redis Stack
- **Multiple Rendering Strategies**: Live examples of different Next.js caching patterns
- **App Router & Pages Router**: Examples for both routing paradigms
- **Centralized Caching**: Redis-backed cache shared across all server instances
- **Graceful Fallback**: Automatic fallback to LRU in-memory caching when Redis is unavailable
- **Real-world Integration**: Connected to JSONPlaceholder API for realistic data fetching scenarios

### Multi-Pod Features
- **Pod Hostname Display**: Shows which pod is serving each request
- **Cache Handler Logging**: Detailed logging for Redis and LRU cache operations
- **Connection Timeout Protection**: 5-second timeout prevents hanging when Redis is unavailable
- **LRU Memory Limits**: Configurable memory constraints for in-memory cache
- **Kubernetes Ready**: Complete K8s manifests for EKS deployment with 3-pod setup
- **Load Balancer Support**: Service configuration for distributing traffic across pods

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

#### 2. Neshca Cache Handler (`cache-handler-neshca.js`) ⭐ **Recommended**
- Uses [@neshca/cache-handler](https://www.npmjs.com/package/@neshca/cache-handler) library
- Redis Stack integration with 5-second connection timeout
- LRU (Least Recently Used) fallback handler with configurable memory limits
- Production-ready with robust error handling
- Skips Redis during build phase
- **Cache operation logging** for debugging in multi-pod environments
- **Null handler filtering** prevents crashes when Redis is unavailable

## Prerequisites

- Node.js 18+
- Docker (for local Redis testing)
- Yarn or npm
- (Optional) AWS CLI and kubectl for EKS deployment

## Installation

### Local Development

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
docker-compose up -d redis
```

Or start Redis separately:
```bash
docker run -d -p 6379:6379 redis:7-alpine
# or use Redis Stack for advanced features
docker run -d -p 6379:6379 redis/redis-stack-server:latest
```

4. (Optional) Create `.env.local` file in the project root:
```bash
# Redis Configuration for Centralized Caching
# Format: redis://[:password@]host[:port][/db-number]
REDIS_URL=redis://localhost:6379
```

## Usage

### Development Mode

```bash
yarn dev
# or
npm run dev
```

Visit `http://localhost:3000` to see the application. The pod hostname will be displayed at the top of every page.

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

## Kubernetes Deployment on EKS

Complete instructions for deploying to Amazon EKS with multiple pods are available in [k8s/README.md](./k8s/README.md).

### Quick Start

1. **Build and push Docker image to ECR:**
```bash
# Build
docker build -t nextjs-app .

# Tag for ECR
docker tag nextjs-app:latest <account-id>.dkr.ecr.<region>.amazonaws.com/nextjs-app:latest

# Login to ECR
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

# Push
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/nextjs-app:latest
```

2. **Update image URL in `k8s/deployment.yaml`**

3. **Deploy to Kubernetes:**
```bash
# Deploy Redis
kubectl apply -f k8s/redis-deployment.yaml

# Deploy Next.js app (3 replicas by default)
kubectl apply -f k8s/deployment.yaml
```

4. **Access the application:**
```bash
# Get LoadBalancer URL
kubectl get svc nextjs-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

Each refresh will show a different pod hostname, demonstrating load balancing across multiple pods!

### Scaling

```bash
# Scale to 5 pods
kubectl scale deployment nextjs-app --replicas=5

# Verify
kubectl get pods -l app=nextjs-app
```

## Project Structure

```
.
├── app/                          # App Router pages
│   ├── layout.tsx                # Root layout with pod hostname display
│   ├── page.tsx                  # Dynamic rendering (no cache)
│   ├── app-isr/                  # ISR examples
│   └── app-ssg/                  # SSG examples
├── pages/                        # Pages Router examples
│   ├── page-server/              # SSR examples
│   └── page-static/              # Static generation examples
├── components/                   # Reusable components
│   ├── AppLayout.tsx             # Main layout with navigation
│   ├── PodHostname.tsx           # Pod hostname banner component
│   ├── PageHeader.tsx            # Page header with cache info
│   ├── ItemCard.tsx              # Photo card component
│   └── ItemDetail.tsx            # Photo detail view
├── utils/
│   ├── api.ts                    # JSONPlaceholder API integration
│   ├── redis.ts                  # Redis client utilities
│   └── hostname.ts               # Pod hostname utility
├── k8s/                          # Kubernetes manifests
│   ├── deployment.yaml           # App deployment (3 replicas)
│   ├── redis-deployment.yaml    # Redis deployment
│   └── README.md                 # Detailed K8s deployment guide
├── cache-handler.js              # Custom Redis cache handler
├── cache-handler-neshca.js       # Neshca cache handler (recommended)
├── next.config.ts                # Next.js configuration
├── Dockerfile                    # Production Docker image
└── docker-compose.yml            # Local development setup
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

// Option 2: Neshca Cache Handler (Recommended)
const nextConfig: NextConfig = {
  cacheHandler: path.resolve('./cache-handler-neshca.js'),
  cacheMaxMemorySize: 0,
};
```

### LRU Memory Configuration

Adjust LRU cache limits in `cache-handler-neshca.js`:

```javascript
const baseLRUHandler = createLruHandler({
  maxItemsNumber: 1000,              // Maximum cached items
  maxItemSizeBytes: 1024 * 1024 * 100, // 100 MB per item
});
```

**Recommended settings by environment:**

| Environment | maxItemsNumber | maxItemSizeBytes | Total Max Memory |
|------------|----------------|------------------|------------------|
| Development | 500 | 50 MB | ~25 GB |
| Small App | 1000 | 100 MB | ~100 GB (current) |
| High Traffic | 5000 | 200 MB | ~1 TB |
| Memory-constrained | 200 | 10 MB | ~2 GB |

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

# Kubernetes Redis service
REDIS_URL=redis://redis-service:6379

# Remote Redis with database selection
REDIS_URL=redis://:password@redis-host.com:6379/0
```

## Cache Handler Deep Dive

### Neshca Handler Features (`cache-handler-neshca.js`) ⭐

**Enhanced Features:**
- **Connection Timeout**: 5-second timeout prevents hanging
- **Null Handler Filtering**: Automatically filters out failed Redis handler
- **Cache Operation Logging**: Detailed logs for debugging multi-pod setups
- **LRU Memory Limits**: Configurable memory constraints
- **Build-time Safety**: Skips Redis during `next build`
- **Multi-layer Caching**: Redis (primary) → LRU (fallback)
- **Graceful Degradation**: Continues working when Redis is down

**Logging Examples:**

When Redis is available:
```bash
Connecting Redis client...
Redis client connected.
Cache handlers configured: [0] Redis Handler, [1] LRU Handler (in-memory)
[Cache] Redis SET: ddaa617fe5992c9b...
[Cache] Redis HIT: ddaa617fe5992c9b...
```

When Redis is unavailable:
```bash
Connecting Redis client...
Failed to connect Redis client: Redis connection timeout
Disconnecting the Redis client...
Redis client disconnected.
Falling back to LRU handler because Redis client is not available.
Cache handlers configured: [0] LRU Handler (in-memory)
[Cache] LRU SET: ddaa617fe5992c9b...
[Cache] LRU HIT: ddaa617fe5992c9b...
```

### Custom Handler Features (`cache-handler.js`)

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

## Multi-Pod Behavior

### Pod Hostname Display

Every page shows the current pod's hostname at the top in a purple/blue banner:

```
Pod Hostname: nextjs-app-7d8f9c4b6-x5k2m
```

This helps you:
- Verify load balancing is working
- Debug pod-specific issues
- Monitor cache behavior per pod
- Understand traffic distribution

### Cache Behavior Across Pods

**With Redis (Shared Cache):**
- Pod A caches a page → stored in Redis
- Pod B receives next request → cache HIT from Redis
- All pods share the same cache
- Optimal performance and consistency

**Without Redis (LRU per-pod):**
- Pod A caches a page → stored in Pod A's memory
- Pod B receives next request → cache MISS, generates new
- Each pod has its own cache
- Still works, but less efficient

## Monitoring Cache Performance

### Cache Logs

The Neshca handler includes detailed logging for every cache operation:

```bash
# Startup logs show which handlers are active
Cache handlers configured: [0] Redis Handler, [1] LRU Handler (in-memory)

# Cache operations (Redis)
[Cache] Redis SET: /app-isr/page
[Cache] Redis HIT: /app-isr/page
[Cache] Redis MISS: /app-ssg/detail/123

# Cache operations (LRU fallback)
[Cache] LRU SET: /app-isr/page
[Cache] LRU HIT: /app-isr/page
[Cache] LRU MISS: /new-page

# Connection events
[Redis] Connected successfully
[Redis] Ready to accept commands
[Redis] Error: Connection timeout
```

### Kubernetes Monitoring

```bash
# View logs from all pods
kubectl logs -l app=nextjs-app -f

# View logs from specific pod
kubectl logs nextjs-app-xxx -f

# Check cache handler logs specifically
kubectl logs -l app=nextjs-app | grep "\[Cache\]"

# Monitor pod distribution
kubectl get pods -l app=nextjs-app -o wide
```

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

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `REDIS_URL` | No* | Redis connection string | `redis://localhost:6379` |
| `KV_URL` | No* | Alternative Redis connection string | `redis://redis-service:6379` |
| `PORT` | No | Server port (default: 3000, Dockerfile: 4000) | `4000` |

\* Either `REDIS_URL` or `KV_URL` required for Redis caching. Falls back to LRU in-memory if neither is set.

**Note:** No API keys or authentication tokens are required. The application uses the public JSONPlaceholder API which requires no configuration.

## Troubleshooting

### App Router Pages Hanging (ISR/SSG)

**Problem:** App Router pages hang during development, Pages Router works fine

**Solution:** This was caused by Redis connection timeout. Now fixed with 5-second timeout in cache handler.

```bash
# Before fix:
Connecting Redis client...
(hangs indefinitely)

# After fix:
Connecting Redis client...
Failed to connect Redis client: Redis connection timeout
Falling back to LRU handler because Redis client is not available.
✓ App loads successfully
```

### Redis Connection Issues

**Problem:** `Failed to connect Redis client: Redis connection timeout`

**Solutions:**
1. Verify Redis is running: `docker ps | grep redis`
2. Check Redis connection: `redis-cli ping` (should return `PONG`)
3. Verify `REDIS_URL` in `.env.local` or environment variables
4. For Kubernetes: Check service name and namespace

### Cache Not Working

**Problem:** Data always fresh, never cached

**Checklist:**
1. Verify cache handler is configured in `next.config.ts`
2. Check logs for cache handler initialization
3. Look for `[Cache] SET` and `[Cache] HIT` messages in logs
4. Ensure `revalidate` is set correctly in fetch options
5. Run in production mode (`yarn build && yarn start`)

### Pod Hostname Not Showing

**Problem:** Hostname not displayed at top of pages

**Solution:** The hostname is fetched server-side in the root layout. Ensure:
1. `utils/hostname.ts` exists
2. `components/PodHostname.tsx` is imported in `app/layout.tsx`
3. You're running the latest build

### Build Errors

**Problem:** Redis connection errors during `next build`

**Solution:** The Neshca handler automatically skips Redis during build (`NEXT_PHASE === PHASE_PRODUCTION_BUILD`). If using custom handler, ensure proper phase detection.

## Technologies Used

- **[Next.js 16.1+](https://nextjs.org/)** - React framework with App Router and Pages Router
- **[Redis](https://redis.io/)** - In-memory data store for distributed caching
- **[ioredis](https://github.com/redis/ioredis)** - Redis client for Node.js
- **[@neshca/cache-handler](https://github.com/caching-tools/next-shared-cache)** - Production-ready cache handler
- **[JSONPlaceholder](https://jsonplaceholder.typicode.com/)** - Free REST API for testing (5000 photos dataset)
- **[TailwindCSS 4](https://tailwindcss.com/)** - Modern utility-first CSS
- **[TypeScript](https://www.typescriptlang.org/)** - Full type safety
- **[Docker](https://www.docker.com/)** - Container platform for Redis and app
- **[Kubernetes](https://kubernetes.io/)** - Container orchestration for multi-pod deployment
- **[Amazon EKS](https://aws.amazon.com/eks/)** - Managed Kubernetes service

## Performance Characteristics

### With Redis (Multi-Pod Setup)

| Metric | Value |
|--------|-------|
| Cache Hit Time | ~2-5ms |
| Cache Miss (First Request) | ~100-500ms (API call) |
| Pod-to-Pod Consistency | 100% (shared cache) |
| Revalidation Behavior | Stale-while-revalidate |

### With LRU Fallback (Per-Pod)

| Metric | Value |
|--------|-------|
| Cache Hit Time | <1ms (in-memory) |
| Cache Miss Rate | Higher (separate caches) |
| Pod-to-Pod Consistency | Eventually consistent |
| Memory Usage | Configurable (default: 1000 items × 100MB max) |

## Learn More

- [Next.js Caching Documentation](https://nextjs.org/docs/app/building-your-application/caching)
- [Custom Cache Handler Guide](https://nextjs.org/docs/app/api-reference/next-config-js/incrementalCacheHandlerPath)
- [Redis Caching Patterns](https://redis.io/docs/manual/patterns/)
- [Neshca Cache Handler Docs](https://caching-tools.github.io/next-shared-cache/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Amazon EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Changelog

### v2.0.0 (2026-01-09)
- Added pod hostname display for multi-pod deployments
- Implemented 5-second Redis connection timeout
- Added comprehensive cache operation logging
- Configured LRU memory limits
- Fixed null handler filtering to prevent crashes
- Added Kubernetes deployment manifests for EKS
- Improved error handling and graceful degradation

### v1.0.0
- Initial release with Redis cache handler
- App Router and Pages Router examples
- Multiple caching strategies (SSG, ISR, SSR, Dynamic)
