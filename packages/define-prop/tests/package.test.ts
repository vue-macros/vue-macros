import { execFile } from 'node:child_process'
import process from 'node:process'
import { promisify } from 'node:util'
import { describe, expect, it } from 'vitest'

const execFileAsync = promisify(execFile)

describe('package', () => {
  it('publishes macro type declarations', async () => {
    const isWindows = process.platform === 'win32'
    const command = isWindows ? process.env.ComSpec || 'cmd.exe' : 'npm'
    const args = isWindows
      ? ['/d', '/s', '/c', 'npm pack --dry-run --json']
      : ['pack', '--dry-run', '--json']
    const { stdout } = await execFileAsync(command, args, {
      cwd: new URL('..', import.meta.url),
    })
    const [{ files }] = JSON.parse(stdout) as [
      { files: Array<{ path: string }> },
    ]

    expect(files.map(({ path }) => path)).toEqual(
      expect.arrayContaining(['macros.d.ts', 'macros-global.d.ts']),
    )
  }, 30_000)
})
