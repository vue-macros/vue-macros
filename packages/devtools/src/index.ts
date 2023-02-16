import { resolve } from 'node:path'
import sirv from 'sirv'
import type { Plugin } from 'vite'

// @ts-expect-error
const isDev = import.meta.DEV

const DEV_SERVER_PATH = '/__vue-macros'

export const Devtools = (): Plugin => {
  return {
    name: 'vue-macros-devtools',
    async configureServer(server) {
      if (isDev) {
        const { createServer } = await import('vite')
        const subServer = await createServer({
          root: resolve(__dirname, '../src/client'),
          server: {
            hmr: {
              port: 3256,
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
          })
        )
      }
    },
  }
}
