#!/usr/bin/env python3
import json
import copy

path = "/var/www/mydoc/atuofuture/server/data/store.json"

with open(path, "r", encoding="utf-8") as f:
    store = json.load(f)


def space_products(old_products, retail_aap=None):
    by_id = {p.get("id"): p for p in (old_products or []) if p.get("id")}
    order = [
        ("control-screen", "中控屏"),
        ("smart-door-sign", "智慧门牌"),
        ("e-table-sign", "电子桌牌"),
        ("desk-screen", "工位屏"),
        ("smart-lighting", "照明与空调"),
        ("sensor", "传感器"),
        ("aap", "RFID设备"),
        ("gateway", "网关产品"),
    ]
    out = []
    for pid, label in order:
        old = by_id.get(pid) or {}
        if pid == "smart-door-sign" and not old:
            donor = by_id.get("e-table-sign") or {}
            image = donor.get("imageUrl") or "/images/hardware/thumb-e-table-sign.png"
            href = "/hardware/product/?id=smart-door-sign"
        elif pid == "aap" and not old:
            donor = retail_aap or {}
            image = donor.get("imageUrl") or "/images/hardware/thumb-aap.png"
            href = "/hardware/product/?id=aap"
        else:
            image = old.get("imageUrl") or f"/images/hardware/thumb-{pid}.png"
            href = old.get("href") or f"/hardware/product/?id={pid}"
            if pid == "gateway":
                href = old.get("href") or "/hardware/product/?id=gateway"
        out.append({"id": pid, "label": label, "imageUrl": image, "href": href})
    return out


changed = False
for page in store.get("pageConfigs") or []:
    if page.get("pageKey") != "hardware":
        continue
    retail_aap = None
    for field in ("draftContent", "publishedContent"):
        content = page.get(field) or {}
        for g in content.get("navGroups") or []:
            if g.get("id") == "retail":
                for p in g.get("products") or []:
                    if p.get("id") == "aap":
                        retail_aap = p
    for field in ("draftContent", "publishedContent"):
        content = page.get(field) or {}
        groups = content.get("navGroups") or []
        new_groups = []
        for g in groups:
            g = copy.deepcopy(g)
            if g.get("id") == "space":
                g["products"] = space_products(g.get("products"), retail_aap)
                changed = True
            new_groups.append(g)
        content["navGroups"] = new_groups
        page[field] = content
    print("hardware page updated", page.get("id"))

if changed:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(store, f, ensure_ascii=False, indent=2)
    print("store saved")
else:
    print("no change")
