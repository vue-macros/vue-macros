import { MagicString, babelParse, getLang } from '@vue-macros/common'

export const SETUP_SFC_REGEX = /\.setup\.[cm]?[jt]sx?$/

export const transfromSetupSFC = (code: string, id: string) => {
  const lang = getLang(id)
  const program = babelParse(code, lang)

  const s = new MagicString(code)
  for (const stmt of program.body) {
    if (stmt.type !== 'ExportDefaultDeclaration') continue

    if (
      !['FunctionExpression', 'ArrowFunctionExpression'].includes(
        stmt.declaration.type
      )
    )
      throw new SyntaxError(`Default export must be a function`)

    s.append(`defineOptions({
  render: ${s.sliceNode(stmt.declaration)}
});`)
    s.removeNode(stmt)
  }

  const attrs = `${lang ? ` lang="${lang}"` : ''}`
  s.prependRight(0, `<script setup${attrs}>\n`)
  s.append(`\n</script>`)

  return s
}
