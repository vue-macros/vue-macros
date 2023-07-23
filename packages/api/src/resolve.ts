import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { exports } from 'resolve.exports'
import { type PluginContext } from 'rollup'
import { type ModuleNode, type Plugin } from 'vite'
import { type ResolveTSFileIdImpl, tsFileCache } from './ts'

export const deepImportRE = /^([^@][^/]*)\/|^(@[^/]+\/[^/]+)\//

function isDts(id: string) {
  return /\.d\.[cm]?ts$/.test(id)
}

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
        const deepMatch = id.match(deepImportRE)
        const pkgId = deepMatch ? deepMatch[1] || deepMatch[2] : id

        try {
          const pkgPath = (await ctx.resolve(`${pkgId}/package.json`, importer))
            ?.id
          if (!pkgPath) return
          const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'))
          const pkgRoot = path.resolve(pkgPath, '..')

          if (deepMatch) {
            if (pkg.typesVersions) {
              const pkgPath = id.replace(`${pkgId}/`, '')
              for (const version of Object.values(pkg.typesVersions)) {
                for (const [entry, subpaths] of Object.entries(
                  version as Record<string, string[]>
                )) {
                  if (pkgPath !== entry.replace('*', pkgPath)) continue
                  for (const subpath of subpaths) {
                    const resolved = path.resolve(
                      pkgRoot,
                      subpath.replace('*', pkgPath)
                    )
                    if (isDts(resolved) && existsSync(resolved)) return resolved
                  }
                }
              }
            }

            const resolvedIds = exports(pkg, id, { conditions: ['types'] })
            if (!resolvedIds) return
            const resolved = resolvedIds.find(
              (id) => isDts(id) && existsSync(id)
            )
            if (resolved) return resolved
          } else {
            const types = pkg.types || pkg.typings
            if (!types) return

            const entry = path.resolve(pkgRoot, types)
            if (existsSync(entry)) return entry
          }
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

      if (id[0] !== '.') {
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
