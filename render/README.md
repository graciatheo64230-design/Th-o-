# Moteur de vidéos « Petites Vies en Cubes »

Style 3D en blocs, voix off, sous-titres mot à mot, panneaux dans le décor. Format vertical 720x1280, 30 i/s.

## Prérequis
- Node 22 + Playwright/Chromium, ffmpeg, Python 3 + numpy
- `apt-get install espeak-ng mbrola mbrola-fr1` (voix off hors ligne)
- `npm install` dans ce dossier

## Fabriquer un épisode
1. Écrire `epN/script.json` : une phrase par plan + le nom du plan (`shot`).
2. `python3 build_audio.py epN` : voix, musique, `timeline.json` (timings des mots).
3. Écrire `epN/scene.js` : décors, personnages, plans (voir `ep1/scene.js`).
4. Aperçu : `node render.mjs epN --preview 2.5,10,20`
5. Rendu final : `node render.mjs epN --workers 4` crée `out/epN.mp4`.

## Remplacer la voix
La voix intégrée (espeak/MBROLA) est robotique. Pour une voix plus naturelle, enregistre ou génère
(CapCut, ElevenLabs…) le texte de `script.json`, puis remplace `epN/mix.wav` et relance l'étape 5.
