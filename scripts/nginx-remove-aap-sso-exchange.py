#!/usr/bin/env python3
import re, io

path = "/etc/nginx/atuofuture-only.conf"
with io.open(path, "r", encoding="utf-8") as f:
    text = f.read()

# Remove the SSO-exchange location block (shared service-account auto-login gateway).
pattern = re.compile(
    r"\n[ \t]*location = /aso-aap/api/auth/sso/aspace \{.*?\n[ \t]*\}\n",
    re.S,
)
new_text, n = pattern.subn("\n", text)

if n == 0:
    print("NO_MATCH (already removed?)")
else:
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(new_text)
    print("REMOVED", n, "block(s)")
