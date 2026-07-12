import { getDirectiveArgs, getModifierPropName } from './common'
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
  const { codes, ast } = options
  let firstNamespacedNode:
    | {
        attribute: JsxDirective['attribute']
        node: JsxDirective['node']
      }
    | undefined

  const result: Code[] = []
  const emitsResult: Code[] = []
  const modifiersResult: Code[] = []
  for (const { attribute, node } of nodes) {
    const isNative = isNativeFormElement(getTagName(node, options))
    const modelValue = isNative ? 'value' : 'modelValue'
    const {
      name,
      argument,
      argumentCode,
      isDynamic,
      modifiers,
      modifiersCode,
      valueCode,
    } = getDirectiveArgs(attribute, options)
    if (!valueCode) continue

    const start = attribute.name.getStart(ast)
    if (!argument && !argumentCode) {
      const result = []
      result.push(
        ...((isNative
          ? isRadioOrCheckbox(node, options)
            ? 'v-model'
            : [[modelValue, start + 2]]
          : [
              [modelValue.slice(0, 3), start],
              [modelValue.slice(3), start],
            ]) as Code[]),
      )

      if (modifiers.length || modifiersCode) {
        result.unshift(
          `{...`,
          ...(modifiersCode
            ? [modifiersCode]
            : modifiers.length
              ? [
                  '{',
                  ...(modifiers.flatMap((modify, index) => [
                    modify ? (modify.includes('-') ? '"' : '') : `'`,
                    [
                      modify,
                      start +
                        name.length +
                        1 +
                        (index
                          ? modifiers.slice(0, index).join('').length + index
                          : 0),
                    ],
                    modify ? `${modify.includes('-') ? '"' : ''}: true, ` : `'`,
                  ]) as Code[]),
                  '}',
                ]
              : []),
          ` satisfies `,
          isNative
            ? modifiersCode
              ? `('trim' | 'number' | 'lazy')[]`
              : `{ trim?: true, number?: true, lazy?: true }`
            : modifiersCode
              ? `(keyof NonNullable<typeof ${ctxMap.get(node)}.props.${getModifierPropName(argument || modelValue)}>)[]`
              : `typeof ${ctxMap.get(node)}.props.${getModifierPropName(argument || modelValue)}`,
          '} ',
        )
      }

      if (!isNative) {
        result.unshift(`{...{'onUpdate:${modelValue}': () => {} }} `)
      }

      codes.replaceRange(start, attribute.end, ...result, '={', valueCode, '}')
    } else {
      if (firstNamespacedNode) {
        codes.replaceRange(attribute.getStart(ast), attribute.end)
        result.push(',')
      } else {
        firstNamespacedNode = {
          attribute,
          node,
        }
      }

      result.push(
        isDynamic ? '[`${' : '',
        ...(argument
          ? ([
              argument.includes('-') ? '"' : '',
              [argument, start + name.length + 1 + (isDynamic ? 1 : 0)],
              argument.includes('-') ? '"' : '',
            ] as Code[])
          : argumentCode
            ? [argumentCode]
            : [modelValue]),
        isDynamic ? '}`]' : '',
        ':',
        valueCode,
      )

      if (modifiersCode) {
        modifiersResult.push(
          ` {...`,
          modifiersCode,
          isDynamic
            ? ''
            : ` satisfies (keyof NonNullable<typeof ${ctxMap.get(node)}.props.${getModifierPropName(argument || modelValue)}>)[]`,
          '}',
        )
      } else if (modifiers.length) {
        modifiersResult.push(
          ` {...{`,
          ...(modifiers.flatMap((modify, index) => [
            modify ? (modify.includes('-') ? '"' : '') : `'`,
            [
              modify,
              start +
                name.length +
                argument.length +
                (isDynamic ? 2 : 0) +
                2 +
                (index ? modifiers.slice(0, index).join('').length + index : 0),
            ],
            modify ? `${modify.includes('-') ? '"' : ''}: true, ` : `'`,
          ]) as Code[]),
          '} satisfies ',
          isDynamic
            ? 'Record<string, boolean>'
            : `typeof ${ctxMap.get(node)}.props.${getModifierPropName(argument || modelValue)}`,
          '}',
        )
      }

      emitsResult.push(`'onUpdate:${argument || modelValue}': () => {}, `)
    }
  }

  if (firstNamespacedNode) {
    const { attribute, node } = firstNamespacedNode
    codes.replaceRange(
      attribute.getStart(ast),
      attribute.end,
      `{...{`,
      ...result,
      `} satisfies __VLS_GetModels<__VLS_NormalizeProps<typeof ${ctxMap.get(node)}.props>>}`,
      ...modifiersResult,
      ` {...{`,
      ...emitsResult,
      `}}`,
    )
  }
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
