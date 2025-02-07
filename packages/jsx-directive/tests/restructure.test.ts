import { describe, expect, test } from 'vitest'
import { transformRestructure } from '../src/api'

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

  test('unwrap ref', () => {
    const code = transformRestructure(
      `function App([foo, bar = 1, ...rest]){
      return <>{[foo, bar, rest]}</>
      }`,
      { unwrapRef: true },
    )!
    expect(code).toMatchSnapshot()
  })
})
