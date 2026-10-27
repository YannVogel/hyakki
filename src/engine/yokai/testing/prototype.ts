/// <reference types="node" />
import { readFileSync } from 'node:fs';
import path from 'node:path';

// Test-only bridge to design/prototypes/fabrique-a-yokai.html, the reference implementation:
// its script exports its API through `module.exports` when run outside a browser.

interface Named {
  id: string;
}

export interface PrototypeSpec {
  base: Named;
  eyes: Named;
  mouth: Named;
  limb: Named;
  accs: Named[];
  pal: Named;
  tier: string;
  lx: number;
  ly: number;
  delay: number;
  suffix: string;
}

export interface PrototypeStats {
  pv: number;
  atq: number;
  def: number;
  vit: number;
  crit: number;
  burn: number;
  souls: number;
  traits: { label: string; effect: string }[];
}

export interface Prototype {
  generate(seed: number): PrototypeSpec;
  nameOf(spec: PrototypeSpec): string;
  descOf(spec: PrototypeSpec): string;
  statsOf(spec: PrototypeSpec): PrototypeStats;
  COMBOS: number;
}

const PROTOTYPE_PATH = path.resolve(
  __dirname,
  '../../../../design/prototypes/fabrique-a-yokai.html',
);

export function loadPrototype(): Prototype {
  const html = readFileSync(PROTOTYPE_PATH, 'utf8');
  const script = /<script>([\s\S]*?)<\/script>/.exec(html)?.[1];
  if (script === undefined) {
    throw new Error('Prototype script not found');
  }
  const sandboxModule = { exports: {} as Prototype };
  new Function('module', script)(sandboxModule);
  return sandboxModule.exports;
}

// Prototype ids (French) → engine ids (English).
export const PROTOTYPE_IDS: Record<string, string> = {
  lanterne: 'lantern',
  ombrelle: 'umbrella',
  theiere: 'teapot',
  tambour: 'drum',
  geta: 'geta',
  rouleau: 'scroll',
  cyclope: 'cyclops',
  deux: 'pair',
  clin: 'wink',
  trois: 'three',
  malicieux: 'sly',
  points: 'dots',
  vertical: 'slit',
  kawaii: 'big',
  sourire: 'grin',
  crocs: 'fangs',
  langue: 'tongue',
  o: 'o',
  ondulee: 'wavy',
  dents: 'teeth',
  aucun: 'none',
  jambe: 'leg',
  jambes: 'legs',
  bras: 'arms',
  cornes: 'horns',
  corne: 'horn',
  onibi: 'onibi',
  ofuda: 'ofuda',
  fissures: 'cracks',
  hachimaki: 'hachimaki',
  clochette: 'bell',
  pansement: 'bandage',
  papier: 'paper',
  bois: 'wood',
  laque: 'lacquer',
  celadon: 'celadon',
  indigo: 'indigo',
  sakura: 'sakura',
  spectral: 'spectral',
  or: 'gold',
  commun: 'common',
  rare: 'rare',
  epique: 'epic',
  legendaire: 'legendary',
  obake: 'obake',
  bō: 'bo',
  kozō: 'kozo',
  nyūdō: 'nyudo',
};

const engineId = (prototypeId: string): string => {
  const id = PROTOTYPE_IDS[prototypeId];
  if (id === undefined) {
    throw new Error(`Unknown prototype id: ${prototypeId}`);
  }
  return id;
};

/** The prototype's spec, translated to the engine's ids and field names. */
export function toEngineShape(spec: PrototypeSpec) {
  return {
    object: engineId(spec.base.id),
    eyes: engineId(spec.eyes.id),
    mouth: engineId(spec.mouth.id),
    limbs: engineId(spec.limb.id),
    accessories: spec.accs.map((accessory) => engineId(accessory.id)),
    rarity: engineId(spec.tier),
    palette: engineId(spec.pal.id),
    gaze: { x: spec.lx, y: spec.ly },
    animationDelay: spec.delay,
    suffix: engineId(spec.suffix),
  };
}
