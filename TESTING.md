# Testing Guide - Custom Cache Handler (Redis) POC

สรุปรายการทดสอบสำหรับ POC Custom Cache Handler with Redis แบ่งตาม Router และ Concern ที่ต้องระวัง

---

## 📋 Quick Test Matrix

| Route Type | Path | Cache Type | Revalidate | Expected Behavior |
|-----------|------|-----------|-----------|------------------|
| **App Router - Page** | `/app-isr` | Page Cache | 300s | Cache HIT after first load |
| **App Router - Page** | `/app-ssg` | Static | Build time | Always cached |
| **App Router - API** | `/api/cached-fetch` | Data Cache | 60s | Fast response after first call |
| **App Router - API** | `/api/real-time` | None | force-dynamic | Always fresh (slow) |
| **App Router - Image** | `/gallery` | Image Cache | 300s | Images load instantly after first view |
| **Pages Router - Page** | `/page-static` | Page Cache | 60s | Cache HIT after first load |
| **Pages Router - SSR** | `/page-server` | None | SSR | Always fresh |
| **Pages Router - API** | N/A | None | N/A | Never cached |

---

## 1️⃣ App Router (app/*) - Priority: CRITICAL

### 1.1 Pages with ISR (Time-based Revalidation)

#### 🎯 Test Case: `/app-isr`
**Concern:** ต้องรองรับ Time-based revalidation

**Steps:**
1. เปิด `/app-isr` ครั้งแรก → จดเวลาที่ generate
2. Refresh หน้าซ้ำภายใน 300 วินาที → เวลาที่ generate ต้อง**เหมือนเดิม** (Cache HIT)
3. รอ 300+ วินาที → Refresh → เวลาที่ generate ต้อง**เปลี่ยน** (Revalidated)
4. เช็ค Network tab → Response time ต้อง < 50ms (ถ้า cached)

**Expected Results:**
- ✅ First request: ~200-500ms (MISS)
- ✅ Within 300s: < 50ms (HIT)
- ✅ After 300s: ~200-500ms (MISS, then cached again)
- ✅ Server logs: `[Cache] Redis SET` → `[Cache] Redis HIT`
- ✅ Redis: Key `nextjs-v7:/app-isr/page` exists with TTL

**Failure Signs:**
- ❌ เวลา generate เปลี่ยนทุกครั้ง → ไม่มี cache
- ❌ Server error: Connection timeout
- ❌ Redis shows no keys

---

#### 🎯 Test Case: `/app-isr/[slug]` (Dynamic Route)
**Concern:** Dynamic route ต้อง cache ได้ตาม slug

**Steps:**
1. เปิด `/app-isr/1` → จดเวลา
2. เปิด `/app-isr/2` → ต้องเป็น data คนละอันกับ #1
3. กลับไป `/app-isr/1` → เวลาต้องเหมือนเดิม (cached)
4. ยิง `/api/revalidate?tags=photos` → Purge cache
5. เปิด `/app-isr/1` อีกครั้ง → เวลาต้อง**เปลี่ยน**

**Expected Results:**
- ✅ แต่ละ slug cached แยกกัน
- ✅ Tag-based revalidation ทำงาน
- ✅ Redis keys: `nextjs-v7:/app-isr/1/page`, `nextjs-v7:/app-isr/2/page`

**Failure Signs:**
- ❌ ทุก slug ได้ data เดียวกัน
- ❌ Purge ไม่ทำงาน

---

### 1.2 Pages with SSG (Build-time Static)

#### 🎯 Test Case: `/app-ssg`
**Concern:** Pre-generated at build time, ควร cached ตลอด

**Steps:**
1. `yarn build` → ดูว่า pre-render สำเร็จ
2. `yarn start` → เปิด `/app-ssg`
3. Refresh หลายครั้ง → เวลา generate ต้อง**ไม่เปลี่ยน**
4. รอนาน ๆ → เวลาก็ยังไม่เปลี่ยน (ไม่มี revalidate)

**Expected Results:**
- ✅ Build output: `✓ /app-ssg (static)`
- ✅ Response time: < 10ms (fully static)
- ✅ เวลา generate ไม่เปลี่ยนเลย

**Failure Signs:**
- ❌ Build output: `ƒ /app-ssg` (dynamic symbol)
- ❌ เวลาเปลี่ยนบ้าง

---

### 1.3 API Route Handlers - Data Cache

#### 🎯 Test Case: `/api/cached-fetch`
**Concern:** fetch() ภายใน API ต้องถูก cache ตาม revalidate time

**Steps:**
1. เปิด `/api/cached-fetch` ครั้งแรก → ดู `duration` (ควร ~100-500ms)
2. Refresh ทันที → ดู `duration` (ควร < 10ms)
3. เช็ค `cached: true` field
4. รอ 60+ วินาที → Refresh → `cached: false`

**Expected Results:**
- ✅ First call: `duration: 150ms`, `cached: false`
- ✅ Subsequent: `duration: 3ms`, `cached: true`
- ✅ After 60s: `duration: 120ms`, `cached: false` → then cached again
- ✅ Server logs: `[Cache] Redis SET` for fetch cache

**Failure Signs:**
- ❌ Duration always > 100ms (not cached)
- ❌ `cached` always false

**Manual Verification:**
```bash
# Call multiple times
curl http://localhost:3000/api/cached-fetch
# Check duration field
```

---

#### 🎯 Test Case: `/api/real-time` (force-dynamic)
**Concern:** ต้อง**ไม่ถูก** cache เลย

**Steps:**
1. เปิด `/api/real-time` หลายครั้ง
2. ดู `duration` → ต้อง > 50ms ทุกครั้ง
3. ดู `requestId` → ต้องเปลี่ยนทุกครั้ง
4. ดู `cached` → ต้อง `false` ทุกครั้ง

**Expected Results:**
- ✅ Every request: `duration: 100-500ms`
- ✅ `cached: false` always
- ✅ `requestId` changes every time
- ✅ NO cache logs in server

**Failure Signs:**
- ❌ Duration < 50ms (accidentally cached!)
- ❌ Same `requestId` on refresh

---

### 1.4 Next Image Component - Binary Cache

#### 🎯 Test Case: `/gallery`
**Concern:** ระวัง JSON.stringify Buffer, ควร handle Buffer → Base64

**Steps:**
1. เปิด `/gallery` ครั้งแรก → รูปทั้งหมดโหลดได้
2. เช็ค Network tab → ดู `/_next/image?url=...` requests
3. Refresh → รูปโหลดเร็วขึ้น (cached)
4. เช็ค server logs → ต้อง**ไม่มี** error เรื่อง Buffer

**Expected Results:**
- ✅ All 12 images load successfully
- ✅ No console errors
- ✅ Server logs: NO "Cannot stringify Buffer" error
- ✅ Server logs: `[Cache]` entries for image optimization
- ✅ Network: Image requests fast after first load

**Failure Signs:**
- ❌ Server crash with "TypeError: Cannot stringify Buffer"
- ❌ Images show broken icon (□)
- ❌ Redis errors in logs
- ❌ Memory spike (Buffer not compressed)

**Manual Verification:**
```bash
# Check Redis for image keys
redis-cli KEYS "nextjs-v7:*image*"

# Check if data is Base64 (not raw buffer)
redis-cli GET "nextjs-v7:<some-image-key>" | head -c 100
# Should see Base64 string, NOT binary garbage
```

**Code to Verify:**
- Check `cache-handler-v4.js` lines 229-263
- Verify `parseBuffersToStrings()` is called
- Verify `convertStringsToBuffers()` is called

---

## 2️⃣ Pages Router (pages/*) - Priority: MEDIUM

### 2.1 Pages with getStaticProps (ISR)

#### 🎯 Test Case: `/page-static`
**Concern:** ISR ใช้ Cache Handler เดียวกันกับ App Router

**Steps:**
1. เปิด `/page-static` → จดเวลา
2. Refresh ภายใน 60 วินาที → เวลาเหมือนเดิม
3. รอ 60+ วินาที → เวลาเปลี่ยน

**Expected Results:**
- ✅ Same behavior as App Router ISR
- ✅ Redis keys exist
- ✅ Cache HIT/MISS pattern same as `/app-isr`

---

### 2.2 Pages with getServerSideProps (SSR)

#### 🎯 Test Case: `/page-server`
**Concern:** SSR ไม่ควรถูก cache

**Steps:**
1. เปิด `/page-server` หลายครั้ง
2. เวลา generate ต้อง**เปลี่ยนทุกครั้ง**
3. Response time > 100ms ทุกครั้ง

**Expected Results:**
- ✅ Always fresh data
- ✅ No cache logs for this route
- ✅ Redis has NO keys for `/page-server`

**Failure Signs:**
- ❌ เวลาไม่เปลี่ยน (accidentally cached)

---

### 2.3 API Routes (pages/api/*)

#### 🎯 Test Case: API Routes ไม่ผ่าน Cache Handler
**Concern:** Pages Router API ทำงานเป็น serverless function ธรรมดา

**Note:** ไม่มีตัวอย่างใน repo นี้ แต่ถ้าสร้าง:

**Expected:**
- ✅ ทำงานปกติ (no cache involved)
- ✅ NO cache logs
- ✅ ไม่ต้อง config cache handler

---

## 3️⃣ Infrastructure & General - Priority: HIGH

### 3.1 Redis Connection & Fallback

#### 🎯 Test Case: Redis Available
**Steps:**
1. `docker-compose up -d redis`
2. `yarn dev`
3. Check logs: `[CacheHandler] Connected to Redis.`
4. เทสหน้าต่าง ๆ → ต้อง cache ลง Redis

**Expected:**
- ✅ Log: "Connected to Redis"
- ✅ Log: `[Cache] Redis SET`, `[Cache] Redis HIT`
- ✅ `redis-cli KEYS "nextjs-v7:*"` → มี keys

---

#### 🎯 Test Case: Redis NOT Available (LRU Fallback)
**Steps:**
1. `docker-compose stop redis` (ปิด Redis)
2. `yarn dev`
3. Check logs: `Failed to connect to Redis` + `Falling back to LRU handler`
4. เทสหน้าต่าง ๆ → ต้องทำงานได้ (ใช้ in-memory)

**Expected:**
- ✅ Log: "Failed to connect Redis client"
- ✅ Log: `[Cache] LRU SET`, `[Cache] LRU HIT`
- ✅ App ยังทำงานได้ปกติ
- ✅ NO errors, NO crashes

**Failure Signs:**
- ❌ App hangs forever
- ❌ Timeout > 5 seconds
- ❌ Crashes with connection error

---

### 3.2 Data Structure & Compression

#### 🎯 Test Case: Gzip Compression
**Concern:** ประหยัดพื้นที่ Redis

**Steps:**
```bash
# Check if data is compressed
redis-cli GET "nextjs-v7:/app-isr/page" | wc -c

# Should be Base64 string (compressed)
# Raw JSON would be much larger
```

**Expected:**
- ✅ Stored value is Base64 string
- ✅ Smaller than raw JSON (compression working)

**Code to Check:**
- `cache-handler-v4.js` lines 190-192 (gzip)
- `cache-handler-v4.js` lines 110-112 (gunzip)

---

#### 🎯 Test Case: Buffer Handling
**Concern:** ไม่ให้ JSON.stringify Buffer โดยตรง

**Verification:**
1. เปิด `/gallery` (loads images)
2. Check server logs → NO errors
3. Check `parseBuffersToStrings()` is called (line 182)
4. Check `convertStringsToBuffers()` is called (line 117)

**Expected:**
- ✅ Buffers converted to Base64 before JSON.stringify
- ✅ Base64 converted back to Buffer on retrieval
- ✅ NO "Cannot stringify" errors

---

### 3.3 Key Management & TTL

#### 🎯 Test Case: Key Naming Convention
**Steps:**
```bash
redis-cli KEYS "nextjs-v7:*"
```

**Expected:**
- ✅ Keys have `nextjs-v7:` prefix
- ✅ Easy to identify (e.g., `nextjs-v7:/app-isr/page`)
- ✅ Implicit tags: `nextjs-v7:__revalidated_tags__`

---

#### 🎯 Test Case: TTL (Time To Live)
**Steps:**
```bash
# Set ISR page with revalidate: 300
# Check TTL
redis-cli TTL "nextjs-v7:/app-isr/page"
# Should show ~300 seconds or less
```

**Expected:**
- ✅ TTL set correctly based on `lifespan.expireAt`
- ✅ Key auto-expires after TTL
- ✅ New request regenerates cache

**Code to Check:**
- `cache-handler-v4.js` lines 195-200 (EXAT)

---

### 3.4 Tag-based Revalidation

#### 🎯 Test Case: Purge by Tag
**Concern:** On-demand revalidation ต้องทำงาน

**Steps:**
1. เปิด `/app-isr` (uses tag: `photos`)
2. จดเวลา generate
3. ยิง `GET /api/revalidate?tags=photos`
4. Refresh `/app-isr` → เวลาต้อง**เปลี่ยน**

**Expected:**
- ✅ API response: `{ revalidated: true, results: [...] }`
- ✅ Server log: `[API] Revalidated tag: photos`
- ✅ Next request: Cache MISS → regenerate
- ✅ Redis: `__revalidated_tags__` hash updated

**Verification:**
```bash
redis-cli HGET "nextjs-v7:__revalidated_tags__" "photos"
# Should show timestamp
```

---

#### 🎯 Test Case: Purge by Path
**Steps:**
1. เปิด `/app-isr`
2. ยิง `GET /api/revalidate?path=/app-isr`
3. Refresh → ข้อมูลเปลี่ยน

**Expected:**
- ✅ Path-based purge works
- ✅ Only that path revalidated

---

## 4️⃣ Multi-Pod Scenarios (Kubernetes/EKS) - Priority: MEDIUM

### 4.1 Shared Cache Across Pods

#### 🎯 Test Case: Pod A caches, Pod B hits
**Setup:** Deploy to K8s with 3 replicas

**Steps:**
1. Request `/app-isr` → goes to Pod A (check hostname)
2. Pod A caches to Redis
3. Request again → might go to Pod B
4. Pod B should get cache HIT from Redis

**Expected:**
- ✅ All pods show same generated time (shared cache)
- ✅ Logs from different pods show `Redis HIT`
- ✅ Consistent data across all pods

**Failure Signs:**
- ❌ Each pod shows different time (separate caches)
- ❌ Logs show `LRU HIT` instead of `Redis HIT`

**Manual Test:**
```bash
# Hit endpoint multiple times
for i in {1..20}; do
  curl -s http://<load-balancer>/app-isr | grep "Generated at"
done

# All should show SAME timestamp (if within revalidate window)
```

---

## 5️⃣ Admin & Monitoring Tools - Priority: LOW

### 5.1 Interactive Revalidation UI

#### 🎯 Test Case: `/admin` page
**Steps:**
1. เปิด `/admin`
2. กรอก path `/app-isr` → กด Purge
3. ตรวจสอบ response แสดงผลสำเร็จ
4. เปิด `/app-isr` → ข้อมูลเปลี่ยน

**Expected:**
- ✅ UI ใช้งานได้ง่าย
- ✅ แสดง success message
- ✅ Cache purge ทำงานจริง

---

### 5.2 Cache Statistics Page

#### 🎯 Test Case: `/stats` page
**Steps:**
1. เปิด `/stats`
2. ดู Cache keys, metrics

**Expected:**
- ✅ แสดง Redis connection status
- ✅ แสดง cache keys ที่มีอยู่
- ✅ แสดง metrics (ถ้ามี)

---

## 📊 Test Execution Checklist

### Local Development
- [ ] Redis running: `docker-compose up -d redis`
- [ ] App running: `yarn dev`
- [ ] All App Router pages work
- [ ] All Pages Router pages work
- [ ] All API routes work
- [ ] Image gallery loads without errors
- [ ] Tag-based revalidation works
- [ ] Path-based revalidation works

### Production Build
- [ ] `yarn build` succeeds
- [ ] No build-time Redis errors
- [ ] Static pages pre-rendered
- [ ] `yarn start` works
- [ ] All caching behaviors same as dev

### Without Redis (Fallback)
- [ ] Stop Redis: `docker-compose stop redis`
- [ ] App starts successfully (no hang)
- [ ] LRU cache logs appear
- [ ] Pages work (slower, per-pod cache)
- [ ] No errors or crashes

### Multi-Pod (K8s)
- [ ] Deploy to K8s with 3 replicas
- [ ] All pods healthy
- [ ] Load balancer distributes traffic
- [ ] Cache shared across pods
- [ ] Pod hostname visible on pages
- [ ] Consistent cache behavior

---

## 🚨 Common Issues & Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| **Cache not working** | Data always fresh | Check `next.config.ts` has `cacheHandler` |
| **Redis timeout** | App hangs on startup | Check Redis is running, check REDIS_URL |
| **Buffer stringify error** | Image pages crash | Verify `parseBuffersToStrings()` is called |
| **Tag purge not working** | Data doesn't refresh after purge | Check tag names match |
| **Per-pod cache** | Each pod different time | Check Redis connection (might be using LRU) |
| **Build errors** | Redis connection during build | Handler should skip Redis in build phase |

---

## 📝 Test Report Template

```markdown
## Test Execution Report

**Date:** YYYY-MM-DD
**Tester:** [Name]
**Environment:** Local / K8s / EKS
**Redis:** Available / Unavailable

### Test Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| `/app-isr` cache | ✅ / ❌ | |
| `/api/cached-fetch` | ✅ / ❌ | |
| `/gallery` images | ✅ / ❌ | |
| Tag revalidation | ✅ / ❌ | |
| Redis fallback | ✅ / ❌ | |
| Multi-pod cache | ✅ / ❌ | |

### Issues Found
1. [Description]
2. [Description]

### Screenshots
- [Attach screenshots of errors, logs, etc.]
```

---

## 🎯 Success Criteria

POC ถือว่า**ผ่าน**เมื่อ:

1. ✅ ทุกหน้าใน App Router cache ได้ถูกต้อง
2. ✅ API routes cache ตามที่กำหนด (cached-fetch) และไม่ cache ตามที่กำหนด (real-time)
3. ✅ Image optimization ไม่ error
4. ✅ Tag-based และ Path-based revalidation ทำงาน
5. ✅ Redis พัง → Fallback to LRU สำเร็จ (ไม่ crash)
6. ✅ Multi-pod → Cache shared ผ่าน Redis
7. ✅ ไม่มี memory leak, ไม่มี Buffer errors
8. ✅ Build succeeds, production mode works

---

**ใช้เอกสารนี้ร่วมกับ automated test script (`test-cache.sh`) สำหรับ QA ที่สมบูรณ์ครับ!**
