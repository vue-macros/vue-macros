import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { defineConfig } from 'monoman'
import { type Options } from 'tsup'
import fg from 'fast-glob'

function getPkgName(filepath: string) {
  const relative = path.relative(process.cwd(), filepath)
  const [, pkgName] = relative.split(path.sep)
  return pkgName
}

export default defineConfig([
  {
    include: ['packages/*/package.json'],
    type: 'json',
    async write(data: Record<string, any>, { filepath }) {
      const pkgRoot = path.resolve(filepath, '..')
      const pkgSrc = path.resolve(pkgRoot, 'src')
      const pkgName = getPkgName(filepath)
      const isESM = data.type === 'module'
      const cjsPrefix = isESM ? 'c' : ''
      const esmPrefix = isESM ? '' : 'm'

      const descriptions: Record<string, string> = {
        'define-options': 'Add defineOptions macro for Vue <script setup>.',
        macros: 'Explore more macros and syntax sugar to Vue.',
        volar: 'Volar plugin for Vue Macros.',
        devtools: 'Devtools plugin for Vue Macros.',
        api: 'General API for Vue Macros.',
      }
      if (!data.private) {
        data.description =
          descriptions[pkgName] || `${pkgName} feature from Vue Macros.`
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
      if (pkgName === 'define-options') {
        data.homepage =
          'https://github.com/vue-macros/vue-macros/tree/main/packages/define-options#readme'
      } else {
        data.homepage = 'https://github.com/vue-macros/vue-macros#readme'
      }

      data.bugs = { url: 'https://github.com/vue-macros/vue-macros/issues' }
      data.repository = {
        type: 'git',
        url: 'git+https://github.com/vue-macros/vue-macros.git',
        directory: `packages/${pkgName}`,
      }
      // data.author = '三咲智子 <sxzz@sxzz.moe>'
      data.engines = { node: '>=16.14.0' }

      if (!existsSync(path.resolve(pkgRoot, 'index.js'))) {
        data.files = ['dist']
        if ((await fg('*.d.ts', { cwd: pkgRoot })).length > 0) {
          data.files.push('*.d.ts')
        }
      } else {
        data.files = ['index.js']
      }

      data.files.sort()

      const tsupFile = path.resolve(pkgRoot, 'tsup.config.ts')
      if (!data.meta?.skipExports && existsSync(tsupFile)) {
        const tsupConfig: Options = await import(tsupFile)
        const format = tsupConfig.format || []
        const hasCJS = format.includes('cjs')
        const hasESM = format.includes('esm')

        const entries = (
          await fg(tsupConfig.entry as string[], {
            cwd: pkgRoot,
            absolute: true,
          })
        ).map((file) => path.basename(path.relative(pkgSrc, file), '.ts'))

        data.exports = {
          ...Object.fromEntries(
            entries
              .map((entry) => {
                const key = entry === 'index' ? '.' : `./${entry}`
                const exports: Record<string, any> = {
                  dev: `./src/${entry}.ts`,
                  types: {},
                }
                if (hasCJS) {
                  exports.types.require = `./dist/${entry}.d.${cjsPrefix}ts`
                  exports.require = `./dist/${entry}.${cjsPrefix}js`
                }
                if (hasESM) {
                  exports.types.import = `./dist/${entry}.d.${esmPrefix}ts`
                  exports.import = `./dist/${entry}.${esmPrefix}js`
                }

                return [key, exports] as const
              })
              .sort(([a], [b]) => a.localeCompare(b))
          ),
          './*': ['./*', './*.d.ts'],
        }

        const onlyIndex = entries.length === 1 && entries[0] === 'index'

        if (onlyIndex) delete data.typesVersions
        else
          data.typesVersions = {
            '*': {
              '*': ['./dist/*', './*'],
            },
          }
      }

      if (
        Object.keys(data.dependencies || {}).includes('unplugin') ||
        data?.meta?.plugin
      ) {
        data.keywords.push('unplugin')
      }

      return data
    },
  },
  {
    include: ['packages/*/README.md'],
    exclude: ['packages/define-options/README.md'],
    type: 'text',
    async write(_, ctx) {
      const pkgPath = path.resolve(path.dirname(ctx.filepath), 'package.json')
      const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'))
      const pkgName = pkg.name

      return `# ${pkgName} [![npm](https://img.shields.io/npm/v/${pkgName}.svg)](https://npmjs.com/package/${pkgName})\n
Please refer to [README.md](https://github.com/vue-macros/vue-macros#readme)\n`
    },
  },
])
