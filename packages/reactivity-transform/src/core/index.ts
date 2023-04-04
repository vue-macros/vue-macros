import {
  DEFINE_PROPS,
  MagicString,
  getTransformResult,
  isCallOf,
  parseSFC,
  resolveObjectKey,
} from '@vue-macros/common'
import { type Identifier, type Node } from '@babel/types'
import { shouldTransform, transformAST } from './impl'
import { helperId } from './helper'

export * from './impl'

export function transformVueSFC(code: string, id: string) {
  const s = new MagicString(code)
  const { script, scriptSetup, getScriptAst, getSetupAst } = parseSFC(code, id)

  let refBindings: string[] | undefined
  let propsDestructuredBindings: Record<string, { local: string }> | undefined

  if (script && shouldTransform(script.content)) {
    const offset = script.loc.start.offset
    const { importedHelpers, rootRefs } = transformAST(
      getScriptAst()!,
      s,
      offset
    )
    refBindings = rootRefs
    importHelpers(s, script.loc.start.offset, importedHelpers)
  }

  if (scriptSetup) {
    const ast = getSetupAst()!
    for (const node of ast.body) {
      processDefineProps(node)
    }

    if (
      propsDestructuredBindings ||
      refBindings ||
      shouldTransform(scriptSetup.content)
    ) {
      const { importedHelpers } = transformAST(
        ast,
        s,
        scriptSetup.loc.start.offset,
        refBindings,
        propsDestructuredBindings
      )
      importHelpers(s, scriptSetup.loc.start.offset, importedHelpers)
    }
  }

  return getTransformResult(s, id)

  function processDefineProps(node: Node) {
    if (node.type !== 'VariableDeclaration') return

    const decl = node.declarations.find((decl) =>
      isCallOf(decl.init, DEFINE_PROPS)
    )
    if (!decl || decl.id.type !== 'ObjectPattern') return

    if (node.declarations.length > 1)
      throw new SyntaxError(
        `${DEFINE_PROPS}() don't support multiple declarations.`
      )

    const offset = scriptSetup!.loc.start.offset
    let defaultStr = ''

    propsDestructuredBindings = {}
    for (const prop of decl.id.properties) {
      if (prop.type === 'ObjectProperty') {
        const propKey = resolveObjectKey(prop.key, prop.computed, false)

        if (!propKey) {
          throw new SyntaxError(
            `${DEFINE_PROPS}() destructure cannot use computed key.`
          )
        }

        if (prop.value.type === 'AssignmentPattern') {
          // default value { foo = 123 }
          const { left, right } = prop.value
          if (left.type !== 'Identifier') {
            throw new SyntaxError(
              `${DEFINE_PROPS}() destructure does not support nested patterns.`
            )
          }
          // store default value
          propsDestructuredBindings[propKey] = {
            local: left.name,
          }
          defaultStr += `${propKey}: ${s.sliceNode(right, { offset })},`
        } else if (prop.value.type === 'Identifier') {
          // simple destructure
          propsDestructuredBindings[propKey] = {
            local: prop.value.name,
          }
        } else {
          throw new SyntaxError(
            `${DEFINE_PROPS}() destructure does not support nested patterns.`
          )
        }
      } else {
        s.prependLeft(
          offset,
          `import { createPropsRestProxy } from '${helperId}';
const ${
            (prop.argument as Identifier).name
          } = createPropsRestProxy(__props, ${JSON.stringify(
            Object.keys(propsDestructuredBindings)
          )});\n`
        )
      }
    }

    const declStr = `withDefaults(${s.sliceNode(decl.init!, {
      offset,
    })}, { ${defaultStr} })`
    s.overwriteNode(node, declStr, { offset })
  }
}

function importHelpers(s: MagicString, offset: number, helpers: string[]) {
  if (helpers.length === 0) return
  s.prependLeft(
    offset,
    `import { ${helpers.map((h) => `${h} as _${h}`).join(', ')} } from 'vue';\n`
  )
}
