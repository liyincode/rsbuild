import { join, resolve } from 'node:path';
import { build } from '@e2e/helper';
import { expect, test } from '@playwright/test';
import { pluginTypedCSSModules } from '@rsbuild/plugin-typed-css-modules';
import { fse } from '@rsbuild/shared';

const fixtures = __dirname;

const generatorTempDir = async (testDir: string) => {
  await fse.emptyDir(testDir);
  await fse.copy(join(fixtures, 'src'), testDir);

  return () => fse.remove(testDir);
};

test('should generator ts declaration correctly for css modules auto true', async () => {
  const testDir = join(fixtures, 'test-temp-src-1');
  const clear = await generatorTempDir(testDir);

  await build({
    cwd: __dirname,
    plugins: [pluginTypedCSSModules()],
    rsbuildConfig: {
      source: {
        entry: { index: resolve(testDir, 'index.js') },
      },
    },
  });

  expect(fse.existsSync(join(testDir, './a.css.d.ts'))).toBeFalsy();
  expect(fse.existsSync(join(testDir, './b.module.scss.d.ts'))).toBeTruthy();
  expect(fse.existsSync(join(testDir, './c.module.less.d.ts'))).toBeTruthy();
  expect(fse.existsSync(join(testDir, './d.global.less.d.ts'))).toBeFalsy();

  const content = fse.readFileSync(join(testDir, './b.module.scss.d.ts'), {
    encoding: 'utf-8',
  });

  expect(content).toMatch(/'the-b-class': string;/);
  expect(content).toMatch(/theBClass: string;/);
  expect(content).toMatch(/primary: string;/);
  expect(content).toMatch(/btn: string;/);

  await clear();
});

test('should generator ts declaration correctly for css modules auto function', async () => {
  const testDir = join(fixtures, 'test-temp-src-2');
  const clear = await generatorTempDir(testDir);

  await build({
    cwd: __dirname,
    plugins: [pluginTypedCSSModules()],
    rsbuildConfig: {
      source: {
        entry: { index: resolve(testDir, 'index.js') },
      },
      output: {
        cssModules: {
          auto: (path) => {
            return path.endsWith('.less');
          },
        },
      },
    },
  });

  expect(fse.existsSync(join(testDir, './a.css.d.ts'))).toBeFalsy();
  expect(fse.existsSync(join(testDir, './b.module.scss.d.ts'))).toBeFalsy();
  expect(fse.existsSync(join(testDir, './c.module.less.d.ts'))).toBeTruthy();
  expect(fse.existsSync(join(testDir, './d.global.less.d.ts'))).toBeTruthy();

  await clear();
});

test('should generator ts declaration correctly for css modules auto Regexp', async () => {
  const testDir = join(fixtures, 'test-temp-src-3');
  const clear = await generatorTempDir(testDir);

  await build({
    cwd: __dirname,
    plugins: [pluginTypedCSSModules()],
    rsbuildConfig: {
      source: {
        entry: { index: resolve(testDir, 'index.js') },
      },
      output: {
        cssModules: {
          auto: /\.module\./i,
        },
      },
    },
  });

  expect(fse.existsSync(join(testDir, './a.css.d.ts'))).toBeFalsy();
  expect(fse.existsSync(join(testDir, './b.module.scss.d.ts'))).toBeTruthy();
  expect(fse.existsSync(join(testDir, './c.module.less.d.ts'))).toBeTruthy();
  expect(fse.existsSync(join(testDir, './d.global.less.d.ts'))).toBeFalsy();

  await clear();
});

test('should generator ts declaration correctly for custom exportLocalsConvention', async () => {
  const testDir = join(fixtures, 'test-temp-src-4');
  const clear = await generatorTempDir(testDir);

  await build({
    cwd: __dirname,
    plugins: [pluginTypedCSSModules()],
    rsbuildConfig: {
      source: {
        entry: { index: resolve(testDir, 'index.js') },
      },
      output: {
        cssModules: {
          auto: /\.module\./i,
          exportLocalsConvention: 'asIs',
        },
      },
    },
  });

  expect(fse.existsSync(join(testDir, './b.module.scss.d.ts'))).toBeTruthy();

  const content = fse.readFileSync(join(testDir, './b.module.scss.d.ts'), {
    encoding: 'utf-8',
  });

  expect(content).toMatch(/'the-b-class': string;/);
  expect(content).not.toMatch(/'theBClass': string;/);

  await clear();
});
