import {
  FileRangeCapabilities,
  type Segment,
  replaceSourceRange,
} from '@vue/language-core'
import { camelize } from '@vue/shared'
import { type JsxDirective, type TransformOptions, getTagName } from './index'

export function transformVModel(
  nodes: JsxDirective[],
  ctxMap: Map<JsxDirective['node'], string>,
  options: TransformOptions,
) {
  const { codes, ts, sfc, source } = options
  let firstNamespacedNode:
    | { attribute: JsxDirective['attribute']; node: JsxDirective['node'] }
    | undefined
  const result: Segment<FileRangeCapabilities>[] = []
  for (const { attribute, node } of nodes) {
    const modelValue = ['input', 'select', 'textarea'].includes(
      getTagName(node, options),
    )
      ? 'value'
      : 'modelValue'
    const isArrayExpression =
      attribute.initializer &&
      ts.isJsxExpression(attribute.initializer) &&
      attribute.initializer.expression &&
      ts.isArrayLiteralExpression(attribute.initializer.expression)

    if (
      attribute.name.getText(sfc[source]?.ast).startsWith('v-model:') ||
      isArrayExpression
    ) {
      let isDynamic = false
      const attributeName = camelize(
        attribute.name
          .getText(sfc[source]?.ast)
          .slice(8)
          .split(' ')[0]
          .split('_')[0]
          .replace(/^\$(.*)\$/, (_, $1) => {
            isDynamic = true
            return $1
          }),
      )
      firstNamespacedNode ??= { attribute, node }
      if (firstNamespacedNode.attribute !== attribute) {
        replaceSourceRange(
          codes,
          source,
          attribute.getStart(sfc[source]?.ast),
          attribute.getEnd(),
        )
        result.push(',')
      }

      if (isArrayExpression) {
        const { elements } = attribute.initializer.expression
        if (elements[1] && !ts.isArrayLiteralExpression(elements[1])) {
          isDynamic = !ts.isStringLiteral(elements[1])
          result.push(
            isDynamic ? '[`${' : '',
            [
              elements[1].getText(sfc[source]?.ast),
              source,
              elements[1].getStart(sfc[source]?.ast),
              FileRangeCapabilities.full,
            ],
            isDynamic ? '}`]' : '',
          )
        } else {
          result.push(modelValue)
        }

        if (elements[0])
          result.push(':', [
            elements[0].getText(sfc[source]?.ast),
            source,
            elements[0].getStart(sfc[source]?.ast),
            FileRangeCapabilities.full,
          ])
      } else {
        result.push(
          isDynamic ? '[`${' : '',
          [
            attributeName,
            source,
            [
              attribute.name.getStart(sfc[source]?.ast) + 8,
              attribute.name.getEnd(),
            ],
            FileRangeCapabilities.full,
          ],
          isDynamic ? '}`]' : '',
        )

        if (attribute.initializer && attributeName)
          result.push(':', [
            attribute.initializer.getText(sfc[source]?.ast).slice(1, -1),
            source,
            attribute.initializer.getStart(sfc[source]?.ast) + 1,
            FileRangeCapabilities.full,
          ])
      }
    } else {
      replaceSourceRange(
        codes,
        source,
        attribute.name.getStart(sfc[source]?.ast),
        attribute.name.getEnd() + 1,
        [
          modelValue,
          source,
          [attribute.name.getStart(sfc[source]?.ast), attribute.name.getEnd()],
          FileRangeCapabilities.full,
        ],
        '=',
      )
    }
  }

  if (!firstNamespacedNode) return
  const { attribute, node } = firstNamespacedNode
  getModelsType(codes)

  replaceSourceRange(
    codes,
    source,
    attribute.getStart(sfc[source]?.ast),
    attribute.getEnd(),
    `{...{`,
    ...result,
    `} satisfies __VLS_getModels<__VLS_NormalizeEmits<typeof ${ctxMap.get(node)}.emit>, typeof ${ctxMap.get(node)}.props>}`,
  )
}

function getModelsType(codes: Segment<FileRangeCapabilities>[]) {
  if (codes.toString().includes('type __VLS_GetModels')) return

  codes.push(`
type __VLS_CamelCase<S extends string> = S extends \`\${infer F}-\${infer RF}\${infer R}\`
  ? \`\${F}\${Uppercase<RF>}\${__VLS_CamelCase<R>}\`
  : S;
type __VLS_RemoveUpdatePrefix<T> = T extends \`update:modelValue\`
  ? never
  : T extends \`update:\${infer R}\`
    ? __VLS_CamelCase<R>
    : T;
type __VLS_GetModels<E, P> = E extends object
  ? {
      [K in keyof E as __VLS_RemoveUpdatePrefix<K>]: P[__VLS_RemoveUpdatePrefix<K>]
    }
  : {};
`)
}
