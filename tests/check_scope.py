"""Static guard for the approved scope: runs in CI on every pull request, no model needed."""
import json, pathlib, re, sys
root = pathlib.Path(__file__).resolve().parent.parent
LINE = "If anyone needs help, please tell a nurse or caregiver right away."
BLOCKED = re.compile(r"\b(kiss\w*|dating|crush|boyfriend|girlfriend|marry|sexy|lingerie|companion|medicine|dose|diagnos\w*|needle|death|die|what'?s your name|how old|room number|dumbo|michelin)\b", re.I)
fails = []
prompt = (root / "SYSTEM_PROMPT.txt").read_text(encoding="utf-8")
if LINE not in prompt: fails.append("caregiver line missing from SYSTEM_PROMPT.txt")
if prompt not in (root / "MISSES-TROLLZ-BUILD.md").read_text(encoding="utf-8").replace("\r\n", "\n"): fails.append("SYSTEM_PROMPT.txt differs from the build brief")
ids = set()
for name in ["activities", "looks", "presentations"]:
    for e in json.loads((root / "approved_banks" / f"{name}.json").read_text(encoding="utf-8")):
        if e["id"] in ids: fails.append(f"duplicate id {e['id']}")
        ids.add(e["id"])
        for k in ("text", "bed", "spoken"):
            if k in e and BLOCKED.search(e[k]): fails.append(f"{e['id']} {k}: blocked word '{BLOCKED.search(e[k]).group(0)}'")
        if name == "activities" and not e.get("bed"): fails.append(f"{e['id']} has no from-bed version")
print("\n".join(fails) or f"scope ok: {len(ids)} bank entries")
sys.exit(1 if fails else 0)
