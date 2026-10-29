import { BALANCE, KAMIDANA_IDS, TEAM_SIZE } from '@/engine';
import { strings } from '@/i18n';

// The rules, with every number read from the balance: a rebalancing updates them by itself.

const decimal = (value: number) => String(Math.round(value * 100) / 100).replace('.', ',');
const percent = (fraction: number) => decimal(fraction * 100);
const seconds = (ms: number) => decimal(ms / 1000);

const { crit, talismans, guardian, souls, shikigami, festival, offline } = BALANCE;
const text = strings.rules.sections;

export type RuleSection = keyof typeof strings.rules.sections;

export const RULES: readonly { readonly key: RuleSection; readonly body: string }[] = [
  { key: 'parade', body: text.parade.body(percent(crit.baseChance), decimal(crit.multiplier)) },
  {
    key: 'talismans',
    body: text.talismans.body(
      decimal(talismans.kitsunebi.damageMultiplier),
      seconds(talismans.kitsunebi.burnDurationMs),
      decimal(talismans.raijin.damageMultiplier),
      seconds(talismans.kekkai.soulsBoostDurationMs),
      seconds(talismans.kekkai.guardianExtraMs),
      `${seconds(talismans.kitsunebi.cooldownMs)}\u00a0s, ${seconds(talismans.raijin.cooldownMs)}\u00a0s et ${seconds(talismans.kekkai.cooldownMs)}\u00a0s`,
    ),
  },
  {
    key: 'guardians',
    body: text.guardians.body(
      decimal(guardian.every),
      seconds(guardian.timeLimitMs),
      decimal(talismans.weaknessMultiplier),
      percent(souls.tierBonus),
    ),
  },
  { key: 'awakening', body: text.awakening.body(decimal(guardian.count)) },
  { key: 'sanctuary', body: text.sanctuary.body },
  { key: 'kamidana', body: text.kamidana.body(decimal(KAMIDANA_IDS.length)) },
  {
    key: 'shikigami',
    body: text.shikigami.body(
      percent(shikigami.captureChance.common),
      percent(shikigami.captureChance.rare),
      percent(shikigami.captureChance.epic),
      percent(shikigami.captureChance.legendary),
      decimal(TEAM_SIZE),
    ),
  },
  { key: 'festival', body: text.festival.body(percent(festival.bonusPerSpark)) },
  {
    key: 'offline',
    body: text.offline.body(
      percent(offline.efficiency),
      decimal(offline.baseCapHours),
      decimal(offline.maxCapHours),
    ),
  },
];
