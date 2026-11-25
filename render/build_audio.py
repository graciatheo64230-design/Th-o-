"""Génère la voix off (espeak-ng + MBROLA fr1), la musique de fond et timeline.json.
Usage: python3 build_audio.py ep1
"""
import json, re, subprocess, sys, wave, os
import numpy as np

EP = sys.argv[1]
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), EP)
SR = 22050
VOICE = os.environ.get("VOICE", "mb-fr1")
script = json.load(open(os.path.join(D, "script.json"), encoding="utf-8"))

def tts(text, path):
    clean = re.sub(r"[«»]", "", text).strip()
    subprocess.run(["espeak-ng", "-v", VOICE, "-s", "138", "-p", "45", "-w", path, clean], check=True)
    with wave.open(path) as w:
        sr = w.getframerate()
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    if sr != SR:
        x = np.linspace(0, len(a) - 1, int(len(a) * SR / sr))
        a = np.interp(x, np.arange(len(a)), a)
    # trim silence
    idx = np.where(np.abs(a) > 0.01)[0]
    return a[max(0, idx[0] - 200): idx[-1] + 400] if len(idx) else a

def weight(w):
    v = len(re.findall(r"[aeiouyàâéèêëîïôûùœ]+", w.lower()))
    return max(1, v) + 0.3

voice = [np.zeros(int(0.6 * SR))]
t = 0.6
timeline = []
for i, seg in enumerate(script["segments"]):
    a = tts(seg["text"], f"/tmp/seg{i}.wav")
    dur = len(a) / SR
    words = [w for w in seg["text"].split() if w not in ("«", "»", ":", "?", "!")]
    ws = [weight(w) for w in words]
    tot = sum(ws)
    acc, wt = t, []
    for w, k in zip(words, ws):
        d = dur * k / tot
        wt.append({"w": w.replace("«", "").replace("»", "").strip(), "t0": round(acc, 3), "t1": round(acc + d, 3)})
        acc += d
    pause = seg.get("pause", 0.35)
    timeline.append({"shot": seg["shot"], "t0": round(t, 3), "t1": round(t + dur + pause, 3), "words": wt, "text": seg["text"]})
    voice += [a, np.zeros(int(pause * SR))]
    t += dur + pause

v = np.concatenate(voice)
total = len(v) / SR

# --- musique : piano mélancolique procédural (Am - F - C - G) ---
def note(f, dur, amp=0.18):
    n = int(dur * SR); tt = np.arange(n) / SR
    env = np.exp(-tt * 2.2) * (1 - np.exp(-tt * 300))
    s = sum(a * np.sin(2 * np.pi * f * h * tt) for h, a in [(1, 1), (2, .45), (3, .18), (4, .08)])
    return amp * env * s

def hz(m): return 440 * 2 ** ((m - 69) / 12)
chords = [[57, 60, 64, 69], [53, 57, 60, 65], [48, 52, 55, 60], [55, 59, 62, 67]]
mel = [76, 74, 72, 71, 72, 69, 67, 64]
m = np.zeros(int((total + 4) * SR))
beat = 0.75
pos = 0.0; ci = 0
while pos < total + 2:
    ch = chords[ci % 4]
    for k, mm in enumerate([ch[0] - 12, ch[1], ch[2], ch[3], ch[2], ch[1], ch[2], ch[3]]):
        st = int((pos + k * beat / 2) * SR)
        s = note(hz(mm), 3.0, 0.07 if k else 0.11)
        m[st:st + len(s)] += s[:len(m) - st]
    if ci >= 2:
        st = int((pos + beat * 2) * SR)
        s = note(hz(mel[ci % len(mel)]), 3.5, 0.06)
        m[st:st + len(s)] += s[:len(m) - st]
    pos += beat * 4; ci += 1
m = m[:len(v) + int(2.5 * SR)]
# simple reverb
for dly, g in [(0.09, .35), (0.17, .25), (0.31, .18), (0.53, .1)]:
    k = int(dly * SR); m[k:] += g * m[:-k]
fade = np.minimum(1, np.minimum(np.arange(len(m)) / (2 * SR), (len(m) - np.arange(len(m))) / (3 * SR)))
m *= fade
vv = np.zeros(len(m)); vv[:len(v)] = v
mix = vv * 1.0 + m * 0.55
mix /= max(1e-6, np.abs(mix).max()) / 0.9

def save(path, a):
    with wave.open(path, "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())
save(os.path.join(D, "voice.wav"), vv)
save(os.path.join(D, "music.wav"), m)
save(os.path.join(D, "mix.wav"), mix)
json.dump({"duration": round(len(m) / SR, 3), "shots": timeline}, open(os.path.join(D, "timeline.json"), "w"), ensure_ascii=False, indent=1)
print("durée", round(len(m) / SR, 2), "s,", len(timeline), "plans")
