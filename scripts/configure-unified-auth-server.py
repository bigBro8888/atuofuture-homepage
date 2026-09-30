#!/usr/bin/env python3
import io
import secrets

ENV_PATH = "/var/www/mydoc/atuofuture/.env"
NGINX_PATH = "/etc/nginx/atuofuture-only.conf"
FRAGMENT_PATH = "/tmp/nginx-unified-auth.conf.fragment"
MARKER = "# ---- Unified Auth gateway ----"


def ensure_env():
    with io.open(ENV_PATH, "r", encoding="utf-8") as source:
        text = source.read()
    existing = {
        line.split("=", 1)[0].strip()
        for line in text.splitlines()
        if line.strip() and not line.lstrip().startswith("#") and "=" in line
    }
    values = {
        "AUTH_PORT": "18088",
        "AUTH_HOST": "127.0.0.1",
        "AUTH_PUBLIC_ORIGIN": "http://47.103.102.65:18180",
        "AUTH_PORTAL_ORIGIN": "http://47.103.102.65:18180",
        "AUTH_BASE_PATH": "auth",
        "AUTH_ISSUER": "http://47.103.102.65:18180/auth",
        "AUTH_COOKIE_KEYS": f"{secrets.token_urlsafe(48)},{secrets.token_urlsafe(48)}",
        "AUTH_DATA_FILE": "/var/www/mydoc/atuofuture/auth/data/store.json",
        "AUTH_OIDC_DATA_FILE": "/var/www/mydoc/atuofuture/auth/data/oidc.json",
        "AUTH_JWKS_FILE": "/var/www/mydoc/atuofuture/auth/data/jwks.json",
    }
    additions = [f"{key}={value}" for key, value in values.items() if key not in existing]
    if additions:
        with io.open(ENV_PATH, "a", encoding="utf-8") as target:
            target.write("\n# Unified Auth\n" + "\n".join(additions) + "\n")


def ensure_nginx():
    with io.open(NGINX_PATH, "r", encoding="utf-8") as source:
        text = source.read()
    if MARKER in text:
        return
    with io.open(FRAGMENT_PATH, "r", encoding="utf-8") as source:
        fragment = source.read().strip()
    indented = "\n".join(f"        {line}" if line else "" for line in fragment.splitlines())
    anchor = "        location /api/public/uploads/ {"
    if anchor not in text:
        raise RuntimeError("Nginx insertion anchor not found")
    text = text.replace(anchor, f"        {MARKER}\n{indented}\n\n{anchor}", 1)
    with io.open(NGINX_PATH, "w", encoding="utf-8") as target:
        target.write(text)


if __name__ == "__main__":
    ensure_env()
    ensure_nginx()
    print("Unified Auth server configuration is ready")
