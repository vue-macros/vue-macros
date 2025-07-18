import {
  getOpeningElement,
  getTagName,
  type JsxDirective,
  type TransformOptions,
} from './index'
import type { Code } from 'ts-macro'

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
  const { codes, ts, ast, prefix } = options
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
      attribute.initializer &&
      ts.isJsxExpression(attribute.initializer) &&
      attribute.initializer.expression &&
      ts.isArrayLiteralExpression(attribute.initializer.expression)

    const name = attribute.name.getText(ast)
    const start = attribute.name.getStart(ast)
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
        codes.replaceRange(attribute.getStart(ast), attribute.end)
        result.push(',')
      }

      if (isArrayExpression) {
        const { elements } = attribute.initializer.expression
        if (elements[1] && !ts.isArrayLiteralExpression(elements[1])) {
          isDynamic = !ts.isStringLiteral(elements[1])
          result.push(
            isDynamic ? '[`${' : '',
            [elements[1].getText(ast), elements[1].getStart(ast)],
            isDynamic ? '}`]' : '',
          )
        } else {
          result.push(modelValue)
        }

        if (elements[0])
          result.push(':', [
            elements[0].getText(ast),
            elements[0].getStart(ast),
          ])
      } else {
        result.push(
          isDynamic ? '[`${' : '',
          ...(attributeName
            .split('-')
            .map((code, index, codes) => [
              index ? code.at(0)?.toUpperCase() + code.slice(1) : code,
              start +
                offset +
                (isDynamic ? 1 : 0) +
                (index && codes[index - 1].length + 1),
            ]) as Code[]),
          isDynamic ? '}`]' : '',
        )

        if (attributeName) {
          if (
            attribute.initializer &&
            ts.isJsxExpression(attribute.initializer) &&
            attribute.initializer.expression
          ) {
            result.push(':', [
              attribute.initializer.expression.getText(ast),
              attribute.initializer.expression.getStart(ast),
            ])
          }

          if (!isDynamic && modifiers.length) {
            modifiersResult.push(
              ` {...{`,
              ...(modifiers.flatMap((modify, index) => [
                modify ? '' : `'`,
                [
                  modify,
                  start +
                    offset +
                    attributeName.length +
                    1 +
                    (index
                      ? modifiers.slice(0, index).join('').length + index
                      : 0),
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
            : [[modelValue, start + 2]]
          : [modelValue.slice(0, 3), [modelValue.slice(3), start]]) as Code[]),
      )

      if (modifiers.length) {
        result.unshift(
          `{...{`,
          ...(modifiers.flatMap((modify, index) => [
            modify ? '' : `'`,
            [
              modify,
              start +
                offset +
                (index ? modifiers.slice(0, index).join('').length + index : 0),
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

      codes.replaceRange(start, attribute.name.end, ...result)
    }
  }

  if (!firstNamespacedNode) return
  const { attribute, attributeName, node } = firstNamespacedNode
  const end = attributeName ? attribute.end : attribute.getStart(ast) + offset
  codes.replaceRange(
    attribute.getStart(ast),
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
  const { ts, ast } = options
  const openingElement = getOpeningElement(node, options)
  if (!openingElement) return false
  const tagName = openingElement.tagName.getText(ast)
  return (
    tagName === 'input' &&
    openingElement.attributes.properties.some((attr) => {
      return (
        ts.isJsxAttribute(attr) &&
        attr.name.getText(ast) === 'type' &&
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
