import { existsSync } from 'node:fs'
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

    return {
      name,
      enforce: 'pre',

      buildStart() {
        if (meta.framework === 'rollup' || meta.framework === 'vite') {
          const ctx = this as PluginContext
          const resolveFn: ResolveTSFileIdImpl = async (id, importer) => {
            let resolved = (await ctx.resolve(id, importer))?.id
            if (!resolved) return
            if (existsSync(resolved)) {
              collectReferencedFile(importer, resolved)
              return resolved
            }

            resolved = (await ctx.resolve(resolved))?.id
            if (resolved && existsSync(resolved)) {
              collectReferencedFile(importer, resolved)
              return resolved
            }
          }
          setResolveTSFileIdImpl(resolveFn)
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
          function getAffectedModules(file: string): Set<ModuleNode> {
            if (!referencedFiles.has(file)) return new Set([])
            const modules = new Set<ModuleNode>([])
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
