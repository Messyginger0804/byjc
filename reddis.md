Heck yeah—we can drop **Redis** into your stack and add a tiny **gatekeeper** service so your blog can “ping” the AI **only when you flip it on**, with a simple shared-secret and rate-limit. You’ll get a clean endpoint like:

* Public WebUI: `https://<ngrok>/`
* Public Ollama (unchanged): `https://<ngrok>/ollama/...`
* **Blog-only AI** (guarded): `https://<ngrok>/blogbot/...`  ← behind Redis toggle + rate limit

Below are the exact files + commands.

---

# 1) Add services to your compose

Append these to `~/ai-stack/docker-compose.yml` (keep your existing services):

```yaml
  redis:
    image: redis:7-alpine
    container_name: redis
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks: [ai_net]

  gate:
    build:
      context: ./gatekeeper
    container_name: gate
    environment:
      - REDIS_URL=redis://redis:6379/0
      - OLLAMA_BASE=http://ollama:11434
      - SHARED_SECRET=${BLOG_GATE_SECRET:-change-me}
      - RATE_PER_MIN=30           # allow N req/min (tune as you like)
    depends_on:
      - redis
      - ollama
    expose:
      - "8001"
    restart: unless-stopped
    networks: [ai_net]

volumes:
  redis_data:
```

> Tip: Put `BLOG_GATE_SECRET=<a-long-random-string>` into `~/ai-stack/.env` so compose injects it automatically.

---

# 2) Create the gatekeeper service

**Folder:** `~/ai-stack/gatekeeper`

`Dockerfile`

```dockerfile
FROM python:3.11-slim
WORKDIR /app
RUN pip install --no-cache-dir fastapi uvicorn httpx redis "numpy<2"
COPY app.py /app/app.py
ENV PYTHONUNBUFFERED=1
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001"]
```

`app.py` (minimal, does toggle, rate-limit, and proxies to Ollama)

```python
import os, time
from typing import Optional
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.responses import PlainTextResponse, StreamingResponse, JSONResponse
import httpx, redis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
OLLAMA_BASE = os.getenv("OLLAMA_BASE", "http://localhost:11434")
SHARED_SECRET = os.getenv("SHARED_SECRET", "change-me")
RATE_PER_MIN = int(os.getenv("RATE_PER_MIN", "30"))

r = redis.Redis.from_url(REDIS_URL, decode_responses=True)
app = FastAPI(title="Blog Gate", version="0.1.0")

def require_secret(req: Request):
    if req.headers.get("x-api-key") != SHARED_SECRET:
        raise HTTPException(status_code=401, detail="missing/invalid x-api-key")

def is_open() -> bool:
    return r.get("blog:open") == "1"

def rate_ok(bucket="blog", limit=RATE_PER_MIN):
    key = f"rl:{bucket}:{time.strftime('%Y%m%d%H%M')}"  # per minute
    n = r.incr(key)
    if n == 1:
        r.expire(key, 90)  # 1.5 min TTL buffer
    return n <= limit

@app.get("/healthz")
def health():
    return {"ok": True, "open": is_open()}

@app.post("/admin/toggle")
def toggle(open: int, request: Request):
    require_secret(request)
    r.set("blog:open", "1" if open else "0")
    return {"open": is_open()}

async def proxy_to_ollama(request: Request, subpath: str):
    # Gate: require enabled + rate limit + secret
    require_secret(request)
    if not is_open():
        raise HTTPException(status_code=403, detail="gate closed")
    if not rate_ok():
        raise HTTPException(status_code=429, detail="rate limit")

    # Build upstream URL
    url = f"{OLLAMA_BASE}/{subpath}"
    method = request.method.upper()
    headers = dict(request.headers)
    headers.pop("host", None)  # upstream sets host

    # Stream everything through (incl. SSE)
    async with httpx.AsyncClient(timeout=None) as client:
        if method in ("POST", "PUT", "PATCH"):
            body = await request.body()
            upstream = await client.stream(method, url, headers=headers, content=body)
        else:
            upstream = await client.stream(method, url, headers=headers, params=dict(request.query_params))

        def gen():
            with upstream:
                for chunk in upstream.iter_bytes():
                    yield chunk

        # mirror status & headers minimally
        filtered_headers = {k:v for k,v in upstream.headers.items()
                            if k.lower() not in ("content-encoding", "transfer-encoding", "connection")}
        return StreamingResponse(gen(), status_code=upstream.status_code, headers=filtered_headers)

# Catch-all under /api/* for Ollama endpoints (generate, chat, tags, etc.)
@app.api_route("/api/{subpath:path}", methods=["GET","POST","PUT","PATCH","DELETE","OPTIONS"])
async def api_proxy(subpath: str, request: Request):
    return await proxy_to_ollama(request, f"api/{subpath}")
```

---

# 3) Point nginx to the gate

Append this **new** block to your `~/ai-stack/nginx.conf` server section (keep your existing `/`, `/api/` and `/ollama/` blocks):

```nginx
    # -------- Blog-only guarded endpoint (Redis toggle + rate limit) --------
    # Blog calls:  https://<ngrok>/blogbot/api/<...>  with header X-Api-Key: <secret>
    location /blogbot/ {
      proxy_pass http://gate:8001/;   # NOTE trailing slash strips /blogbot
      proxy_http_version 1.1;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;

      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection $connection_upgrade;

      proxy_buffering off;
      proxy_read_timeout 3600s;
      proxy_send_timeout 3600s;
    }
```

Reload nginx:

```bash
docker exec -it reverse nginx -t && docker exec -it reverse nginx -s reload
```

---

# 4) Bring it up

```bash
# (optional) create .env with BLOG_GATE_SECRET=<super-long-random>
echo "BLOG_GATE_SECRET=$(openssl rand -hex 24)" | tee -a ~/ai-stack/.env

# build and start new services
docker compose -f ~/ai-stack/docker-compose.yml up -d --build gate redis

# check health
docker logs gate --since=1m
```

---

# 5) Use it

Get your current ngrok URL:

```bash
NGURL=$(docker logs ngrok --since=10m 2>&1 | grep -Eo 'https://[a-z0-9-]+\.ngrok-free\.app' | tail -1)
echo "$NGURL"
SECRET=$(grep BLOG_GATE_SECRET ~/ai-stack/.env | cut -d= -f2)
```

**Open the gate (allow traffic)**

```bash
curl -s -X POST -H "X-Api-Key: $SECRET" "$NGURL/blogbot/admin/toggle?open=1"
# => {"open": true}
```

**Call the guarded AI (blog would do this)**

```bash
# list models via gate → proxied to Ollama
curl -s -H "X-Api-Key: $SECRET" "$NGURL/blogbot/api/tags" | jq .

# generate (streaming)
curl -sN -H "X-Api-Key: $SECRET" "$NGURL/blogbot/api/generate" \
  -d '{"model":"llama3:latest","prompt":"Say hello from the blog","stream":true}'
```

**Close the gate (block traffic)**

```bash
curl -s -X POST -H "X-Api-Key: $SECRET" "$NGURL/blogbot/admin/toggle?open=0"
# => {"open": false}

# now this will 403
curl -i -H "X-Api-Key: $SECRET" "$NGURL/blogbot/api/tags"
```

Rate limit is default **30 req/min** — tune via `RATE_PER_MIN` env.

---

## How your blog should “ping”

* Use `POST https://<ngrok>/blogbot/api/generate` (or any Ollama path under `/blogbot/api/*`)
* Add header: `X-Api-Key: <your BLOG_GATE_SECRET>`
* Optional: only show the widget/button on your site when `/blogbot/healthz` reports `"open": true`

If/when you want queued processing (publish events → worker consumes from Redis and calls Ollama later), we can add a tiny **worker** service that listens on a Redis list/stream — but the above gets you a secure, togglable, rate-limited **on-demand** endpoint right now.

Want me to also add CORS rules for browser calls from a specific domain? Or set a daily schedule to auto-open/close the gate?
