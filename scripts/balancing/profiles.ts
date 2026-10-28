export interface Session {
  /** Hour of the day the session starts. */
  readonly atHour: number;
  readonly activeMinutes: number;
}

export interface Profile {
  readonly id: string;
  readonly label: string;
  readonly sessions: readonly Session[];
  /** Average taps per second during active play. */
  readonly tapsPerSecond: number;
  /** The bot starts a Festival when stuck, if the permanent bonus grows by this factor at least. */
  readonly festivalGrowth: number;
}

export const PROFILES: readonly Profile[] = [
  {
    id: 'actif',
    label: 'Joueur actif : 4 sessions de 30 min par jour',
    sessions: [
      { atHour: 8, activeMinutes: 30 },
      { atHour: 12.5, activeMinutes: 30 },
      { atHour: 18, activeMinutes: 30 },
      { atHour: 21.5, activeMinutes: 30 },
    ],
    tapsPerSecond: 3,
    festivalGrowth: 1.15,
  },
  {
    id: 'trois-sessions',
    label: 'Joueur régulier : 3 sessions de 5 min par jour',
    sessions: [
      { atHour: 8, activeMinutes: 5 },
      { atHour: 13, activeMinutes: 5 },
      { atHour: 20, activeMinutes: 5 },
    ],
    tapsPerSecond: 2,
    festivalGrowth: 1.15,
  },
  {
    id: 'hors-ligne',
    label: "Joueur hors ligne : 3 passages d'1 min par jour (récolte, achats, Gardien)",
    sessions: [
      { atHour: 8, activeMinutes: 1 },
      { atHour: 16, activeMinutes: 1 },
      { atHour: 23, activeMinutes: 1 },
    ],
    tapsPerSecond: 0,
    festivalGrowth: 1.15,
  },
  {
    id: 'perseverant',
    label: 'Joueur régulier persévérant : relance le Festival dès +5 % de bonus (fin de partie)',
    sessions: [
      { atHour: 8, activeMinutes: 5 },
      { atHour: 13, activeMinutes: 5 },
      { atHour: 20, activeMinutes: 5 },
    ],
    tapsPerSecond: 2,
    festivalGrowth: 1.05,
  },
];
