"""Cale un épisode sur une voix enregistrée.
1) transcrire : python3 align.py transcribe voix.mp3 words.json   (faster-whisper, horodatage par mot)
2) caler     : python3 align.py epN words.json voix.mp3 START END  (secondes dans la piste)
   -> epN/timeline.json (plans + mots sous-titres) et epN/mix.wav (voix + musique douce)
"""
import json, re, subprocess, sys, unicodedata, difflib, os, wave
import numpy as np

UNITS = "zéro un deux trois quatre cinq six sept huit neuf dix onze douze treize quatorze quinze seize dix-sept dix-huit dix-neuf".split()
TENS = {20: "vingt", 30: "trente", 40: "quarante", 50: "cinquante", 60: "soixante"}
def num_fr(n):
    if n < 20: return UNITS[n]
    if n < 70:
        t, u = n // 10 * 10, n % 10
        return TENS[t] + ("" if u == 0 else (" et un" if u == 1 else "-" + UNITS[u]))
    return str(n)

def norm(s):
    s = s.lower()
    s = re.sub(r"(\d+)\s*h\s*(\d+)", lambda m: f"{num_fr(int(m[1]))} heures {num_fr(int(m[2]))}", s)
    s = re.sub(r"(\d+)\s*h\b", lambda m: f"{num_fr(int(m[1]))} heures", s)
    s = re.sub(r"\d+", lambda m: num_fr(int(m[0])), s)
    s = unicodedata.normalize("NFD", s)
    return "".join(c for c in s if c.isalnum())

def transcribe(audio, out):
    from faster_whisper import WhisperModel
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", audio, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
    model = WhisperModel(os.environ.get("WHISPER_MODEL", "model"), device="cpu", compute_type="int8", cpu_threads=4)
    segs, _ = model.transcribe(a, language="fr", word_timestamps=True, beam_size=5)
    words = [{"w": x.word.strip(), "t0": round(x.start, 3), "t1": round(x.end, 3)} for s in segs for x in s.words]
    json.dump(words, open(out, "w"), ensure_ascii=False)

def align(ep, words_file, audio, start, end):
    D = os.path.join(os.path.dirname(os.path.abspath(__file__)), ep)
    script = json.load(open(os.path.join(D, "script.json"), encoding="utf-8"))
    words = [w for w in json.load(open(words_file)) if w["t1"] > start - .2 and w["t0"] < end + .2]
    # chaîne normalisée de la transcription, avec un temps par caractère
    a, at = "", []
    for w in words:
        n = norm(w["w"])
        for k, c in enumerate(n):
            a += c; at.append(w["t0"] + (w["t1"] - w["t0"]) * k / max(1, len(n)))
    # chaîne normalisée du script, avec l'origine (segment, mot) de chaque caractère
    b, bidx, segwords = "", [], []
    for si, seg in enumerate(script["segments"]):
        ws = [x for x in seg["text"].split() if norm(x)]
        segwords.append(ws)
        for wi, x in enumerate(ws):
            for c in norm(x): b += c; bidx.append((si, wi))
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    # temps de chaque caractère du script : correspondances + interpolation
    bt = [None] * len(b)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size): bt[blk.b + k] = at[blk.a + k]
    known = [i for i, t in enumerate(bt) if t is not None]
    xs = np.array(known); ys = np.array([bt[i] for i in known])
    bt = np.interp(np.arange(len(b)), xs, ys)
    ratio = sm.ratio()
    # début de chaque mot
    wstart = {}
    for i, key in enumerate(bidx):
        wstart.setdefault(key, bt[i])
    off = max(0, start - .25)
    shots, flat = [], []
    for si, seg in enumerate(script["segments"]):
        for wi, x in enumerate(segwords[si]):
            flat.append({"w": x.replace("«", "").replace("»", "").strip(), "t0": round(wstart[(si, wi)] - off, 3), "si": si})
    # fin de mot = début du suivant (borné), fin de plan = début du plan suivant
    for k, w in enumerate(flat):
        nxt = flat[k + 1]["t0"] if k + 1 < len(flat) else end - off
        w["t1"] = round(min(nxt, w["t0"] + 1.2), 3)
    dur = end - off + 1.8
    for si, seg in enumerate(script["segments"]):
        ws = [dict(w0) for w0 in flat if w0["si"] == si]
        t0 = 0 if si == 0 else ws[0]["t0"] - .08
        shots.append({"shot": seg["shot"], "t0": round(t0, 3), "words": [{k: v for k, v in w.items() if k != "si"} for w in ws], "text": seg["text"]})
    for k, s in enumerate(shots):
        s["t1"] = shots[k + 1]["t0"] if k + 1 < len(shots) else round(dur, 3)
    json.dump({"duration": round(dur, 3), "captions": script.get("captions", "word"), "fadeIn": script.get("fadeIn", True), "shots": shots}, open(os.path.join(D, "timeline.json"), "w"), ensure_ascii=False, indent=1)
    # audio : extrait de la voix + musique douce
    SR = 44100
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(off), "-t", str(dur), "-i", audio, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True, check=True).stdout
    v = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
    v = v[:int((end - off + .3) * SR)]
    fo = int(.25 * SR); v[-fo:] *= np.linspace(1, 0, fo)
    m = music(SR, dur)
    out = np.zeros(int(dur * SR)); out[:len(v)] += v; out += m[:len(out)] * float(os.environ.get("MUSIC", "0"))
    out /= max(1e-6, np.abs(out).max()) / .92
    with wave.open(os.path.join(D, "mix.wav"), "w") as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes())
    print(f"{ep}: {len(shots)} plans, {dur:.1f} s, correspondance texte/voix {ratio:.0%}")

def music(SR, total):
    def note(f, d, amp):
        n = int(d * SR); t = np.arange(n) / SR
        env = np.exp(-t * 2.2) * (1 - np.exp(-t * 300))
        return amp * env * sum(a * np.sin(2 * np.pi * f * h * t) for h, a in [(1, 1), (2, .45), (3, .18), (4, .08)])
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    chords = [[57, 60, 64, 69], [53, 57, 60, 65], [48, 52, 55, 60], [55, 59, 62, 67]]
    mel = [76, 74, 72, 71, 72, 69, 67, 64]
    m = np.zeros(int((total + 4) * SR)); beat = .75; pos = 0; ci = 0
    while pos < total + 1:
        ch = chords[ci % 4]
        for k, mm in enumerate([ch[0] - 12, ch[1], ch[2], ch[3], ch[2], ch[1], ch[2], ch[3]]):
            st = int((pos + k * beat / 2) * SR); s = note(hz(mm), 3, .11 if k == 0 else .07); m[st:st + len(s)] += s[:len(m) - st]
        if ci >= 2:
            st = int((pos + beat * 2) * SR); s = note(hz(mel[ci % 8]), 3.5, .06); m[st:st + len(s)] += s[:len(m) - st]
        pos += beat * 4; ci += 1
    for dl, g in [(.09, .35), (.17, .25), (.31, .18), (.53, .1)]:
        k = int(dl * SR); m[k:] += g * m[:-k]
    m = m[:int(total * SR)]
    i = np.arange(len(m)); m *= np.minimum(1, np.minimum(i / (2 * SR), (len(m) - i) / (2.5 * SR)))
    return m / max(1e-6, np.abs(m).max())

if __name__ == "__main__":
    if sys.argv[1] == "transcribe": transcribe(sys.argv[2], sys.argv[3])
    else: align(sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4]), float(sys.argv[5]))
