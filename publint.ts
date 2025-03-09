import { readdir } from 'node:fs/promises'
import process from 'node:process'
import { publint } from 'publint'
import { formatMessage } from 'publint/utils'

const pkgs = (await readdir('packages', { withFileTypes: true }))
  .filter((pkg) => pkg.isDirectory())
  .map((pkg) => pkg.name)

await Promise.all(
  pkgs.map(async (pkgName) => {
    const pkgDir = `./packages/${pkgName}`
    const pkgJson = await import(`${pkgDir}/package.json`).then(
      (mod) => mod.default,
    )
    const { messages } = await publint({
      pkgDir,
      strict: true,
    })
    if (!messages.length) return

    console.error(`${pkgJson.name}:`)
    messages.forEach((msg) =>
      console.error(`[${msg.code}]`, formatMessage(msg, pkgJson)),
    )
    process.exitCode = 1
  }),
)

console.info('All good!')
