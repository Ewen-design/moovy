# moovy

SvelteKit app for browsing movies, backed by the TVDB API.

## Development

```bash
npm install
echo "TVDB_API_KEY=your-key" > .env
npm run dev          # http://localhost:5173
```

## Production (Docker)

Single image, single container — nginx in front of the SvelteKit Node server
(`adapter-node`), both supervised by `tini` inside one process group.

The container joins the external `pangolin` network and publishes **no host
port**: only the reverse proxy (Traefik) can reach it, on port `8080`.
TLS, WAF (CrowdSec) and HSTS live at the Traefik layer.

The compose file references the image **published by CI** — the host never
builds from source:

```bash
cp .env.example .env        # fill TVDB_API_KEY and ORIGIN (https public URL)
docker compose pull && docker compose up -d
```

Deploys/rollbacks: set `MOOVY_TAG` to a `sha-…` tag for an immutable deploy
(`latest` follows main). Tear down with `docker compose down`.

Local build without CI:

```bash
docker build -f docker/Dockerfile -t ghcr.io/ewen-design/moovy:local .
MOOVY_TAG=local docker compose up -d
```

Local test without Traefik: `docker network create pangolin` once, then reach
the app from inside the network, e.g.
`docker run --rm --network pangolin curlimages/curl -sI http://moovy:8080/healthz`.

Note: the `.dockerignore` lives next to the Dockerfile
(`docker/Dockerfile.dockerignore`) — that is BuildKit's per-Dockerfile
sidecar form, looked up before the context root `.dockerignore`. It is the
right pattern when the Dockerfile is not at the repo root, and everything
here (compose v2, buildx, CI) builds through BuildKit.

### Files

```
.
├── compose.yaml             # Orchestration (root)
├── .env.example             # Runtime env vars (root)
└── docker/
    ├── Dockerfile           # Multi-stage Alpine build
    ├── Dockerfile.dockerignore
    ├── nginx.conf           # Reverse proxy in front of 127.0.0.1:3000
    └── entrypoint.sh        # tini-supervised launcher for nginx + node
```

### Hardening

Image (supply chain + attack surface):

- Base image pinned by tag **and digest** — refresh with
  `docker buildx imagetools inspect node:<tag>`
- `apk upgrade` at build + version-pinned `nginx`/`tini`
- Multi-stage build; only the runtime stage ships, dev deps pruned,
  `--ignore-scripts` on `npm ci`
- `npm`/`npx`/`corepack` **and `apk` itself** removed from the runtime layer
- All setuid/setgid bits stripped
- Non-root UID/GID `10001`, `/sbin/nologin` shell
- `NODE_OPTIONS=--disable-proto=delete` (prototype-pollution mitigation)
- `nginx -t` validated at build time
- `tini -g` as PID 1 — signal forwarding to nginx + node, zombie reaping;
  the container exits (→ restart) as soon as either process dies
- Healthcheck via `/healthz` exposed by nginx

Runtime (compose):

- `read_only` rootfs + tmpfs `/tmp` (nginx writes only here — paths overridden in `nginx.conf`)
- All Linux capabilities dropped (`cap_drop: ALL`), `no-new-privileges: true`
- No published port — the container is only reachable through the shared
  `pangolin` docker network (published ports would bypass host firewalls
  via Docker's iptables rules)
- Secret can be supplied as a file (`TVDB_API_KEY_FILE`, see commented
  `secrets:` blocks in `compose.yaml`) so it never appears in `docker inspect`
- pids/memory/cpu limits + `nofile` ulimit, `stop_grace_period`
- Rotated json-file logs (10 MB × 3)

nginx config:

- Security headers on **every** response via `snippets/security-headers.conf`
  included per location (nginx drops inherited `add_header` as soon as a
  location defines its own — a classic silent failure)
- `Content-Security-Policy`: `object-src 'none'`, `base-uri 'self'`,
  `form-action 'self'`, `frame-ancestors 'self'`; inline script/style allowed
  (required by SvelteKit hydration), images restricted to https
- `server_tokens off`; `Server`/`X-Powered-By`/upstream `Cache-Control` stripped
- Per-IP rate limit: 30 r/s dynamic, 200 r/s static (no unthrottled path
  to the upstream) + connection limit (20) — keyed on the **real client IP**
  via `set_real_ip_from` (private ranges = the docker network Traefik sits
  on); without it every visitor would share Traefik's IP and one bucket
- Anti-slowloris timeouts, capped header buffers, `client_max_body_size 1m`
- gzip on text/JSON/SVG/wasm/fonts
- Long cache on `/_app/immutable/`, short cache on other static assets
- Hidden files (`/.git`, dotfiles) blocked

### CI / publication

`.github/workflows/ci.yml` — two parallel jobs:

- **quality**: `npm ci --ignore-scripts` (blocks postinstall supply-chain
  payloads), prettier + eslint, `npm audit` gate on production deps
  (high+), svelte-check — all blocking; formatting is applied locally by
  the pre-commit hook (`.githooks/`), CI only verifies
- **image**: buildx build (GHA layer cache), smoke test of the running
  container (`/healthz`, CSP header, page 200), trivy scan gating on
  CRITICAL/HIGH fixable CVEs, then push to `ghcr.io/ewen-design/moovy`
  (`latest` + `sha-…`, provenance `mode=max` + SBOM attestations) —
  push skipped on PRs, so fork PRs run the full pipeline harmlessly.
  After the push, a signed webhook (HMAC GitHub-style) notifies **Komodo**
  which pulls and redeploys — configured via the repo variable
  `KOMODO_WEBHOOK_URL` and the repo secret `KOMODO_WEBHOOK_SECRET`
  (must match the procedure's webhook secret in Komodo)

Hardening of the pipeline itself: zero default `permissions` (granted
per job), actions pinned by commit SHA, no untrusted event input
interpolated in `run:` blocks, concurrency cancellation on PRs.

Base image freshness, two mechanisms:

- `.github/dependabot.yml` bumps the digest-pinned `NODE_IMAGE` weekly
  (plus the SHA-pinned actions and npm deps); CI validates each PR
- a **monthly scheduled rebuild** republishes even without a bump, with
  `no-cache` forced — otherwise the GHA cache would replay the stale
  `apk upgrade` layer and the rebuild would be a no-op

### Notes

- The SvelteKit API route reads `TVDB_API_KEY` from `$env/dynamic/private` so the
  secret is never baked into the bundle — it must be provided at runtime.
- `ORIGIN` must match the public URL or SvelteKit will reject form POSTs.
- nginx forwards the `X-Forwarded-Proto` it receives from Traefik (TLS
  terminates there); `Strict-Transport-Security` belongs at the Traefik layer.
- CrowdSec must parse the **Traefik** logs (the only layer that sees the
  public client IP directly).
- `/api/movies` is bounded: max 150 titles per request, in-memory cache
  capped at 1000 entries (FIFO eviction).

## License

See [LICENSE](LICENSE).
