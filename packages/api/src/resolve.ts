import path from 'node:path'
import { ResolverFactory } from 'oxc-resolver'
import { tsFileCache, type ResolveTSFileIdImpl } from './ts'
import type { PluginContext } from 'rollup'
import type { ModuleNode, Plugin } from 'vite'

const typesResolver = new ResolverFactory({
  mainFields: ['types'],
  conditionNames: ['types', 'import'],
  extensions: ['.d.ts', '.ts'],
})

export const OxcResolve = (): {
  resolve: (ctx: PluginContext) => ResolveTSFileIdImpl
  handleHotUpdate: NonNullable<Plugin['handleHotUpdate']>
} => {
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

  const resolveCache = new Map<
    string /* importer */,
    Map<string /* id */, string /* result */>
  >()

  function withResolveCache(id: string, importer: string, result: string) {
    if (!resolveCache.has(importer)) {
      resolveCache.set(importer, new Map([[id, result]]))
      return result
    }
    resolveCache.get(importer)!.set(id, result)
    return result
  }

  const resolve = (): ResolveTSFileIdImpl => {
    return async (id, importer) => {
      const cached = resolveCache.get(importer)?.get(id)
      if (cached) return cached
      const resolved = await typesResolver.async(path.dirname(importer), id)

      if (resolved.error || !resolved.path) return
      collectReferencedFile(importer, resolved.path)
      return withResolveCache(id, importer, resolved.path)
    }
  }

  const handleHotUpdate: NonNullable<Plugin['handleHotUpdate']> = ({
    file,
    server,
    modules,
  }) => {
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
  }

  return {
    resolve,
    handleHotUpdate,
  }
}
