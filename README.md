How to run
```
1. start redis on your docker
2. create .env.local at root project
2. yarn build
3. yarn start
```

`.env.local`
```powershell
DIRECTUS_HOST=http://directus-host
DIRECTUS_TOKEN=TOKEN

# Redis Configuration for Centralized Caching
# Format: redis://[:password@]host[:port][/db-number]
# Example: redis://localhost:6379
# Example with auth: redis://:mypassword@localhost:6379
# If not set, Next.js will fall back to default caching behavior
REDIS_URL=redis://localhost:6379
```
