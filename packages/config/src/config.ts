import { makeSynchronized } from 'make-synchronized'
import type { Options } from './options'

export function loadConfig(): Omit<Options, 'plugins'> {
  const url = import.meta.url
  const isDist = url.endsWith('.js')
  const filename = 'config-worker.js'
  const workerPath = new URL(
    isDist ? `./${filename}` : `../dist/${filename}`,
    import.meta.url,
  )
  const { loadConfigAsync } =
    makeSynchronized<typeof import('./config-worker')>(workerPath)
  return loadConfigAsync()
}
