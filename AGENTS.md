# AGENTS.md: Misses Trollz

The rulebook for every AI working on this repository. Claude Code reads it through `CLAUDE.md`. The build brief is `MISSES-TROLLZ-BUILD.md`; the safety rules are `SAFETY.md`.

## Rule one: done means the real user would accept it (Joshua, 2026-10-04)

This replaces "200 OK is not OK" and every "verify it" that came before it. It applies to every AI on every repository: Claude, Codex, Gemini, Copilot, Hermes, OpenCode, Emergent, anyone.

Before you say "done", "working", "fixed" or "verified":

1. Say who it is for, as a person (example: a nurse handing a phone to a sick 5-year-old; Joshua reading on his phone with tired eyes).
2. Show the screenshot of what that person sees, taken from the real thing they will open.
3. Look at it as that person and list everything wrong with it: ugly, confusing, broken, cut off, too much text, wrong for them. If you list nothing, say why that person would accept it as it is.
4. Fix what you found, then show the new screenshot.

Status codes, test counts and scores (200, 26 of 26, Lighthouse 100) prove the code runs. They never prove it is good, and they are never the reason something is called done. Joshua decides when it is done, not your tests.

Why this rule exists: on 2026-10-04 Misses Trollz shipped with 100 on every score and a screenshot that "proved" it ran, while what a nurse would see was a clip-art character, a cut-off banner, a wall of text and a legal footer under a kids' toy. Every check passed and the product failed. The AI graded its own work with tools that cannot see ugly.

## Who this is for

The person in step 1 is almost always a nurse or child-life worker handing a tablet to a sick child aged 3 to 10, or the child. If a screen would make that nurse hesitate for even three seconds, it is not done.
