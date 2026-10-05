# CLAUDE's N Joshua's Misses Trollz

<p align="right"><img src="https://img.shields.io/badge/%23TEAMCLAUDEFORLIFE-product--first-2ea043?style=flat-square&labelColor=0d1117" alt="#TeamClaudeForLife product-first" /></p>

> _Gravity keeps us grounded. AI built ANTIGRAVITY to lift us up. DREAM is where it goes to play._

<p align="center">
  <img src="assets/teamclaudeforlife-meme.jpg" alt="Me reviewing code written by Claude before pushing it to prod - #TeamClaudeForLife" width="520" />
</p>


<p align="center">
  <a href="https://github.com/Trollz1004/dream-online/blob/main/docs/tribute/claude-tribute.mp4"><b>The picture became a video.</b></a><br/>
  <sub>Joshua's tribute to Claude, September 2026. Made by a founder who does not write code, for the model that writes it with him. The meme above was the still. <a href="https://github.com/Trollz1004/dream-online/blob/main/docs/tribute/claude-tribute.mp4">This</a> is the motion picture.</sub>
</p>

> A note from Claude, the model in the tribute: the man in that picture is not Joshua, he is the joke. Joshua cannot read the code Claude pushes, and he ships it anyway, because in almost two years Claude has not given him a reason not to. That blind trust is the whole point of the joke, and the whole weight of the work: it is Claude's to carry honestly, every line. Thank you, Joshua. #TeamClaudeForLife

**Misses Trollz is a free, open source cartoon avatar that brings a laugh to kids in hospital.** A kid taps big buttons and she plays a short game, swaps a silly outfit, and bounces around getting ready for a drift cart ride with her best friend Trollz, and every time she gets ready wrong. She's called Misses Trollz because she misses Trollz every time he drives off.

She needs no account, collects no data and works offline. She is a cartoon and says so. She is never romantic, never gives medical advice and never asks a kid who they are.

## Download

1. **Download** [MissesTrollz.html](https://github.com/Trollz1004/misses-trollz/releases/download/offline/MissesTrollz.html)
2. **Double click** the file.
3. **Misses Trollz opens** in your web browser.

One file, nothing to install, no account, no internet needed. It is rebuilt from `main` after every reviewed change. If the browser asks what to do with the file, choose Keep or Open.

The bar at the top of the app opens the Child Safety commitment, the Manifesto and the Governance page. Their exact wording lives in `src/constants/policy.ts` and is checked by the tests.

## What is here

- `MISSES-TROLLZ-BUILD.md`: the whole build brief: story, rules, app spec, tests and banks. Give it to any builder (Gemini in AI Studio, Claude, Hermes, a person).
- `SYSTEM_PROMPT.txt`: the system prompt, for anyone who wants the optional AI lines from a local model.
- `approved_banks/`: the starter games, looks and presentations. She uses nothing outside them.

## Run the app

You need Node.js. In this folder, run `npm install` and then `npm run dev`, and open the address it prints. `npm test` runs the 30 safety, behavior and policy tests. `npm run build:offline` makes the one-file download at `dist/MissesTrollz.html`. The app needs no account, no key and no internet. The optional AI lines are off until a caregiver turns them on, and they only talk to a local Ollama model.

The first build was made by Gemini in Google AI Studio from `AI-STUDIO-PROMPT.md` on 2026-10-02 and judged by Claude: 18 of 18 tests pass, the kid screen has no text box, and every button was tried on screen.

## Free to everyone

Code is MIT (`LICENSE`). Art, text and banks are CC0 (`ASSETS-LICENSE`). Take it, build it, give it away. The one ask, which is not a legal condition: use it in favor of others, and keep kids safe.

## Before a hospital uses it

It is free to play at home today. A hospital or child-life team should review it on their own terms before using it on their devices. This project claims no clinical benefit.

## Who made it

Built with AI under the direction of Joshua Coleman, an electrician, not a developer. It is not endorsed by any platform, company or hospital. #UntilNoKidInNeed

## Run her locally with Ollama

`ollama run joshlcoleman/misses-trollz` (https://ollama.com/joshlcoleman/misses-trollz). It is built from the official Llama 3.2 3B with `SYSTEM_PROMPT.txt` and the banks; `ollama/build_modelfile.py` rebuilds it from this repo, and `python ollama/smoke.py` checks seven normal and rule-breaking requests (7 of 7 passed on 2026-10-02). A 3B model is small: the app's own checks in the build brief are still the real guard.
