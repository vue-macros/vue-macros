import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { camelCase } from 'change-case'
import {
  defineConfig,
  noDuplicatedDeps,
  noDuplicatedPnpmLockfile,
} from 'monoman'
import { docsLink, githubLink } from './macros/repo'
import type { PackageJson } from 'pkg-types'

/// keep-sorted
const descriptions: Record<string, string> = {
  'define-options': 'Add defineOptions macro for Vue <script setup>.',
  'test-utils': 'Test utilities for Vue Macros.',
  api: 'General API for Vue Macros.',
  astro: 'Astro integration of Vue Macros.',
  config: 'Config API for Vue Macros.',
  devtools: 'Devtools plugin for Vue Macros.',
  macros: 'Explore more macros and syntax sugar to Vue.',
  volar: 'Volar plugin for Vue Macros.',
}

function getPkgName(filePath: string) {
  const relative = path.relative(import.meta.dirname, filePath)
  const [, pkgName] = relative.split(path.sep)
  return pkgName
}

let version: string | undefined

export default defineConfig([
  {
    include: ['packages/*/package.json'],
    type: 'json',
    async contents(data: PackageJson, { filePath }) {
      const pkgRoot = path.resolve(filePath, '..')
      const pkgSrc = path.resolve(pkgRoot, 'src')
      const pkgName = getPkgName(filePath)

      data.type = 'module'
      const hasRootDts = (await readdir(pkgRoot)).some((file) =>
        file.endsWith('.d.ts'),
      )

      if (!data.private) {
        data.version = version ||= data.version
        data.description =
          descriptions[pkgName] ||
          `${camelCase(pkgName)} feature from Vue Macros.`
        data.keywords = [
          'vue-macros',
          'macros',
          'vue',
          'sfc',
          'setup',
          'script-setup',
          pkgName,
        ]
      }
      data.license = 'MIT'
      data.homepage = docsLink
      data.bugs = { url: `${githubLink}/issues` }
      data.repository = {
        type: 'git',
        url: `git+${githubLink}.git`,
        directory: `packages/${pkgName}`,
      }
      // data.author = 'Kevin Deng <sxzz@sxzz.moe>'
      data.funding = 'https://github.com/sponsors/vue-macros'
      data.engines = { node: '>=20.18.0' }

      data.files = ['dist']
      if (hasRootDts) data.files.push('*.d.ts')
      data.files.sort()

      if (
        Object.keys(data.dependencies || {}).includes('unplugin') ||
        data?.meta?.plugin
      ) {
        data.keywords!.push('unplugin')

        // write unplugin entries
        const entries = [
          'vite',
          'webpack',
          'rollup',
          'esbuild',
          'rspack',
          'rolldown',
        ]
        Promise.all(
          entries.map((entry) =>
            writeFile(
              path.resolve(pkgSrc, `${entry}.ts`),
              `import unplugin from '.'\n
export default unplugin.${entry} as typeof unplugin.${entry}\n`,
              'utf8',
            ),
          ),
        )
      }

      data.publishConfig ||= {}
      data.publishConfig.access = 'public'
      data.publishConfig.tag = 'next'

      return data
    },
  },
  {
    include: ['packages/*/README.md'],
    exclude: ['packages/define-options/README.md'],
    type: 'text',
    async contents(_, ctx) {
      const pkgPath = path.resolve(path.dirname(ctx.filePath), 'package.json')
      const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'))
      const pkgName = pkg.name

      return `# ${pkgName} [![npm](https://img.shields.io/npm/v/${pkgName}.svg)](https://npmjs.com/package/${pkgName})\n
Please refer to [README.md](${githubLink}#readme)\n`
    },
  },
  ...noDuplicatedDeps({
    include: [
      'package.json',
      'packages/*/package.json',
      'docs/package.json',
      'playground/*/package.json',
    ],
  }),
  ...noDuplicatedDeps({
    include: [
      'package.json',
      'packages/*/package.json',
      'playground/*/package.json',
    ],
    ignores: ['vue'],
  }),
  ...noDuplicatedPnpmLockfile({
    deps: [
      'typescript',
      /vite(?!-(plugin-(vue-devtools|inspect)|hot-client))/,
      /vue\b(?!([/-]devtools))/,
      /twoslash/,
      /shiki/,
      /babel/,
      /esbuild/,
      /unocss/,
      /rolldown/,
      /oxc(?!-project\/types)/,
    ],
  }),
  ...noDuplicatedPnpmLockfile({
    deps: ['lru-cache', 'minimatch', 'debug', 'vite-plugin-vue-devtools'],
    allowMajor: true,
  }),
])
