#!/usr/bin/env python3
"""Audit or embed clean previews of public-domain DEK SVGs for offline use.

The files are downloaded once at build-maintenance time and stored as data URLs in
web/content.json. The Android application never fetches imagery from the network.
"""
from __future__ import annotations

import argparse
import base64
import json
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web" / "content.json"
MANIFEST = ROOT / "web" / "svg_sources.json"
FILE_PREFIX = "DEK Deutsche Einheitskurzschrift - Verkehrsschrift - "
API = "https://commons.wikimedia.org/w/api.php"

# Labels that use punctuation or an explanation in Stenopfad rather than a
# straightforward Wikimedia file name. Candidates are tried in this order.
ALIASES = {
    "ss/ß": ["ss, ß", "ss,ß", "ss-ß", "ss ß"],
    "t (beide Formen)": ["t (beide Formen)", "t beide Formen", "t"],
    "ei/ai": ["ei/ai", "ei (ai)", "ei, ai", "ei"],
    "kann(st)": ["kann(st)", "kann", "kannst"],
}


def candidates(label: str) -> list[str]:
    return [label, *ALIASES.get(label, [])]


def api_query(params: dict[str, str]) -> dict:
    request = Request(
        API + "?" + urlencode({"format": "json", **params}),
        headers={"User-Agent": "Stenopfad-source-audit/1.0 (offline learning app)"},
    )
    with urlopen(request, timeout=20) as response:
        return json.loads(response.read().decode("utf-8"))


def image_info(title: str) -> tuple[str, str] | None:
    """Return rendered preview and resolved file page for a Commons file title."""
    try:
        payload = api_query({
            "action": "query", "redirects": "1", "titles": title,
            "prop": "imageinfo", "iiprop": "url|extmetadata", "iiurlwidth": "1600",
        })
    except Exception:
        return None
    pages = payload.get("query", {}).get("pages", {})
    page = next(iter(pages.values()), {})
    info = (page.get("imageinfo") or [{}])[0]
    preview = info.get("thumburl")
    metadata = info.get("extmetadata") or {}
    license_text = " ".join(str(item.get("value", "")) for item in metadata.values()).lower()
    if not preview or "public domain" not in license_text:
        return None
    return preview, "https://commons.wikimedia.org/wiki/" + page.get("title", title).replace(" ", "_")


def search_titles(candidate: str) -> list[str]:
    """Find exact label files even when the collection uses an internal prefix."""
    try:
        payload = api_query({
            "action": "query", "list": "search", "srnamespace": "6", "srlimit": "20",
            "srsearch": f'incategory:"SVG Deutsche Einheitskurzschrift" intitle:"{candidate}" intitle:"Verkehrsschrift"',
        })
    except Exception:
        return []
    suffix = f" - {candidate}.svg".lower()
    return [item["title"] for item in payload.get("query", {}).get("search", []) if item["title"].lower().endswith(suffix)]


def fetch(label: str) -> tuple[str, str, str] | None:
    """Return rendered preview URL, Commons file-page URL and matched label.

    Commons limits bulk access to original SVG uploads. Its API provides a rendered
    thumbnail URL for every vector file, which is exactly what an image-only offline
    app needs and is the documented low-impact access path.
    """
    for candidate in dict.fromkeys(candidates(label)):
        title = f"File:{FILE_PREFIX}{candidate}.svg"
        info = image_info(title)
        if info:
            return *info, candidate
        for found_title in search_titles(candidate):
            info = image_info(found_title)
            if info:
                return *info, candidate
    return None


def audit(cards: list[dict]) -> tuple[dict[str, tuple[str, str, str]], list[str]]:
    found: dict[str, tuple[str, str, str]] = {}
    missing: list[str] = []
    for card in cards:
        result = fetch(card["label"])
        if result:
            found[card["id"]] = result
            print(f"OK   {card['id']:8} {card['label']}", flush=True)
        else:
            missing.append(card["label"])
            print(f"MISS {card['id']:8} {card['label']}", flush=True)
    return found, missing


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--embed", action="store_true", help="write clean SVG previews into web/content.json")
    parser.add_argument("--allow-missing", action="store_true", help="embed only verified individual files and retain the official scan for the rest")
    parser.add_argument("--sample-dir", type=Path, help="optionally write fetched preview PNGs for visual review")
    parser.add_argument("--offset", type=int, default=0, help="first card index to audit (for rate-friendly batches)")
    parser.add_argument("--limit", type=int, default=10000, help="number of cards to audit (for rate-friendly batches)")
    args = parser.parse_args()

    data = json.loads(CONTENT.read_text(encoding="utf-8"))
    cards = data["cards"][args.offset:args.offset + args.limit]
    if not cards:
        raise SystemExit("Keine Karten im gewählten Bereich.")
    found, missing = audit(cards)
    if args.sample_dir:
        args.sample_dir.mkdir(parents=True, exist_ok=True)
        for card_id, (preview, _, _) in found.items():
            with urlopen(Request(preview, headers={"User-Agent": "Stenopfad-source-audit/1.0 (offline learning app)"}), timeout=30) as response:
                (args.sample_dir / f"{card_id}.png").write_bytes(response.read())
    print(f"\n{len(found)}/{len(cards)} SVGs im Bereich gefunden")
    if missing:
        print("Fehlende Labels:", ", ".join(missing))
    if not args.embed:
        return
    if missing and not args.allow_missing:
        raise SystemExit("Abbruch: Keine unvollständige SVG-Umstellung einbetten.")

    sources = []
    for card in cards:
        if card["id"] not in found:
            continue
        preview, file_page, matched = found[card["id"]]
        with urlopen(Request(preview, headers={"User-Agent": "Stenopfad-source-audit/1.0 (offline learning app)"}), timeout=30) as response:
            image = response.read()
        if not image.startswith(b"\x89PNG\r\n\x1a\n"):
            raise ValueError(f"Keine PNG-Vorschau für {card['label']!r}")
        card["cleanImage"] = "data:image/png;base64," + base64.b64encode(image).decode("ascii")
        sources.append({
            "id": card["id"],
            "label": card["label"],
            "matchedLabel": matched,
            "sourcePage": file_page,
            "previewUrl": preview,
            "license": "Wikimedia Commons: public domain stated on file page",
            "role": "locally embedded clean preview rendered from an SVG; official scan remains the rule reference",
        })
    existing_assets = {}
    if MANIFEST.exists():
        existing_assets = {asset["id"]: asset for asset in json.loads(MANIFEST.read_text(encoding="utf-8")).get("assets", [])}
    existing_assets.update({asset["id"]: asset for asset in sources})
    CONTENT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    MANIFEST.write_text(json.dumps({
        "source": "Wikimedia Commons · SVG Deutsche Einheitskurzschrift",
        "category": "https://commons.wikimedia.org/wiki/Category:SVG_Deutsche_Einheitskurzschrift",
        "licenseNote": "Every imported SVG must state public domain on its own Commons file page. The app stores only a local PNG preview rendered from that SVG.",
        "assets": [existing_assets[card["id"]] for card in data["cards"] if card["id"] in existing_assets],
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Eingebettet: {CONTENT.relative_to(ROOT)} und {MANIFEST.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
