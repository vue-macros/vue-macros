import { allCodeFeatures, type Code } from '@vue/language-core'
import { replaceSourceRange } from 'muggle-string'
import { getStart, getText, isJsxExpression } from '../common'
import { getTagName, type JsxDirective, type TransformOptions } from './index'

export function transformVModel(
  nodes: JsxDirective[],
  ctxMap: Map<JsxDirective['node'], string>,
  options: TransformOptions,
): void {
  const { codes, ts, source, sfc } = options
  let firstNamespacedNode:
    | {
        attribute: JsxDirective['attribute']
        node: JsxDirective['node']
        attributeName: string
      }
    | undefined

  const result: Code[] = []
  const emits: string[] = []
  for (const { attribute, node } of nodes) {
    const modelValue = ['input', 'select', 'textarea'].includes(
      getTagName(node, options),
    )
      ? 'value'
      : 'modelValue'
    const isArrayExpression =
      isJsxExpression(attribute.initializer) &&
      attribute.initializer.expression &&
      ts.isArrayLiteralExpression(attribute.initializer.expression)

    const name = getText(attribute.name, options)
    const start = getStart(attribute.name, options)
    if (name.startsWith('v-model:') || isArrayExpression) {
      let isDynamic = false
      const attributeName = name
        .slice(8)
        .split(/\s/)[0]
        .split('_')[0]
        .replace(/^\$(.*)\$/, (_, $1) => {
          isDynamic = true
          return $1
        })
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
                (isDynamic ? 9 : 8) +
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
        `{...{'onUpdate:${modelValue}': () => {} }} `,
        modelValue.slice(0, 3),
        [modelValue.slice(3), source, start, allCodeFeatures],
      )
    }
  }

  if (!firstNamespacedNode) return
  const { attribute, attributeName, node } = firstNamespacedNode
  getModelsType(codes)

  const end = attributeName ? attribute.end : getStart(attribute, options) + 8
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
  replaceSourceRange(
    codes,
    source,
    end,
    end + 1,
    sfc[source]!.content.slice(end, end + 1),
  )
}

function getModelsType(codes: Code[]) {
  if (codes.toString().includes('type __VLS_GetModels')) return

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
type __VLS_GetModels<P, E = __VLS_PropsToEmits<P>> = E extends object
  ? {
      [K in keyof E as K extends keyof P
        ? K
        : never]: K extends keyof P ? P[K] : never
    }
  : {};
`)
}
