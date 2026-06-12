# syntax=docker/dockerfile:1.7

# Pinned by tag AND digest — tags are mutable, digests are not (supply chain).
# Refresh with: docker buildx imagetools inspect node:<tag>
ARG NODE_IMAGE=node:22.22.3-alpine3.24@sha256:9385cd9f3001dfc3431e8ead12c43e9e1f87cc1b9b5c6cfd0f73865d405b27c4

# ---------- Stage 1: dependencies ----------
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund --ignore-scripts

# ---------- Stage 2: build ----------
FROM ${NODE_IMAGE} AS build
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build \
 && npm prune --omit=dev --no-audit --no-fund

# ---------- Stage 3: runtime (nginx + node in one image) ----------
FROM ${NODE_IMAGE} AS runtime

ENV NODE_ENV=production \
    HOST=127.0.0.1 \
    PORT=3000 \
    NODE_OPTIONS="--disable-proto=delete"

RUN apk upgrade --no-cache \
 && apk add --no-cache 'nginx=~1.30' 'tini=~0.19' \
 && addgroup -S -g 10001 app \
 && adduser  -S -G app -u 10001 -h /app -s /sbin/nologin app \
 && rm -f /etc/nginx/http.d/default.conf /etc/nginx/nginx.conf \
 # COPY --chmod=0644 would also strip the x bit on the dir it creates
 && mkdir -p -m 755 /etc/nginx/snippets \
 # default compile-time error log (/var/lib/nginx/logs → /var/log/nginx) must
 # be reachable and writable by the unprivileged user before the config is read
 && chmod 711 /var/lib/nginx \
 && ln -sf /dev/stderr /var/log/nginx/error.log \
 # shrink attack surface: no package manager, no npm tooling at runtime
 && rm -rf /var/cache/apk/* /tmp/* \
           /usr/local/lib/node_modules/npm \
           /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
           /sbin/apk /etc/apk /lib/apk /usr/share/apk /var/lib/apk \
 # strip setuid/setgid bits (defense in depth with no-new-privileges)
 && find / -xdev -type f -perm /6000 -exec chmod a-s {} + 2>/dev/null || true \
 # re-assert /tmp mode: the OCI export of the buildx container driver can
 # record this layer's /tmp entry without the sticky/world-writable bits
 && chmod 1777 /tmp

WORKDIR /app

COPY --from=build --chown=app:app /app/build         ./build
COPY --from=build --chown=app:app /app/node_modules  ./node_modules
COPY --from=build --chown=app:app /app/package.json  ./package.json
COPY --chown=root:root --chmod=0644 docker/nginx.conf            /etc/nginx/nginx.conf
COPY --chown=root:root --chmod=0644 docker/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --chown=root:root --chmod=0755 docker/entrypoint.sh         /usr/local/bin/entrypoint.sh

RUN nginx -t -c /etc/nginx/nginx.conf

USER 10001:10001
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null 2>&1 || exit 1

STOPSIGNAL SIGTERM
ENTRYPOINT ["/sbin/tini", "-g", "--", "/usr/local/bin/entrypoint.sh"]
