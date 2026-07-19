import { allCodeFeatures, type Code } from 'ts-macro'
import { getDirectiveArgs } from './common'
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
  infer Value,
  infer Modifiers extends string,
  infer Argument extends string
>
  ? [Value, Argument, Array<Modifiers>]
  : any;
`)
}

function transform(
  attribute: import('typescript').JsxAttribute,
  options: TransformOptions,
) {
  const { codes, ast } = options

  const {
    name,
    modifiersCode,
    argument,
    modifiers,
    argumentCode,
    valueCode,
    isDynamic,
  } = getDirectiveArgs(attribute, options)
  const start = attribute.getStart(ast)
  codes.replaceRange(
    start,
    attribute.end,
    [ast.text.slice(start, start + name.length), start, { verification: true }],
    `={[`,
    valueCode || '{} as any',
    ',',
    ...(argument
      ? ([
          ...(isDynamic && !argument.includes('-')
            ? []
            : [[`'`, start + name.length + 1, { verification: true }]]),
          [argument, start + name.length + 1 + (isDynamic ? 1 : 0)],
          ...(isDynamic && !argument.includes('-')
            ? []
            : [
                [
                  `'`,
                  start + name.length + argument.length,
                  { verification: true },
                ],
              ]),
        ] as Code[])
      : argumentCode
        ? [argumentCode]
        : ['{} as any']),
    ',',
    ...(modifiersCode
      ? [modifiersCode]
      : modifiers.length
        ? [
            '[',
            ...modifiers.flatMap((modify, index) => {
              const offset =
                start +
                name.length +
                (argument ? argument.length + 1 : 0) +
                (argument && isDynamic ? 2 : 0) +
                1 +
                (index ? modifiers.slice(0, index).join('').length + index : 0)
              return [
                [`'`, offset],
                [modify, offset],
                [`'`, offset + modify.length - 1],
                ',',
              ] as Code[]
            }),
            ']',
          ]
        : ['{} as any']),
    `] satisfies __VLS_ResolveDirective<typeof `,
    [`v`, start, { ...allCodeFeatures, verification: false }],
    [
      name[2].toUpperCase() + name.slice(3),
      start + 2,
      { ...allCodeFeatures, verification: false },
    ],
    `>}`,
  )
}
