import { KAMIDANA_IDS } from '../../gameState';
import type { Migration } from './index';

/** Schema 2 adds the Kamidana: a 1.0 save starts with every upgrade at level 0. */
export const v1ToV2: Migration = (state) => ({
  ...state,
  schemaVersion: 2,
  kamidana: Object.fromEntries(KAMIDANA_IDS.map((id) => [id, 0])),
});
