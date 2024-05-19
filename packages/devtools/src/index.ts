import { resolve } from 'node:path'
import sirv from 'sirv'
import getPort from 'get-port'
import type { Plugin } from 'vite'

const DEV_SERVER_PATH = '/__vue-macros'

export interface Options {
  /** @internal */
  nuxtContext?: {
    isClient?: boolean
  }
}

export const Devtools = ({ nuxtContext }: Options = {}): Plugin => {
  return {
    name: 'vue-macros-devtools',
    async configureServer(server) {
      if (nuxtContext?.isClient === false) return

      if (import.meta.DEV) {
        const { createServer } = await import('vite')
        const subServer = await createServer({
          root: resolve(__dirname, '../src/client'),
          server: {
            hmr: {
              port: await getPort(),
            },
            middlewareMode: true,
          },
        })
        server.middlewares.use(DEV_SERVER_PATH, subServer.middlewares)
      } else {
        server.middlewares.use(
          DEV_SERVER_PATH,
          sirv(resolve(__dirname, 'client'), {
            single: true,
            dev: true,
          }),
        )
      }
    },
  }
}
