#!/bin/bash
# File de rendu saison 2 (sans accroche ajoutée : « Dans cette ville » est déjà dit).
cd "$(dirname "$0")"
exec 9>/tmp/claude-0/-home-user-Th-o-/caa44645-233f-59e2-93f5-587bc99b7a0e/scratchpad/render.lock
for e in "$@"; do
  flock 9
  node render.mjs $e --workers 4 > out/$e.log 2>&1 && echo "$e PRÊT" || echo "$e ÉCHEC"
  flock -u 9
done
