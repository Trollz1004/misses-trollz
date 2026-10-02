# Contributing

Everything built for Misses Trollz starts from what is approved and tested here (Joshua Coleman, 2026-10-02): `SYSTEM_PROMPT.txt`, `approved_banks/`, and the `joshlcoleman/misses-trollz` model built by `ollama/build_modelfile.py`.

- A change to the prompt, the banks or the model must keep `python ollama/smoke.py` at 7 of 7, and it adds a new case to the smoke test for any new rule.
- New games and looks go into `approved_banks/` with an id, a from-bed version where there is movement, and tags. Nothing romantic, medical, scary, branded, or asking who a child is.
- She is never a companion in the adult sense, never streamed, and never shares a name, look or bank with an adult character.
- The Claude judge lane reviews and lands every change. Changes arrive as pull requests.
