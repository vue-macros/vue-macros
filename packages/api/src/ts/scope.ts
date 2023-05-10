import { readFile } from 'node:fs/promises'
import { type Statement, type TSModuleBlock } from '@babel/types'
import { babelParse, getFileCodeAndLang } from '@vue-macros/common'
import { type TSResolvedType } from './resolve-reference'

export interface TSFile {
  filePath: string
  content: string
  ast: Statement[]
}

export type TSScope = TSFile | TSResolvedType<TSModuleBlock>

export const tsFileCache: Record<string, TSFile> = {}
export async function getTSFile(filePath: string): Promise<TSFile> {
  if (tsFileCache[filePath]) return tsFileCache[filePath]
  const content = await readFile(filePath, 'utf-8')
  const { code, lang } = getFileCodeAndLang(content, filePath)
  const program = babelParse(code, lang)
  return (tsFileCache[filePath] = {
    filePath,
    content,
    ast: program.body,
  })
}

export function resolveTSScope(scope: TSScope): {
  isFile: boolean
  file: TSFile
  body: Statement[]
} {
  const isFile = 'ast' in scope
  const file = isFile ? scope : resolveTSScope(scope.scope).file
  const body = isFile ? scope.ast : scope.type.body

  return {
    isFile,
    file,
    body,
  }
}
