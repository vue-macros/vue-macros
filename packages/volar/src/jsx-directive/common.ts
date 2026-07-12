import type { TransformOptions } from './index'
import type { Code } from 'ts-macro'

export function getDirectiveArgs(
  attribute: import('typescript').JsxAttribute,
  options: TransformOptions,
): {
  name: string
  valueCode: Code | undefined
  argument: string
  argumentCode: Code | undefined
  modifiers: string[]
  modifiersCode: Code | undefined
  isDynamic: boolean
} {
  const { ts, ast } = options
  const attributeName = attribute.name.getText(ast)
  let isDynamic = false
  let argument = ''
  let [name, ...modifiers] = attributeName
    .split(/\s/)[0]
    .replace(/\$([^$]+)\$/, (_, $1) => {
      isDynamic = true
      return $1.replaceAll('_', '.')
    })
    .split('_')
  if (name.includes(':')) {
    ;[name, argument] = name.split(':')
  }

  const initializer = attribute.initializer
  let modifiersCode: Code | undefined
  let valueCode: Code | undefined
  let argumentCode: Code | undefined
  if (
    initializer &&
    initializer.kind === ts.SyntaxKind.JsxExpression &&
    initializer.expression &&
    ts.isArrayLiteralExpression(initializer.expression)
  ) {
    const elements = initializer.expression.elements
    // value
    if (elements[0]) {
      valueCode = [elements[0].getText(ast), elements[0].getStart(ast)]
    }

    // modifies
    if (elements[1] && ts.isArrayLiteralExpression(elements[1])) {
      modifiersCode = [elements[1].getText(ast), elements[1].getStart(ast)]
    } else {
      // argument
      if (elements[1]) {
        isDynamic ||= !ts.isStringLiteral(elements[1])
        argumentCode = [elements[1].getText(ast), elements[1].getStart(ast)]
      }
      if (elements[2] && ts.isArrayLiteralExpression(elements[2])) {
        modifiersCode = [elements[2].getText(ast), elements[2].getStart(ast)]
      }
    }
  } else if (initializer) {
    valueCode = [
      ts.isStringLiteral(attribute.initializer)
        ? attribute.initializer.getText(ast)
        : attribute.initializer.getText(ast).slice(1, -1),
      attribute.initializer.getStart(ast) +
        (ts.isStringLiteral(attribute.initializer) ? 0 : 1),
    ]
  }
  return {
    name,
    valueCode,
    argumentCode,
    modifiersCode,
    isDynamic,
    argument,
    modifiers,
  }
}

export const getModifierPropName = (name: string): string => {
  return `${
    name === 'modelValue' || name === 'model-value' ? 'model' : name
  }Modifiers${name === 'model' ? '$' : ''}`
}
