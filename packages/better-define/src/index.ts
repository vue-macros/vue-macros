import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import { REGEX_SETUP_SFC, REGEX_VUE_SFC } from '@vue-macros/common'
import { setResolveTSFileIdImpl, tsFileCache } from '@vue-macros/api'
import { transformBetterDefine } from './core'
import type { ModuleNode } from 'vite'
import type { ResolveTSFileIdImpl } from '@vue-macros/api'
import type { PluginContext } from 'rollup'
import type { FilterPattern } from '@rollup/pluginutils'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  isProduction?: boolean
}

export type OptionsResolved = Omit<Required<Options>, 'exclude'> & {
  exclude?: FilterPattern
}

function resolveOptions(options: Options): OptionsResolved {
  return {
    include: [REGEX_VUE_SFC, REGEX_SETUP_SFC],
    isProduction: process.env.NODE_ENV === 'production',
    ...options,
  }
}

const name = 'unplugin-vue-better-define'

export default createUnplugin<Options | undefined, false>(
  (userOptions = {}, meta) => {
    const options = resolveOptions(userOptions)
    const filter = createFilter(options.include, options.exclude)

    const referencedFiles = new Map<
      string /* file */,
      Set<string /* importer */>
    >()

    function collectReferencedFile(importer: string, file: string) {
      if (!importer) return
      if (!referencedFiles.has(file)) {
        referencedFiles.set(file, new Set([importer]))
      } else {
        referencedFiles.get(file)!.add(importer)
      }
    }

    const RollupResolve =
      (ctx: PluginContext): ResolveTSFileIdImpl =>
      async (id, importer) => {
        async function tryPkgEntry() {
          try {
            const pkgPath = (await ctx.resolve(`${id}/package.json`, importer))
              ?.id
            if (!pkgPath) return

            const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'))
            const types = pkg.types || pkg.typings
            if (!types) return

            const entry = path.resolve(pkgPath, '..', types)
            return existsSync(entry) ? entry : undefined
          } catch {}
        }

        const tryResolve = async (id: string) => {
          try {
            return (
              (await ctx.resolve(id, importer))?.id ||
              (await ctx.resolve(`${id}.d`, importer))?.id
            )
          } catch {}

          return
        }

        if (!id.startsWith('.')) {
          const entry = await tryPkgEntry()
          if (entry) return entry
        }

        let resolved = await tryResolve(id)
        if (!resolved) return
        if (existsSync(resolved)) {
          collectReferencedFile(importer, resolved)
          return resolved
        }

        resolved = await tryResolve(resolved)
        if (resolved && existsSync(resolved)) {
          collectReferencedFile(importer, resolved)
          return resolved
        }
      }

    return {
      name,
      enforce: 'pre',

      buildStart() {
        if (meta.framework === 'rollup' || meta.framework === 'vite') {
          setResolveTSFileIdImpl(RollupResolve(this as PluginContext))
        }
      },

      transformInclude(id) {
        return filter(id)
      },

      async transform(code, id) {
        try {
          return await transformBetterDefine(code, id, options.isProduction)
        } catch (err: unknown) {
          this.warn(`${name} ${err}`)
          console.warn(err)
        }
      },

      vite: {
        configResolved(config) {
          options.isProduction = config.isProduction
        },

        handleHotUpdate({ file, server, modules }) {
          const cache = new Map<string, Set<ModuleNode>>()
          function getAffectedModules(file: string): Set<ModuleNode> {
            if (cache.has(file)) return cache.get(file)!

            if (!referencedFiles.has(file)) return new Set([])
            const modules = new Set<ModuleNode>([])
            cache.set(file, modules)
            for (const importer of referencedFiles.get(file)!) {
              const mods = server.moduleGraph.getModulesByFile(importer)
              if (mods) mods.forEach((m) => modules.add(m))

              getAffectedModules(importer).forEach((m) => modules.add(m))
            }
            return modules
          }

          if (tsFileCache[file]) delete tsFileCache[file]

          const affected = getAffectedModules(file)
          return [...modules, ...affected]
        },
      },
    }
  }
)
