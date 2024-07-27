// @ts-expect-error missing types
import { makeSynchronized } from 'make-synchronized'
import type { Options } from './index'

export function getConfig(): Omit<Options, 'plugins'> {
  const url = import.meta.url
  const isDist = url.endsWith('.js')
  const workerPath = new URL(
    isDist ? './config-worker.mjs' : '../dist/config-worker.mjs',
    import.meta.url,
  )
  const configWorker = makeSynchronized(workerPath)
  return configWorker.getConfigAsync()
}
