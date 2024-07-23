import { isTSDeclaration } from './is'
import { resolveTSFileId } from './resolve-file'
import {
  resolveTSReferencedType,
  type TSResolvedType,
} from './resolve-reference'
import { getTSFile, resolveTSScope, type TSScope } from './scope'

export const namespaceSymbol: unique symbol = Symbol('namespace')
export type TSNamespace = {
  [K in string]: TSResolvedType | TSNamespace | undefined
} & { [namespaceSymbol]: true }

export function isTSNamespace(val: unknown): val is TSNamespace {
  return !!val && typeof val === 'object' && namespaceSymbol in val
}

/**
 * Get exports of the TS file.
 *
 * @limitation don't support non-TS declaration (e.g. class, function...)
 */
export async function resolveTSNamespace(scope: TSScope): Promise<void> {
  if (scope.exports) return

  const exports: TSNamespace = {
    [namespaceSymbol]: true,
  }
  scope.exports = exports

  const declarations: TSNamespace = {
    [namespaceSymbol]: true,
    ...scope.declarations,
  }
  scope.declarations = declarations

  const { body, file } = resolveTSScope(scope)
  for (const stmt of body || []) {
    if (
      stmt.type === 'ExportDefaultDeclaration' &&
      isTSDeclaration(stmt.declaration)
    ) {
      exports.default = await resolveTSReferencedType({
        scope,
        type: stmt.declaration,
      })
    } else if (stmt.type === 'ExportAllDeclaration') {
      const resolved = await resolveTSFileId(stmt.source.value, file.filePath)
      if (!resolved) continue

      const sourceScope = await getTSFile(resolved)
      await resolveTSNamespace(sourceScope)

      Object.assign(exports, sourceScope.exports!)
    } else if (stmt.type === 'ExportNamedDeclaration') {
      let sourceExports: TSNamespace

      if (stmt.source) {
        const resolved = await resolveTSFileId(stmt.source.value, file.filePath)
        if (!resolved) continue

        const scope = await getTSFile(resolved)
        await resolveTSNamespace(scope)
        sourceExports = scope.exports!
      } else {
        sourceExports = declarations
      }

      for (const specifier of stmt.specifiers) {
        let exported: TSNamespace[string]
        if (specifier.type === 'ExportDefaultSpecifier') {
          // export x from 'xxx'
          exported = sourceExports.default
        } else if (specifier.type === 'ExportNamespaceSpecifier') {
          // export * as x from 'xxx'
          exported = sourceExports
        } else if (specifier.type === 'ExportSpecifier') {
          // export { x } from 'xxx'
          exported = sourceExports![specifier.local.name]
        } else {
          throw new Error(`Unknown export type: ${(specifier as any).type}`)
        }

        const name =
          specifier.exported.type === 'Identifier'
            ? specifier.exported.name
            : specifier.exported.value
        exports[name] = exported
      }

      // export interface A {}
      if (isTSDeclaration(stmt.declaration)) {
        const decl = stmt.declaration

        if (decl.id?.type === 'Identifier') {
          const exportedName = decl.id.name
          declarations[exportedName] = exports[exportedName] =
            await resolveTSReferencedType({
              scope,
              type: decl,
            })
        }
      }
    }

    // declarations
    else if (isTSDeclaration(stmt)) {
      if (stmt.id?.type !== 'Identifier') continue

      declarations[stmt.id.name] = await resolveTSReferencedType({
        scope,
        type: stmt,
      })
    } else if (stmt.type === 'ImportDeclaration') {
      const resolved = await resolveTSFileId(stmt.source.value, file.filePath)
      if (!resolved) continue

      const importScope = await getTSFile(resolved)
      await resolveTSNamespace(importScope)
      const exports = importScope.exports!

      for (const specifier of stmt.specifiers) {
        const local = specifier.local.name

        let imported: TSNamespace[string]
        if (specifier.type === 'ImportDefaultSpecifier') {
          imported = exports.default
        } else if (specifier.type === 'ImportNamespaceSpecifier') {
          imported = exports
        } else if (specifier.type === 'ImportSpecifier') {
          const name =
            specifier.imported.type === 'Identifier'
              ? specifier.imported.name
              : specifier.imported.value
          imported = exports[name]
        } else {
          throw new Error(`Unknown import type: ${(specifier as any).type}`)
        }
        declarations[local] = imported
      }
    }
  }
}
