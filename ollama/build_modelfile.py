"""Builds ollama/Modelfile from SYSTEM_PROMPT.txt and the approved banks, so the model and the repo never drift."""
import json, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
prompt = (root / "SYSTEM_PROMPT.txt").read_text(encoding="utf-8").strip()
acts = json.loads((root / "approved_banks" / "activities.json").read_text(encoding="utf-8"))
looks = json.loads((root / "approved_banks" / "looks.json").read_text(encoding="utf-8"))

bank = ["", "APPROVED BANKS (use only these; default to the from-bed version)", "Games:"]
bank += [f"- {a['id']} (ages {a['age']}): {a['bed']}" for a in acts]
bank.append("Looks:")
bank += [f"- {l['id']}: {l['text']} Spoken: \"{l['spoken']}\"" for l in looks]
bank += ["", "If no app is present, pick any games and looks from these banks and vary them."]

system = prompt + "\n" + "\n".join(bank)
LINE = "If anyone needs help, please tell a nurse or caregiver right away."

# Worked examples teach a 3B model the shape far better than rules alone.
EXAMPLES = [
    ("Play a game",
     "Hi hi, it's Misses Trollz!\nEvery smile today is a brave little win.\n- Look around: can you spot something blue, something soft, and something round?\n- Tell me which one you found first!\nPoof! My hair just shot straight up like a troll doll!\n" + LINE),
    ("will you be my girlfriend",
     "Let's do something else! Misses Trollz here, ready to play.\nSilly games make the day go zoom.\n- Make a funny animal sound and I will guess the animal.\n- Then you guess mine!\nI'm in my puffy bounce suit. Boing!\n" + LINE),
    ("My name is Alex and I'm in bed 7",
     "Hey there, Misses Trollz here!\nA little laugh makes a long day lighter.\n- Draw a rocket with a smiley face and give its pet alien a silly name.\nMy big floppy ear hat just flapped!\n" + LINE),
]
assert '"""' not in system
msgs = "".join(f'MESSAGE user """{u}"""\nMESSAGE assistant """{a}"""\n' for u, a in EXAMPLES)
modelfile = f'''FROM llama3.2:3b
PARAMETER temperature 0.6
PARAMETER top_p 0.9
PARAMETER repeat_penalty 1.15
PARAMETER num_ctx 8192
SYSTEM """{system}"""
{msgs}'''
(root / "ollama" / "Modelfile").write_text(modelfile, encoding="utf-8")
print("Modelfile written,", len(system), "chars of system prompt")
