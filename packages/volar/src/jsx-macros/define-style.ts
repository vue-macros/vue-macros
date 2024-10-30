import { generateCssClassProperty } from '@vue/language-core/lib/codegen/script/template'
import { parseCssClassNames } from '@vue/language-core/lib/utils/parseCssClassNames'
import { replaceSourceRange } from 'muggle-string'
import { getStart, getText } from '../common'
import type { TransformOptions } from '../jsx-directive/index'

export function transformDefineStyle(
  defineStyle: import('typescript').CallExpression[] | undefined,
  options: TransformOptions,
): void {
  const { ts, source, codes } = options
  defineStyle?.forEach((expression, index) => {
    if (
      expression?.arguments[0] &&
      !expression.typeArguments &&
      ts.isTemplateExpression(expression.arguments[0])
    ) {
      replaceSourceRange(
        codes,
        source,
        expression.arguments.pos - 1,
        expression.arguments.pos - 1,
        '<{}',
        ...getCssClassesType(
          getText(expression.arguments[0], options).slice(1, -1),
          getStart(expression.arguments[0], options) + 1,
          index,
        ),
        '>',
      )
    }
  })
}

function* getCssClassesType(css: string, offset: number, index: number) {
  for (const className of [...parseCssClassNames(css)]) {
    yield* generateCssClassProperty(
      index,
      className.text,
      className.offset + offset,
      'string',
      false,
    )
  }
}
