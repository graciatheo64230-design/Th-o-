#!/bin/bash
# Aperçu : une image au milieu de chaque plan -> planche contact.  ./prev.sh ep5 [indices séparés par des virgules]
EP=$1
OUT=/tmp/claude-0/-home-user-Th-o-/caa44645-233f-59e2-93f5-587bc99b7a0e/scratchpad/prev_$EP
rm -rf "$OUT"
T=$(python3 -c "
import json;tl=json.load(open('$EP/timeline.json'));s=tl['shots'];idx='$2'
ii=[int(x) for x in idx.split(',')] if idx else range(len(s))
print(','.join(str(round((s[i]['t0']+s[i]['t1'])/2,2)) for i in ii))")
timeout 600 node render.mjs "$EP" --preview "$T" --out "$OUT" 2>&1 | grep -v "^t=" | head
cd "$OUT" || exit 1
ls prev_*.jpg | sort -t_ -k2 -n > l.txt
n=$(wc -l < l.txt)
if [ "$n" -eq 1 ]; then echo "$OUT/$(cat l.txt)"; exit 0; fi
if [ "$n" -gt 9 ] && [ $((n % 2)) -eq 1 ]; then tail -1 l.txt >> l.txt; n=$((n + 1)); fi
if [ "$n" -gt 9 ]; then cols=$((n / 2)); rows=2; else cols=$n; rows=1; fi
F=""; for i in $(seq 0 $((n - 1))); do F="$F[$i]scale=180:-1[s$i];"; done
for i in $(seq 0 $((n - 1))); do F="$F[s$i]"; done
ffmpeg -v error -y $(sed 's/^/-i /' l.txt) -filter_complex "${F}xstack=inputs=$n:grid=${cols}x${rows}:fill=black" grid.jpg && echo "$OUT/grid.jpg"
