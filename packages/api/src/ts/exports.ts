import {
  type TSResolvedType,
  resolveTSReferencedType,
} from './resolve-reference'
import { type TSScope, getTSFile, resolveTSScope } from './scope'
import { isTSDeclaration } from './is'
import { resolveTSFileId } from './impl'

export const exportsSymbol = Symbol('exports')
export type TSExports = {
  [K in string]: TSResolvedType | TSExports | undefined
} & { [exportsSymbol]: true }
export const tsFileExportsCache: Map<TSScope, TSExports> = new Map()

export function isTSExports(val: unknown): val is TSExports {
  return !!val && typeof val === 'object' && exportsSymbol in val
}

/**
 * Get exports of the TS file.
 *
 * @limitation don't support non-TS declaration (e.g. class, function...)
 * @limitation don't support `export default`, since TS don't support it currently.
 * @limitation don't support `export * as xxx from '...'` (aka namespace).
 */
export async function resolveTSExports(scope: TSScope): Promise<TSExports> {
  if (tsFileExportsCache.has(scope)) return tsFileExportsCache.get(scope)!

  const exports: TSExports = {
    [exportsSymbol]: true,
  }
  tsFileExportsCache.set(scope, exports)

  const { body, file } = resolveTSScope(scope)
  for (const stmt of body) {
    if (stmt.type === 'ExportDefaultDeclaration') {
      // TS don't support it.
    } else if (stmt.type === 'ExportAllDeclaration') {
      const resolved = await resolveTSFileId(stmt.source.value, file.filePath)
      if (!resolved) continue
      const sourceExports = await resolveTSExports(await getTSFile(resolved))
      Object.assign(exports, sourceExports)
    } else if (stmt.type === 'ExportNamedDeclaration') {
      let sourceExports: Awaited<ReturnType<typeof resolveTSExports>>
      if (stmt.source) {
        const resolved = await resolveTSFileId(stmt.source.value, file.filePath)
        if (!resolved) continue
        sourceExports = await resolveTSExports(await getTSFile(resolved))
      }

      for (const specifier of stmt.specifiers) {
        if (specifier.type === 'ExportDefaultSpecifier') {
          // default export: TS don't support it.
          continue
        }

        if (specifier.type === 'ExportNamespaceSpecifier') {
          exports[specifier.exported.name] = sourceExports!
        } else {
          const exportedName =
            specifier.exported.type === 'Identifier'
              ? specifier.exported.name
              : specifier.exported.value

          if (stmt.source) {
            exports[exportedName] = sourceExports![specifier.local.name]
          } else {
            exports[exportedName] = await resolveTSReferencedType({
              scope,
              type: specifier.local,
            })
          }
        }
      }

      if (isTSDeclaration(stmt.declaration)) {
        const decl = stmt.declaration

        if (decl.id?.type === 'Identifier') {
          const exportedName = decl.id.name
          exports[exportedName] = await resolveTSReferencedType({
            scope,
            type: decl,
          })
        }
      }
    }
  }

  return exports
}
