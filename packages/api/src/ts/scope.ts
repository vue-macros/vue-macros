import { readFile } from 'node:fs/promises'
import { type Statement, type TSModuleBlock } from '@babel/types'
import {
  REGEX_SUPPORTED_EXT,
  babelParse,
  getFileCodeAndLang,
} from '@vue-macros/common'
import { type TSNamespace } from './namespace'

export interface TSScopeBase {
  exports?: TSNamespace
  declarations?: TSNamespace
}

export interface TSFile extends TSScopeBase {
  kind: 'file'
  filePath: string
  content: string
  /** could be undefined if it's a JSON file */
  ast: Statement[] | undefined
}

export interface TSModule extends TSScopeBase {
  kind: 'module'
  ast: TSModuleBlock
  scope: TSScope
}

export type TSScope = TSFile | TSModule

export const tsFileCache: Record<string, TSFile> = {}
export async function getTSFile(filePath: string): Promise<TSFile> {
  if (tsFileCache[filePath]) return tsFileCache[filePath]
  const content = await readFile(filePath, 'utf-8')
  const { code, lang } = getFileCodeAndLang(content, filePath)

  return (tsFileCache[filePath] = {
    kind: 'file',
    filePath,
    content,
    ast: REGEX_SUPPORTED_EXT.test(filePath)
      ? babelParse(code, lang).body
      : undefined,
  })
}

interface ResolvedTSScope {
  isFile: boolean
  file: TSFile
  body: Statement[] | undefined
  exports?: TSNamespace
  declarations?: TSNamespace
}
export function resolveTSScope(scope: TSScope): ResolvedTSScope {
  const isFile = scope.kind === 'file'

  let parentScope: ResolvedTSScope | undefined
  if (!isFile) parentScope = resolveTSScope(scope.scope)

  const file = isFile ? scope : parentScope!.file
  const body = isFile ? scope.ast : scope.ast.body
  const exports = scope.exports
  const declarations: TSNamespace | undefined = isFile
    ? scope.declarations
    : { ...resolveTSScope(scope.scope).declarations!, ...scope.declarations }

  return {
    isFile,
    file,
    body,
    declarations,
    exports,
  }
}
