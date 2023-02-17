import path from 'node:path'
import { defineConfig } from 'monoman'

function getPkgName(filepath: string) {
  const relative = path.relative(process.cwd(), filepath)
  const [, pkgName] = relative.split(path.sep)
  return pkgName
}

export default defineConfig([
  {
    include: ['packages/*/package.json'],
    type: 'json',
    write(data: Record<string, any>, { filepath }) {
      const pkgName = getPkgName(filepath)

      const descriptions: Record<string, string> = {
        'define-options': 'Add defineOptions macro for Vue <script setup>.',
        macros: 'Explore and extend more macros and syntax sugar to Vue.',
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
          'https://github.com/sxzz/unplugin-vue-macros/tree/main/packages/define-options#readme'
      } else {
        data.homepage = 'https://github.com/sxzz/unplugin-vue-macros#readme'
      }

      data.bugs = { url: 'https://github.com/sxzz/unplugin-vue-macros/issues' }
      data.repository = {
        type: 'git',
        url: 'git+https://github.com/sxzz/unplugin-vue-macros.git',
        directory: `packages/${pkgName}`,
      }
      data.author = '三咲智子 <sxzz@sxzz.moe>'
      data.engines = { node: '>=14.19.0' }

      if (Object.keys(data.dependencies).includes('unplugin')) {
        const frameworks = ['vite', 'webpack', 'rollup', 'esbuild']
        data.keywords.push('unplugin')
        data.exports = {
          '.': {
            dev: './src/index.ts',
            types: './dist/index.d.ts',
            require: './dist/index.js',
            import: './dist/index.mjs',
          },
          ...Object.fromEntries(
            frameworks.map((framework) => [
              `./${framework}`,
              {
                dev: `./src/${framework}.ts`,
                types: `./dist/${framework}.d.ts`,
                require: `./dist/${framework}.js`,
                import: `./dist/${framework}.mjs`,
              },
            ])
          ),
          './*': ['./*', './*.d.ts'],
        }
        data.typesVersions = {
          '<=4.9': {
            '*': ['./dist/*', './*'],
          },
        }
      }

      return data
    },
  },
])
