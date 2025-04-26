import { replaceSourceRange } from 'muggle-string'
import { allCodeFeatures, type Code } from 'ts-macro'
import { getStart, getText, isJsxExpression } from '../common'
import {
  getOpeningElement,
  getTagName,
  type JsxDirective,
  type TransformOptions,
} from './index'

export const isNativeFormElement = (tag: string): boolean => {
  return ['input', 'select', 'textarea'].includes(tag)
}

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
  const { codes, ts, source, prefix } = options
  let firstNamespacedNode:
    | {
        attribute: JsxDirective['attribute']
        node: JsxDirective['node']
        attributeName: string
      }
    | undefined

  const result: Code[] = []
  const emitsResult: Code[] = []
  const modifiersResult: Code[] = []
  const offset = `${prefix}model`.length + 1
  for (const { attribute, node } of nodes) {
    const isNative = isNativeFormElement(getTagName(node, options))
    const modelValue = isNative ? 'value' : 'modelValue'
    const isArrayExpression =
      isJsxExpression(attribute.initializer) &&
      attribute.initializer.expression &&
      ts.isArrayLiteralExpression(attribute.initializer.expression)

    const name = getText(attribute.name, options)
    const start = getStart(attribute.name, options)
    if (name.startsWith(`${prefix}model:`) || isArrayExpression) {
      let isDynamic = false
      const [attributeName, ...modifiers] = name
        .slice(offset)
        .split(/\s/)[0]
        .replace(/^\$(.*)\$/, (_, $1) => {
          isDynamic = true
          return $1.replaceAll('_', '.')
        })
        .split('_')
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

        if (attributeName) {
          if (
            isJsxExpression(attribute?.initializer) &&
            attribute.initializer.expression
          ) {
            result.push(':', [
              getText(attribute.initializer.expression, options),
              source,
              getStart(attribute.initializer.expression, options),
              allCodeFeatures,
            ])
          }

          if (!isDynamic && modifiers.length) {
            modifiersResult.push(
              ` {...{`,
              ...(modifiers.flatMap((modify, index) => [
                modify ? '' : `'`,
                [
                  modify,
                  source,
                  start +
                    offset +
                    attributeName.length +
                    1 +
                    (index
                      ? modifiers.slice(0, index).join('').length + index
                      : 0),
                  allCodeFeatures,
                ],
                modify ? ': true, ' : `'`,
              ]) as Code[]),
              `} satisfies typeof ${ctxMap.get(node)}.props.${attributeName}Modifiers}`,
            )
          }
        }
      }

      emitsResult.push(`'onUpdate:${attributeName}': () => {}, `)
    } else {
      const [, ...modifiers] = name.split('_')
      const result = []
      result.push(
        ...((isNative
          ? isRadioOrCheckbox(node, options)
            ? 'v-model'
            : [[modelValue, source, start + 2, allCodeFeatures]]
          : [
              modelValue.slice(0, 3),
              [modelValue.slice(3), source, start, allCodeFeatures],
            ]) as Code[]),
      )

      if (modifiers.length) {
        result.unshift(
          `{...{`,
          ...(modifiers.flatMap((modify, index) => [
            modify ? '' : `'`,
            [
              modify,
              source,
              start +
                offset +
                (index ? modifiers.slice(0, index).join('').length + index : 0),
              allCodeFeatures,
            ],
            modify ? ': true, ' : `'`,
          ]) as Code[]),
          `} satisfies `,
          isNative
            ? '{ trim?: true, number?: true, lazy?: true}'
            : `typeof ${ctxMap.get(node)}.props.modelValueModifiers`,
          `} `,
        )
      }

      if (!isNative) {
        result.unshift(`{...{'onUpdate:${modelValue}': () => {} }} `)
      }

      replaceSourceRange(codes, source, start, attribute.name.end, ...result)
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
    ...modifiersResult,
    ` {...{`,
    ...emitsResult,
    `}}`,
  )
}

function isRadioOrCheckbox(
  node: import('typescript').Node,
  options: TransformOptions,
) {
  const { ts } = options
  const openingElement = getOpeningElement(node, options)
  if (!openingElement) return false
  const tagName = getText(openingElement.tagName, options)
  return (
    tagName === 'input' &&
    openingElement.attributes.properties.some((attr) => {
      return (
        ts.isJsxAttribute(attr) &&
        getText(attr.name, options) === 'type' &&
        attr.initializer &&
        ts.isStringLiteral(attr.initializer) &&
        (attr.initializer.text === 'radio' ||
          attr.initializer.text === 'checkbox')
      )
    })
  )
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
