import { existsSync } from 'node:fs'
import path from 'node:path'

export type ResolveTSFileIdImpl = (
  id: string,
  importer: string,
) => Promise<string | undefined> | string | undefined

export const resolveTSFileId: ResolveTSFileIdImpl = (id, importer) => {
  return resolveTSFileIdImpl(id, importer)
}

/**
 * @limitation don't node_modules and JavaScript file
 */
export const resolveTSFileIdNode: ResolveTSFileIdImpl = (
  id: string,
  importer: string,
) => {
  function tryResolve(id: string, importer: string) {
    const filePath = path.resolve(importer, '..', id)
    if (!existsSync(filePath)) return
    return filePath
  }
  return (
    tryResolve(id, importer) ||
    tryResolve(`${id}.ts`, importer) ||
    tryResolve(`${id}.d.ts`, importer) ||
    tryResolve(`${id}/index`, importer) ||
    tryResolve(`${id}/index.ts`, importer) ||
    tryResolve(`${id}/index.d.ts`, importer)
  )
}

let resolveTSFileIdImpl: ResolveTSFileIdImpl = resolveTSFileIdNode

export function setResolveTSFileIdImpl(impl: ResolveTSFileIdImpl): void {
  resolveTSFileIdImpl = impl
}
