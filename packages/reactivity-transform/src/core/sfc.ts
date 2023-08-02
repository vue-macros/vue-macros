import {
  DEFINE_PROPS,
  MagicString,
  generateTransform,
  importHelperFn,
  isCallOf,
  parseSFC,
  resolveObjectKey,
} from '@vue-macros/common'
import { type CallExpression, type Identifier, type Node } from '@babel/types'
import { shouldTransform, transformAST } from './transform'
import { helperId } from './helper'

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

  return generateTransform(s, id)

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

    propsDestructuredBindings = Object.create(null)
    for (const prop of decl.id.properties) {
      if (prop.type === 'ObjectProperty') {
        let propKey: string | number
        try {
          propKey = resolveObjectKey(prop)
        } catch {
          throw new SyntaxError(
            `${DEFINE_PROPS}() destructure cannot use computed key.`
          )
        }

        let local: string | undefined

        if (prop.value.type === 'AssignmentPattern') {
          // default value { foo = 123 }
          const { left, right } = prop.value
          if (left.type !== 'Identifier') {
            throw new SyntaxError(
              `${DEFINE_PROPS}() destructure does not support nested patterns.`
            )
          }
          local = left.name
          // store default value
          propsDestructuredBindings![propKey] = {
            local,
          }
          defaultStr += `${propKey}: ${s.sliceNode(right, { offset })},`
        } else if (prop.value.type === 'Identifier') {
          // simple destructure
          local = prop.value.name
          propsDestructuredBindings![propKey] = {
            local,
          }
        } else {
          throw new SyntaxError(
            `${DEFINE_PROPS}() destructure does not support nested patterns.`
          )
        }

        if (propKey !== local) {
          const toRef = importHelperFn(
            s,
            scriptSetup!.loc.start.offset,
            'toRef'
          )
          s.prependLeft(
            offset,
            `const ${local} = ${toRef}(__props, ${JSON.stringify(propKey)});\n`
          )
        }
      } else {
        s.prependLeft(
          offset,
          `import { createPropsRestProxy } from '${helperId}';
const ${
            (prop.argument as Identifier).name
          } = createPropsRestProxy(__props, ${JSON.stringify(
            Object.keys(propsDestructuredBindings!)
          )});\n`
        )
      }
    }

    const defineDecl = decl.init as CallExpression
    if (defineDecl.typeParameters) {
      s.overwriteNode(
        node,
        `withDefaults(${s.sliceNode(defineDecl, {
          offset,
        })}, { ${defaultStr} })`,
        { offset }
      )
    } else if (defineDecl.arguments[0]) {
      if (defaultStr) {
        s.overwriteNode(
          node,
          `defineProps(${importHelperFn(
            s,
            offset,
            'mergeDefaults'
          )}(${s.sliceNode(defineDecl.arguments[0], {
            offset,
          })}, { ${defaultStr} }))`,
          { offset }
        )
      } else {
        s.overwriteNode(node, s.sliceNode(defineDecl, { offset }), { offset })
      }
    } else
      throw new SyntaxError(
        `${DEFINE_PROPS}() must have at least one argument or type argument.`
      )
  }
}

function importHelpers(s: MagicString, offset: number, helpers: string[]) {
  if (helpers.length === 0) return
  s.prependLeft(
    offset,
    `import { ${helpers.map((h) => `${h} as _${h}`).join(', ')} } from 'vue';\n`
  )
}
