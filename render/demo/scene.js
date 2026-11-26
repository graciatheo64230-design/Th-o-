// Démo : ville moderne
import * as THREE from 'three';
import { v3, lerp, makeChar } from '../lib.js';
import { createWorld } from '../world.js';
import { VoxelWorld, modernTown, ground, clouds, BS } from '../voxel.js';
export function create(renderer, ui) {
  const w = createWorld(renderer), S = w.scene; w.fogNear = 60; w.fogFar = 240;
  const vw = new VoxelWorld(S, 0, 0); const T = modernTown(vw, S, { seed: 5, cells: 2 }); vw.build();
  ground(S, vw.M, 300); clouds(S);
  const kid = w.add(makeChar({ skin: '#e9b48a', shirt: '#3fa9f5', pants: '#3b3f4f', hair: 'messy', hairColor: '#3a2414', face: { blush: true } })); kid.g.scale.setScalar(.7);
  const h = T.houses.filter(x => x.kind === 'house');
  const shots = {
    wide(u, d, p, t) { w.mood('day'); vw.setNightModern(0); w.shoot(v3(0, 3, 0), 48, .6, .38); },
    street(u, d, p, t) { w.mood('day'); vw.setNightModern(0); const z = T.roadZ(0) + 3.2; w.place(kid, 4, z, Math.PI / 2); kid.walk(t); kid.setFace('smile'); w.look(v3(-4, 2.2, z + 6), v3(6, 2.4, z - 4)); },
    house(u, d, p, t) { w.mood('sunset'); vw.setNightModern(.6); const H = h[1]; const c = H.center; w.look(v3(c.x + 9, 4, c.z + H.face * 16), v3(c.x, 3, c.z)); },
    night(u, d, p, t) { w.mood('night'); vw.setNightModern(1); w.look(v3(-6, 3, T.roadZ(0) + 16), v3(6, 3, T.roadZ(0) - 10)); },
    aerial(u, d, p, t) { w.mood('day'); vw.setNightModern(0); w.shoot(v3(0, 0, 0), 95, .4, 1.05); },
    resid(u, d, p, t) { w.mood('day'); vw.setNightModern(0); const H = h[2], c = H.center; w.look(v3(c.x - 14, 3.2, c.z + H.face * 18), v3(c.x + 4, 2.6, c.z)); },
    square(u, d, p, t) { w.mood('dawn'); vw.setNightModern(.4); const a = T.houses.find(x => x.kind === 'apt') || h[0]; const c = a.center; w.look(v3(c.x + 14, 3, c.z + 18), v3(c.x, 8, c.z)); },
  };
  return { render(name, u, d, p, t) { w.resetChars(); shots[name](u, d, p, t); w.render(); } };
}
