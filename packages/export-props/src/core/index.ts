import {
  DEFINE_PROPS,
  MagicString,
  WITH_DEFAULTS,
  generateTransform,
  isCallOf,
  parseSFC,
} from '@vue-macros/common'
import { type VariableDeclarator } from '@babel/types'

export function transformExportProps(code: string, id: string) {
  const { scriptSetup, getSetupAst } = parseSFC(code, id)
  if (!scriptSetup) return

  const offset = scriptSetup.loc.start.offset
  const s = new MagicString(code)

  const props: Record<string, { type: string; defaultValue?: string }> =
    Object.create(null)
  let hasDefineProps = false

  function walkVariableDeclarator(decl: VariableDeclarator) {
    if (decl.id.type !== 'Identifier') {
      throw new Error('Only support identifier in export props')
    } else if (
      decl.init &&
      (isCallOf(decl.init, DEFINE_PROPS) || isCallOf(decl.init, WITH_DEFAULTS))
    ) {
      hasDefineProps = true
      return
    }

    const name = decl.id.name
    const type = decl.id.typeAnnotation
      ? s.sliceNode(decl.id.typeAnnotation, { offset })
      : ': any'
    const defaultValue = decl.init
      ? s.sliceNode(decl.init, { offset })
      : undefined
    props[name] = { type, defaultValue }
  }

  const setupAst = getSetupAst()!
  for (const stmt of setupAst.body) {
    if (
      stmt.type === 'ExportNamedDeclaration' &&
      stmt.declaration?.type === 'VariableDeclaration'
    ) {
      for (const decl of stmt.declaration.declarations) {
        walkVariableDeclarator(decl)
      }
      s.removeNode(stmt, { offset })
    } else if (isCallOf(stmt, DEFINE_PROPS) || isCallOf(stmt, WITH_DEFAULTS)) {
      hasDefineProps = true
    }
  }

  if (Object.keys(props).length === 0) return
  else if (hasDefineProps)
    throw new Error("Don't support export props mixed with defineProps")

  let codegen = ''
  let destructureString = ''
  for (const [name, { type, defaultValue }] of Object.entries(props)) {
    codegen += `  ${name}${defaultValue ? '?' : ''}${type},\n`
    destructureString += ` ${name}${defaultValue ? ` = ${defaultValue}` : ''},`
  }
  codegen = `const {${destructureString} } = defineProps<{\n${codegen}}>()`

  s.prependLeft(offset, `\n${codegen}`)

  return generateTransform(s, id)
}
