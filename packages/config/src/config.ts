import { makeSynchronized } from 'make-synchronized'
import type { Options } from './options'

export function loadConfig(): Omit<Options, 'plugins'> {
  const url = import.meta.url
  const isDist = url.endsWith('.js')
  const workerPath = new URL(
    isDist ? './config-worker.mjs' : '../dist/config-worker.mjs',
    import.meta.url,
  )
  const { loadConfigAsync } =
    makeSynchronized<typeof import('./config-worker')>(workerPath)
  return loadConfigAsync()
}
