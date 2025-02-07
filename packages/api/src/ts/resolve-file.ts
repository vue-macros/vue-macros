import path from 'node:path'
import { tsFileCache } from './scope'
import type { ResolverFactory } from 'oxc-resolver'
import type { ModuleNode, Plugin } from 'vite'

let typesResolver: ResolverFactory

const referencedFiles = new Map<string /* file */, Set<string /* importer */>>()

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

export async function resolveDts(
  id: string,
  importer: string,
): Promise<string | undefined> {
  const cached = resolveCache.get(importer)?.get(id)
  if (cached) return cached

  if (!typesResolver) {
    const { ResolverFactory } = await import('oxc-resolver')
    typesResolver = new ResolverFactory({
      mainFields: ['types'],
      conditionNames: ['types', 'import'],
      extensions: ['.d.ts', '.ts'],
    })
  }

  const { error, path: resolved } = await typesResolver.async(
    path.dirname(importer),
    id,
  )
  if (error || !resolved) return

  collectReferencedFile(importer, resolved)
  if (resolveCache.has(importer)) {
    resolveCache.get(importer)!.set(id, resolved)
  } else {
    resolveCache.set(importer, new Map([[id, resolved]]))
  }
  return resolved
}

export const resolveDtsHMR: NonNullable<Plugin['handleHotUpdate']> = ({
  file,
  server,
  modules,
}) => {
  const cache = new Map<string, Set<ModuleNode>>()
  if (tsFileCache[file]) delete tsFileCache[file]

  const affected = getAffectedModules(file)
  return [...modules, ...affected]

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
}
