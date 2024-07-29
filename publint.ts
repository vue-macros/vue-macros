import { readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { publint } from 'publint'
import { formatMessage } from 'publint/utils'

const pkgs = (await readdir('packages', { withFileTypes: true }))
  .filter((pkg) => pkg.isDirectory())
  .map((pkg) => path.join('packages', pkg.name))

await Promise.all(
  pkgs.map(async (pkg) => {
    const pkgJson = await import(`./${pkg}/package.json`).then(
      (mod) => mod.default,
    )
    const { messages } = await publint({
      pkgDir: pkg,
      strict: true,
    })

    if (!messages.length) return

    console.error(`${pkgJson.name}:`)
    messages.forEach((msg) => console.error(formatMessage(msg, pkgJson)))
    process.exit(1)
  }),
)

// eslint-disable-next-line no-console
console.info('All good!')
