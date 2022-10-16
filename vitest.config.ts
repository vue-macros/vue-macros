import path from 'node:path'
import { defineConfig } from 'vitest/config'
import { findWorkspacePackages } from '@pnpm/find-workspace-packages'

const pathPackages = path.resolve(__dirname, 'packages')

export default defineConfig(async () => {
  const pkgs = (await findWorkspacePackages(process.cwd()))
    .filter((p) => p.dir.startsWith(pathPackages))
    .map((p) => [p.manifest.name!, path.resolve(p.dir, 'src')])

  return {
    resolve: {
      alias: Object.fromEntries(pkgs),
    },
  }
})
