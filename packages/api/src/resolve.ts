import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { type PluginContext } from 'rollup'
import { type ModuleNode, type Plugin } from 'vite'
import { type ResolveTSFileIdImpl, tsFileCache } from './ts'

export const RollupResolve = () => {
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

  const resolve =
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

      const cached = resolveCache.get(importer)?.get(id)
      if (cached) return cached

      if (!id.startsWith('.')) {
        const entry = await tryPkgEntry()
        if (entry) return withResolveCache(id, importer, entry)
      }

      let resolved = await tryResolve(id)
      if (!resolved) return
      if (existsSync(resolved)) {
        collectReferencedFile(importer, resolved)
        return withResolveCache(id, importer, resolved)
      }

      resolved = await tryResolve(resolved)
      if (resolved && existsSync(resolved)) {
        collectReferencedFile(importer, resolved)
        return withResolveCache(id, importer, resolved)
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
