import { replaceSourceRange } from 'muggle-string'
import { allCodeFeatures, type Code } from 'ts-macro'
import { getStart, getText } from '../common'
import type { TransformOptions } from '.'

export function transformCustomDirective(
  attributes: import('typescript').JsxAttribute[],
  options: TransformOptions,
): void {
  if (!attributes.length) return

  attributes.forEach((attribute) => transform(attribute, options))

  options.codes.push(`
type __VLS_ResolveDirective<T> = T extends import('vue').Directive<
  any,
  infer V,
  infer M extends string,
  infer A extends string
>
  ? [any, V, A, Record<M, true>]
  : any;
`)
}

function transform(
  attribute: import('typescript').JsxAttribute,
  options: TransformOptions,
) {
  const { codes, source, ts, ast } = options

  const attributeName = getText(attribute.name, options)
  let directiveName = attributeName.split(/\s/)[0].split('v-')[1]
  let modifiers: string[] = []
  if (directiveName.includes('_')) {
    ;[directiveName, ...modifiers] = directiveName.split('_')
  }
  if (directiveName)
    directiveName = directiveName[0].toUpperCase() + directiveName.slice(1)
  let arg
  if (directiveName.includes(':')) {
    ;[directiveName, arg] = directiveName.split(':')
  }
  const start = getStart(attribute, options)
  const offset = start + directiveName.length + 2
  replaceSourceRange(
    codes,
    source,
    start,
    attribute.end,
    [ast.text.slice(start, offset), source, start, { verification: true }],
    `={[`,
    [`v`, source, start, { ...allCodeFeatures, verification: false }],
    [
      directiveName,
      source,
      start + 2,
      { ...allCodeFeatures, verification: false },
    ],
    `,`,
    attribute.initializer
      ? [
          ts.isStringLiteral(attribute.initializer)
            ? getText(attribute.initializer, options)
            : getText(attribute.initializer, options).slice(1, -1),
          source,
          getStart(attribute.initializer, options) +
            (ts.isStringLiteral(attribute.initializer) ? 0 : 1),
          allCodeFeatures,
        ]
      : '{} as any',
    ',',
    ...(arg !== undefined
      ? ([
          [`'`, source, offset + 1, { verification: true }],
          [arg, source, offset + 1, allCodeFeatures],
          [
            `'`,
            source,
            offset + arg.length,
            allCodeFeatures,
            { verification: true },
          ],
        ] as Code[])
      : ['{} as any']),
    ',',
    ...(modifiers.length
      ? ([
          '{',
          ...modifiers.flatMap((modify, index) => [
            modify ? '' : `'`,
            [
              modify,
              source,
              getStart(attribute, options) +
                (attributeName.indexOf('_') + 1) +
                (index ? modifiers.slice(0, index).join('').length + index : 0),
              allCodeFeatures,
            ],
            modify ? ': true,' : `'`,
          ]),
          '}',
        ] as Code[])
      : ['{} as any']),
    `] satisfies __VLS_ResolveDirective<typeof v${directiveName}>}`,
  )
}
