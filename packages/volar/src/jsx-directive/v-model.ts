import { replaceSourceRange } from 'muggle-string'
import { allCodeFeatures, type Code } from 'ts-macro'
import { getStart, getText, isJsxExpression } from '../common'
import { getTagName, type JsxDirective, type TransformOptions } from './index'

export function transformVModel(
  nodeMap: Map<JsxDirective['node'], JsxDirective[]>,
  ctxMap: Map<JsxDirective['node'], string>,
  options: TransformOptions,
): void {
  if (!nodeMap.size) return

  for (const [, nodes] of nodeMap) {
    transform(nodes, ctxMap, options)
  }

  getModelsType(options.codes)
}

function transform(
  nodes: JsxDirective[],
  ctxMap: Map<JsxDirective['node'], string>,
  options: TransformOptions,
) {
  const { codes, ts, source, ast, prefix } = options
  let firstNamespacedNode:
    | {
        attribute: JsxDirective['attribute']
        node: JsxDirective['node']
        attributeName: string
      }
    | undefined

  const result: Code[] = []
  const emits: string[] = []
  const offset = `${prefix}model`.length + 1
  for (const { attribute, node } of nodes) {
    const isNativeTag = ['input', 'select', 'textarea'].includes(
      getTagName(node, options),
    )
    const modelValue = isNativeTag ? 'value' : 'modelValue'
    const isArrayExpression =
      isJsxExpression(attribute.initializer) &&
      attribute.initializer.expression &&
      ts.isArrayLiteralExpression(attribute.initializer.expression)

    const name = getText(attribute.name, options)
    const start = getStart(attribute.name, options)
    if (name.startsWith(`${prefix}model:`) || isArrayExpression) {
      let isDynamic = false
      const attributeName = name
        .slice(offset)
        .split(/\s/)[0]
        .replace(/^\$(.*)\$/, (_, $1) => {
          isDynamic = true
          return $1.replaceAll('_', '.')
        })
        .split('_')[0]
      firstNamespacedNode ??= {
        attribute,
        attributeName,
        node,
      }
      if (firstNamespacedNode.attribute !== attribute) {
        replaceSourceRange(
          codes,
          source,
          getStart(attribute, options),
          attribute.end,
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
              getText(elements[1], options),
              source,
              getStart(elements[1], options),
              allCodeFeatures,
            ],
            isDynamic ? '}`]' : '',
          )
        } else {
          result.push(modelValue)
        }

        if (elements[0])
          result.push(':', [
            getText(elements[0], options),
            source,
            getStart(elements[0], options),
            allCodeFeatures,
          ])
      } else {
        result.push(
          isDynamic ? '[`${' : '',
          ...(attributeName
            .split('-')
            .map((code, index, codes) => [
              index ? code.at(0)?.toUpperCase() + code.slice(1) : code,
              source,
              start +
                offset +
                (isDynamic ? 1 : 0) +
                (index && codes[index - 1].length + 1),
              allCodeFeatures,
            ]) as Code[]),
          isDynamic ? '}`]' : '',
        )

        if (
          attribute.initializer &&
          isJsxExpression(attribute.initializer) &&
          attribute.initializer.expression &&
          attributeName
        )
          result.push(':', [
            getText(attribute.initializer.expression, options),
            source,
            getStart(attribute.initializer.expression, options),
            allCodeFeatures,
          ])
      }

      emits.push(`'onUpdate:${attributeName}': () => {}, `)
    } else {
      replaceSourceRange(
        codes,
        source,
        start,
        attribute.name.end,
        ...((isNativeTag
          ? [[modelValue, source, start + 2, allCodeFeatures]]
          : [
              modelValue.slice(0, 3),
              [modelValue.slice(3), source, start, allCodeFeatures],
            ]) as Code[]),
      )
      if (!isNativeTag) {
        replaceSourceRange(
          codes,
          source,
          attribute.end,
          attribute.end,
          ` {...{'onUpdate:${modelValue}': () => {} }}`,
        )
      }
    }
  }

  if (!firstNamespacedNode) return
  const { attribute, attributeName, node } = firstNamespacedNode
  const end = attributeName
    ? attribute.end
    : getStart(attribute, options) + offset
  replaceSourceRange(
    codes,
    source,
    getStart(attribute, options),
    end,
    `{...{`,
    ...result,
    `} satisfies __VLS_GetModels<__VLS_NormalizeProps<typeof ${ctxMap.get(node)}.props>>}`,
    ` {...{`,
    ...emits,
    `}}`,
  )
  // Fix `v-model:` without type hints
  replaceSourceRange(codes, source, end, end + 1, ast.text.slice(end, end + 1))
}

function getModelsType(codes: Code[]) {
  codes.push(`
type __VLS_NormalizeProps<T> = T extends object
  ? {
      [K in keyof T as {} extends Record<K, 1>
        ? never
        : K extends keyof import('vue').VNodeProps | 'class' | 'style'
          ? never
          : K]: T[K]
    }
  : never;
type __VLS_CamelCase<S extends string> = S extends \`\${infer F}-\${infer RF}\${infer R}\`
  ? \`\${F}\${Uppercase<RF>}\${__VLS_CamelCase<R>}\`
  : S;
type __VLS_PropsToEmits<T> = T extends object
    ? {
        [K in keyof T as K extends \`onUpdate:\${infer R}\`
          ? R extends 'modelValue'
            ? never
            : __VLS_CamelCase<R>
          : never]: T[K]
      }
    : never
type __VLS_GetModels<P, E = __VLS_PropsToEmits<P>> = P extends object
  ? {
      [K in keyof P as K extends keyof E
        ? K
        : never]: K extends keyof P ? P[K] : never
    }
  : {};
`)
}
