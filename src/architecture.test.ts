/// <reference types="node" />
import { ESLint } from 'eslint';
import path from 'node:path';

import eslintConfig from '../eslint.config.js';

// Lints code snippets as if they lived in a given layer, to prove the dependency rules of
// docs/ARCHITECTURE.md § 3 are enforced by `npm run lint`.
const ROOT = path.resolve(__dirname, '..');
const ARCHITECTURE_RULES = [
  'import/no-restricted-paths',
  'no-restricted-imports',
  'no-restricted-globals',
  'no-restricted-properties',
];

// Jest cannot run ESLint's dynamic import of the config file: pass the config object instead.
const eslint = new ESLint({
  cwd: ROOT,
  overrideConfigFile: true,
  overrideConfig: eslintConfig,
});

async function violations(file: string, code: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath: path.join(ROOT, file) });
  return result.messages
    .filter((message) => message.ruleId !== null && ARCHITECTURE_RULES.includes(message.ruleId))
    .map((message) => message.ruleId as string);
}

describe('engine purity', () => {
  it.each([
    ['react-native', "import { View } from 'react-native';\nexport const v = View;\n"],
    ['expo', "import * as Haptics from 'expo-haptics';\nexport const h = Haptics;\n"],
    ['another layer', "import { strings } from '@/i18n';\nexport const s = strings;\n"],
  ])('rejects an import of %s', async (_label, code) => {
    expect(await violations('src/engine/fixture.ts', code)).toContain('no-restricted-imports');
  });

  it('rejects a relative import leaving src/engine', async () => {
    const code = "import tokens from '../../design/tokens.json';\nexport const t = tokens;\n";
    expect(await violations('src/engine/fixture.ts', code)).toEqual(['import/no-restricted-paths']);
  });

  it('rejects Math.random()', async () => {
    const code = 'export const roll = (): number => Math.random();\n';
    expect(await violations('src/engine/fixture.ts', code)).toEqual(['no-restricted-properties']);
  });

  it.each([
    ['Date.now()', 'export const now = (): number => Date.now();\n'],
    ['new Date()', 'export const now = (): Date => new Date();\n'],
    ['performance.now()', 'export const now = (): number => performance.now();\n'],
  ])('rejects reading the clock with %s', async (_label, code) => {
    expect(await violations('src/engine/fixture.ts', code)).toEqual(['no-restricted-globals']);
  });

  it('accepts relative imports', async () => {
    const code = "import { clamp } from './math';\nexport const x = clamp(1, 0, 1);\n";
    expect(await violations('src/engine/fixture.ts', code)).toEqual([]);
  });

  it('keeps break_infinity.js behind the BigNum adapter', async () => {
    const code = "import Decimal from 'break_infinity.js';\nexport const d = new Decimal(1);\n";
    expect(await violations('src/engine/combat/fixture.ts', code)).toEqual([
      'no-restricted-imports',
    ]);
    expect(await violations('src/engine/numbers/bigNum.ts', code)).toEqual([]);
  });

  it('lets engine tests use test libraries', async () => {
    const code = "import * as fc from 'fast-check';\nexport const a = fc.integer();\n";
    expect(await violations('src/engine/fixture.test.ts', code)).toEqual([]);
  });
});

describe('layer boundaries', () => {
  const importFeatures =
    "import { HomeScreen } from '@/features/home/HomeScreen';\nexport const s = HomeScreen;\n";

  it.each(['src/ui', 'src/render', 'src/state', 'src/services'])(
    '%s never imports features',
    async (layer) => {
      expect(await violations(`${layer}/fixture.tsx`, importFeatures)).toEqual([
        'import/no-restricted-paths',
      ]);
    },
  );

  it('ui never imports engine', async () => {
    const code = "import { clamp } from '@/engine/math';\nexport const c = clamp;\n";
    expect(await violations('src/ui/fixture.tsx', code)).toEqual(['import/no-restricted-paths']);
  });

  it('features may import ui and i18n', async () => {
    const code =
      "import { strings } from '@/i18n';\nimport { fontFamily } from '@/ui/fonts';\n" +
      'export const x = [strings, fontFamily];\n';
    expect(await violations('src/features/fixture.tsx', code)).toEqual([]);
  });
});
