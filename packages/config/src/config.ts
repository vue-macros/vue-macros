import { makeSynchronized } from 'make-synchronized'
import type { Options } from './options'

export function loadConfig(cwd: string): Omit<Options, 'plugins'> {
  const url = import.meta.url
  const isDist = url.endsWith('.js')
  const filename = 'config-worker.js'
  const workerPath = new URL(
    isDist ? `./${filename}` : `../dist/${filename}`,
    url,
  )
  const { loadConfigAsync } =
    makeSynchronized<typeof import('./config-worker')>(workerPath)
  return loadConfigAsync(cwd)
}
