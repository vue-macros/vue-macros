import {
  HELPER_PREFIX,
  importHelperFn,
  type MagicStringAST,
} from '@vue-macros/common'
import type { OptionsResolved } from '..'
import type { JsxDirective } from '.'

export function resolveVFor(
  attribute: JsxDirective['attribute'],
  s: MagicStringAST,
  { lib }: OptionsResolved,
  vMemoAttribute?: JsxDirective['attribute'],
): string {
  if (attribute.value) {
    let item, index, objectIndex, list
    if (
      attribute.value.type === 'JSXExpressionContainer' &&
      attribute.value.expression.type === 'BinaryExpression'
    ) {
      if (attribute.value.expression.left.type === 'SequenceExpression') {
        const expressions = attribute.value.expression.left.expressions
        item = expressions[0] ? s.sliceNode(expressions[0]) : ''
        index = expressions[1] ? s.sliceNode(expressions[1]) : ''
        objectIndex = expressions[2] ? s.sliceNode(expressions[2]) : ''
      } else {
        item = s.sliceNode(attribute.value.expression.left)
      }

      list = s.sliceNode(attribute.value.expression.right)
    }

    if (item && list) {
      if (vMemoAttribute) {
        index ??= `${HELPER_PREFIX}index`
      }

      const params = `(${item}${
        index ? `, ${index}` : ''
      }${objectIndex ? `, ${objectIndex}` : ''})`
      const renderList = importHelperFn(
        s,
        0,
        'renderList',
        undefined,
        lib.startsWith('vue') ? 'vue' : '@vue-macros/jsx-directive/helpers',
      )
      return `${renderList}(${list}, ${params} => `
    }
  }

  return ''
}

export function transformVFor(
  nodes: JsxDirective[],
  s: MagicStringAST,
  options: OptionsResolved,
): void {
  if (nodes.length === 0) return

  nodes.forEach(({ node, attribute, parent, vIfAttribute, vMemoAttribute }) => {
    const hasScope = ['JSXElement', 'JSXFragment'].includes(
      String(parent?.type),
    )
    s.prependRight(
      node.end!,
      `)${hasScope ? (vIfAttribute ? '' : '}') : '}</>'}`,
    )
    s.appendLeft(
      node.start!,
      `${hasScope ? (vIfAttribute ? '' : '{') : '<>{'}${resolveVFor(attribute, s, options, vMemoAttribute)}`,
    )
    s.remove(attribute.start! - 1, attribute.end!)

    const isTemplate =
      node.type === 'JSXElement' &&
      node.openingElement.name.type === 'JSXIdentifier' &&
      node.openingElement.name.name === 'template'
    if (isTemplate && node.closingElement) {
      /**
       * https://github.com/vuejs/babel-plugin-jsx/blob/a72bc11ed8f2047a3a0edccdbf374c8e0eeaa69f/packages/babel-plugin-jsx/src/utils.ts#L37
       *
       * Because the __MACROS_Fragment tag is a component in vue-jsx, the children will be treated as a slot,
       * so we need to replace it with _Fragment99.
       */
      const fragment =
        node.openingElement.attributes.length > 1
          ? importFragmentHelperFn(s, 0, 'Fragment', '_Fragment99', options.lib)
          : ''
      s.overwriteNode(node.openingElement.name, fragment)
      s.overwriteNode(node.closingElement.name, fragment)
    }
  })
}

const importedMap = new WeakMap<MagicStringAST, Set<string>>()
function importFragmentHelperFn(
  s: MagicStringAST,
  offset: number,
  imported: string,
  local: string = imported,
  from = 'vue',
) {
  const cacheKey = `${from}@${imported}`
  const result = local === imported ? HELPER_PREFIX + local : local
  if (!importedMap.get(s)?.has(cacheKey)) {
    s.appendLeft(
      offset,
      `\nimport ${
        imported === 'default' ? result : `{ ${imported} as ${result} }`
      } from ${JSON.stringify(from)};`,
    )
    if (!importedMap.has(s)) {
      importedMap.set(s, new Set([cacheKey]))
    } else {
      importedMap.get(s)!.add(cacheKey)
    }
  }

  return result
}
