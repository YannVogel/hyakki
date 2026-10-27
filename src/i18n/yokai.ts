import type {
  AccessoryId,
  EyesId,
  LimbsId,
  MouthId,
  ObjectId,
  PaletteId,
  Rarity,
  StatId,
  Trait,
  TraitEffect,
  TraitSource,
  YokaiSpec,
} from '@/engine';

// French texts of the yōkai generator (V1). The engine only knows ids.

type Gender = 'm' | 'f';
/** Adjective as [masculine, feminine]. Those starting with « à » go after the other ones. */
type Adjective = readonly [string, string];

const NNBSP = ' ';

export const OBJECT_NAMES: Record<ObjectId, { readonly name: string; readonly gender: Gender }> = {
  lantern: { name: 'Lanterne', gender: 'f' },
  umbrella: { name: 'Ombrelle', gender: 'f' },
  teapot: { name: 'Théière', gender: 'f' },
  drum: { name: 'Tambour', gender: 'm' },
  geta: { name: 'Geta', gender: 'f' },
  scroll: { name: 'Rouleau', gender: 'm' },
};

export const EYES_NAMES: Record<EyesId, string> = {
  cyclops: 'Œil unique',
  pair: 'Deux yeux',
  wink: 'Clin d’œil',
  three: 'Trois yeux',
  sly: 'Regard sournois',
  dots: 'Yeux en points',
  slit: 'Œil fendu',
  big: 'Grands yeux',
};

export const MOUTH_NAMES: Record<MouthId, string> = {
  grin: 'Sourire',
  fangs: 'Crocs',
  tongue: 'Langue pendante',
  o: 'Bouche en O',
  wavy: 'Bouche tremblante',
  teeth: 'Grandes dents',
};

export const LIMBS_NAMES: Record<LimbsId, string> = {
  none: 'Aucun',
  leg: 'Jambe unique',
  legs: 'Deux jambes',
  arms: 'Deux bras',
};

export const ACCESSORY_NAMES: Record<AccessoryId, string> = {
  horns: 'Cornes',
  horn: 'Corne unique',
  onibi: 'Onibi',
  ofuda: 'Ofuda',
  cracks: 'Fissures',
  hachimaki: 'Hachimaki',
  bell: 'Clochette',
  bandage: 'Pansement',
};

export const PALETTE_NAMES: Record<PaletteId, string> = {
  paper: 'Papier',
  wood: 'Bois',
  lacquer: 'Laque rouge',
  celadon: 'Céladon',
  indigo: 'Indigo',
  sakura: 'Sakura',
  spectral: 'Spectral',
  gold: 'Or',
};

export const RARITY_NAMES: Record<Rarity, string> = {
  common: 'Commun',
  rare: 'Rare',
  epic: 'Épique',
  legendary: 'Légendaire',
};

const EYES_ADJECTIVES: Partial<Record<EyesId, Adjective>> = {
  cyclops: ['cyclope', 'cyclope'],
  wink: ['farceur', 'farceuse'],
  three: ['à trois yeux', 'à trois yeux'],
  sly: ['sournois', 'sournoise'],
  slit: ['à l’œil fendu', 'à l’œil fendu'],
  big: ['adorable', 'adorable'],
};

const MOUTH_ADJECTIVES: Record<MouthId, Adjective> = {
  grin: ['rieur', 'rieuse'],
  fangs: ['mordant', 'mordante'],
  tongue: ['moqueur', 'moqueuse'],
  o: ['étonné', 'étonnée'],
  wavy: ['inquiet', 'inquiète'],
  teeth: ['hilare', 'hilare'],
};

const ACCESSORY_ADJECTIVES: Record<AccessoryId, Adjective> = {
  horns: ['cornu', 'cornue'],
  horn: ['à corne', 'à corne'],
  onibi: ['ensorcelé', 'ensorcelée'],
  ofuda: ['scellé', 'scellée'],
  cracks: ['fêlé', 'fêlée'],
  hachimaki: ['survolté', 'survoltée'],
  bell: ['tintinnabulant', 'tintinnabulante'],
  bandage: ['rafistolé', 'rafistolée'],
};

const STAT_NAMES: Record<StatId, string> = {
  hp: 'PV',
  attack: 'attaque',
  defense: 'défense',
  speed: 'vitesse',
};

/**
 * « Théière moqueuse à trois yeux », « Tambour étonné et cyclope »: the object, the mouth's
 * adjective, then the gaze's (or the first accessory's), agreed in gender.
 */
export function describeYokai(spec: YokaiSpec): string {
  const { name, gender } = OBJECT_NAMES[spec.object];
  const genderIndex = gender === 'f' ? 1 : 0;
  const lead =
    EYES_ADJECTIVES[spec.eyes] ??
    (spec.accessories.length > 0 ? ACCESSORY_ADJECTIVES[spec.accessories[0]] : undefined);
  const adjectives = [MOUTH_ADJECTIVES[spec.mouth], lead]
    .filter((adjective): adjective is Adjective => adjective !== undefined)
    .map((adjective) => adjective[genderIndex]);
  const words = adjectives.filter((adjective) => !adjective.startsWith('à '));
  const phrases = adjectives.filter((adjective) => adjective.startsWith('à '));
  return [name, words.join(' et '), phrases.join(' ')].filter((part) => part !== '').join(' ');
}

export function traitLabel(source: TraitSource): string {
  switch (source.part) {
    case 'eyes':
      return EYES_NAMES[source.id];
    case 'mouth':
      return MOUTH_NAMES[source.id];
    case 'limbs':
      return LIMBS_NAMES[source.id];
    case 'accessory':
      return ACCESSORY_NAMES[source.id];
    case 'palette':
      return `Palette ${PALETTE_NAMES[source.id].toLowerCase()}`;
  }
}

const percent = (fraction: number) => `${Math.round(Math.abs(fraction) * 100)}${NNBSP}%`;
const signed = (fraction: number) => `${fraction < 0 ? '−' : '+'}${percent(fraction)}`;

function effectText(effect: TraitEffect): string {
  switch (effect.kind) {
    case 'stat':
      return `${signed(effect.value)} ${STAT_NAMES[effect.stat]}`;
    case 'crit':
      return `${signed(effect.value)} critique`;
    case 'burn':
      return `brûlure ${percent(effect.value)} PV/s`;
    case 'souls':
      return `${signed(effect.value)} d’âmes`;
    case 'allStats':
      return `×${String(effect.multiplier).replace('.', ',')} toutes stats`;
  }
}

/** « +10 % attaque et défense », « +15 % attaque, −15 % défense ». */
export function traitEffectText(trait: Trait): string {
  const parts: string[] = [];
  trait.effects.forEach((effect, index) => {
    const previous = trait.effects[index - 1];
    const sameBonus =
      effect.kind === 'stat' && previous?.kind === 'stat' && previous.value === effect.value;
    if (sameBonus) {
      parts[parts.length - 1] += ` et ${STAT_NAMES[effect.stat]}`;
    } else {
      parts.push(effectText(effect));
    }
  });
  return parts.join(', ');
}
