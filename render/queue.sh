#!/bin/bash
# File de rendu : ./queue.sh ep5 ep6 ... (rendu + accroche « Dans cette ville… »)
cd "$(dirname "$0")"
for e in "$@"; do
  while pgrep -f "render.mjs ep[0-9]+ --workers" >/dev/null; do sleep 10; done
  node render.mjs $e --workers 4 > out/$e.log 2>&1 && node hook.mjs out/$e.mp4 >> out/$e.log 2>&1 && echo "$e PRÊT" || echo "$e ÉCHEC"
done
