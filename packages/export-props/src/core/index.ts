import {
  DEFINE_PROPS,
  generateTransform,
  isCallOf,
  MagicStringAST,
  parseSFC,
  WITH_DEFAULTS,
  type CodeTransform,
} from '@vue-macros/common'
import type { VariableDeclaration, VariableDeclarator } from '@babel/types'

export function transformExportProps(
  code: string,
  id: string,
): CodeTransform | undefined {
  const { scriptSetup, getSetupAst } = parseSFC(code, id)
  if (!scriptSetup) return

  const offset = scriptSetup.loc.start.offset
  const s = new MagicStringAST(code)

  const props: Record<
    string,
    {
      isModel: boolean
      type: string
      defaultValue?: string
    }
  > = Object.create(null)
  let hasDefineProps = false

  const setupAst = getSetupAst()!
  for (const stmt of setupAst.body) {
    if (
      stmt.type === 'ExportNamedDeclaration' &&
      stmt.declaration?.type === 'VariableDeclaration'
    ) {
      for (const decl of stmt.declaration.declarations) {
        walkVariableDeclarator(decl, stmt.declaration.kind)
      }
      s.removeNode(stmt, { offset })
    } else if (isCallOf(stmt, DEFINE_PROPS) || isCallOf(stmt, WITH_DEFAULTS)) {
      hasDefineProps = true
    }
  }

  if (Object.keys(props).length === 0) return
  else if (hasDefineProps)
    throw new Error("Don't support export props mixed with defineProps")

  let propsCodegen = ''
  let destructureString = ''
  let modelCodegen = ''
  for (const [name, { isModel, type, defaultValue }] of Object.entries(props)) {
    if (isModel) {
      modelCodegen += `\nlet ${name} = $(defineModel("${name}"${defaultValue ? `, { default: () => (${defaultValue}) }` : ''}))`
    } else {
      propsCodegen += `  ${name}${defaultValue ? '?' : ''}${type},\n`
      destructureString += ` ${name}${defaultValue ? ` = ${defaultValue}` : ''},`
    }
  }
  propsCodegen = `const {${destructureString} } = defineProps<{\n${propsCodegen}}>()`

  s.prependLeft(offset, `\n${propsCodegen}${modelCodegen}`)

  return generateTransform(s, id)

  function walkVariableDeclarator(
    decl: VariableDeclarator,
    kind: VariableDeclaration['kind'],
  ) {
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
    props[name] = {
      type,
      defaultValue,
      isModel: kind === 'let' || kind === 'var',
    }
  }
}
