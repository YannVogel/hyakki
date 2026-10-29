import type { Milestone, RunResult } from './run';

const round = (value: number, digits = 2) => Number(value.toFixed(digits));

export function snapshotsCsv(result: RunResult): string {
  const header =
    'jour,heures_reelles,minutes_actives,defile,vague,record_defile,meilleur_record,log10_ames,etincelles,ofuda,shikigami,gardiens';
  const rows = result.snapshots.map((s) =>
    [
      s.day,
      round(s.realHours),
      round(s.activeMinutes, 0),
      s.parade,
      s.wave,
      s.maxWave,
      s.bestWave,
      round(s.soulsLog10),
      s.sparks,
      s.ofuda,
      s.shikigami,
      s.guardians,
    ].join(','),
  );
  return [header, ...rows].join('\n') + '\n';
}

export function milestonesCsv(results: readonly RunResult[]): string {
  const header = 'profil,jalon,heures_reelles,minutes_actives';
  const rows = results.flatMap((result) =>
    result.milestones.map((m) =>
      [result.profile.id, m.event, round(m.realHours), round(m.activeMinutes, 1)].join(','),
    ),
  );
  return [header, ...rows].join('\n') + '\n';
}

const find = (milestones: readonly Milestone[], event: string) =>
  milestones.find((milestone) => milestone.event === event);

const describe = (milestone: Milestone | undefined) =>
  milestone === undefined
    ? '—'
    : `${round(milestone.realHours / 24, 1)} j (${round(milestone.activeMinutes, 0)} min actives)`;

export function summaryMarkdown(results: readonly RunResult[], days: number): string {
  const events = [
    'gardien-1',
    'festival-1',
    'kamidana-1',
    'gardien-5',
    'kamidana-tous',
    'record-800',
    'gardien-10',
    'eveil-2',
    'kamidana-max',
  ];
  const lines = [
    `# Résumé de la simulation (${days} jours)`,
    '',
    'Généré par `npx tsx scripts/simulate.ts` : ne pas modifier à la main.',
    '',
    `| Profil | ${events.join(' | ')} | Meilleur record | Festivals |`,
    `|---|${events.map(() => '---').join('|')}|---|---|`,
    ...results.map((result) => {
      const last = result.snapshots[result.snapshots.length - 1];
      const festivals = result.milestones.filter((m) => m.event.startsWith('festival')).length;
      return `| ${result.profile.label} | ${events.map((event) => describe(find(result.milestones, event))).join(' | ')} | vague ${last.bestWave} | ${festivals} |`;
    }),
    '',
  ];
  return lines.join('\n');
}
