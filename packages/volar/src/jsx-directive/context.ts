import { addCode, getText, isJsxExpression } from '../common'
import {
  type JsxDirective,
  type TransformOptions,
  getOpeningElement,
  getTagName,
} from './index'

export function transformCtx(
  node: JsxDirective['node'],
  index: number,
  options: TransformOptions,
): string {
  const { ts, codes } = options

  const openingElement = getOpeningElement(node, options)
  if (!openingElement) return ''

  let props = ''
  for (const prop of openingElement.attributes.properties) {
    if (!ts.isJsxAttribute(prop)) continue
    const name = getText(prop.name, options)
    if (name.startsWith('v-')) continue

    const value = isJsxExpression(prop.initializer)
      ? getText(prop.initializer.expression!, options)
      : 'true'
    props += `'${name}': ${value},`
  }

  const tagName = getTagName(node, { ...options, withTypes: true })
  const ctxName = `__VLS_ctx${index}`
  if (!codes.toString().includes('function __VLS_getFunctionalComponentCtx')) {
    codes.push(
      `function __VLS_getFunctionalComponentCtx<T, K>(comp: T, compInstance: K): __VLS_PickNotAny<
	'__ctx' extends keyof __VLS_PickNotAny<K, {}> ? K extends { __ctx?: infer Ctx } ? Ctx : never : any
	, T extends (props: infer P, ctx: infer Ctx) => any ? Ctx & { props: P } : any>;
`,
    )
  }

  addCode(
    codes,
    `const ${ctxName} = __VLS_getFunctionalComponentCtx(${tagName}, __VLS_asFunctionalComponent(${tagName})({${props}}));\n`,
  )

  return ctxName
}
