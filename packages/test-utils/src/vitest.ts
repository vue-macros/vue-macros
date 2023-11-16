import path from 'node:path'
import glob, { type Options as GlobOptions } from 'fast-glob'
import { describe, expect, test } from 'vitest'
import { normalizePath } from '@rollup/pluginutils'

interface Options {
  params?: [name: string, values?: any[]][]
  promise?: boolean
}

const SKIP_VUE2 = !!process.env.SKIP_VUE2

export async function testFixtures(
  globs: string | string[],
  exec: (args: Record<string, any>, id: string) => any,
  options?: GlobOptions & Options,
): Promise<void>
export async function testFixtures(
  files: Record<string, string>,
  exec: (args: Record<string, any>, id: string, code: string) => any,
  options?: Options,
): Promise<void>
export async function testFixtures(
  globsOrFiles: string | string[] | Record<string, string>,
  cb: (args: Record<string, any>, id: string, code: string) => any,
  { params, promise, ...globOptions }: GlobOptions & Options = {},
) {
  let files: Record<string, string | undefined>

  if (typeof globsOrFiles === 'string' || Array.isArray(globsOrFiles)) {
    files = Object.fromEntries(
      (await glob(globsOrFiles, globOptions)).map((file) => [file, undefined]),
    )
  } else {
    files = globsOrFiles
  }

  for (const [id, code] of Object.entries(files)) {
    makeTests(id, code, [[normalizePath(id)], ...(params || [])])()
  }

  function getName(name: string, value: any) {
    return value !== undefined ? `${name} = ${String(value)}` : name
  }

  function makeTests(
    id: string,
    code: string | undefined,
    params: NonNullable<Options['params']>,
    args: Record<string, any> = {},
  ) {
    const [currParams, ...restParams] = params
    const [name, values = [undefined]] = currParams
    if (restParams.length > 0) {
      return () => {
        for (const value of values) {
          const currArgs = { ...args, [name]: value }

          describe(
            getName(name, value),
            makeTests(id, code, restParams, currArgs),
          )
        }
      }
    } else {
      return () => {
        for (const value of values) {
          const testName = getName(name, value)
          const isSkip = testName.includes('vue2') && SKIP_VUE2

          test.skipIf(isSkip)(testName, async () => {
            const currArgs = { ...args, [name]: value }
            const execute = () =>
              cb(currArgs, path.resolve(globOptions.cwd || '/', id), code!)
            if (id.includes('error')) {
              if (promise) {
                await expect(execute()).rejects.toThrowErrorMatchingSnapshot()
              } else {
                expect(execute).toThrowErrorMatchingSnapshot()
              }
            } else if (promise) {
              await expect(
                (execute() as Promise<any>).catch((error) => {
                  console.warn(error)
                  return Promise.reject(error)
                }),
              ).resolves.toMatchSnapshot()
            } else {
              expect(execute()).toMatchSnapshot()
            }
          })
        }
      }
    }
  }
}
