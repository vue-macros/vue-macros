import { babelParse, walkAST } from '@vue-macros/common'
import { describe, expect, test } from 'vitest'
import { MagicString } from 'vue/compiler-sfc'
import { restructure } from '../src/api'
import type { Node } from '@babel/types'

export function transformRestructure(code: string) {
  const s = new MagicString(code)
  const ast = babelParse(code, 'tsx')
  walkAST<Node>(ast, {
    enter(node) {
      if (
        node.type === 'FunctionExpression' ||
        node.type === 'ArrowFunctionExpression' ||
        node.type === 'FunctionDeclaration'
      ) {
        restructure(s, node)
      }
    },
  })
  return s.toString()
}

describe('transform', () => {
  test('reconstruct', () => {
    const code = transformRestructure(
      `const App = ([[[,foo]], {id: {foo: [bar]}}], { baz }) => {
        function onClick({ foo }){
          return { foo, baz: baz.baz }
        };
        return [ foo, bar, baz ]
      }`,
    )!
    expect(code).toMatchSnapshot()
  })

  test('reconstruct arrowFunctionExpression', () => {
    const code = transformRestructure(
      `const App = ([{root: {foo}}]) => (
        <>{[foo]}</>
      )`,
    )!
    expect(code).toMatchSnapshot()
  })

  test('reconstruct default-prop', () => {
    const code = transformRestructure(
      `function App({foo: bar = 'bar', baz: qux, ...rest}, [foo = 'foo']){
        return <>{[bar, qux, rest, foo]}</>
      }`,
    )!
    expect(code).toMatchSnapshot()
  })

  test('reconstruct rest-prop', () => {
    const code = transformRestructure(
      `function App({foo, bar = 1, ...rest}){
        return <>{[foo, bar, rest]}</>
      }`,
    )!
    expect(code).toMatchSnapshot()
  })
})
