import { Assert } from '../../assert'
import { exported } from './foo'

// eslint-disable-next-line unused-imports/no-unused-vars
const foo = 'foo'
const bar = 'bar'

export default () => {
  const qux = 'qux'
  return defineSetupComponent(() => {
    const foo = 'FOO'

    return (
      <fieldset>
        <legend>Context</legend>
        <Assert l={foo} r="FOO" />
        <Assert l={bar} r="bar" />
        <Assert l={baz} r="baz" />
        <Assert l={qux} r="qux" />
        <Assert l={exported} r={2} />
      </fieldset>
    )
  })
}

const baz = 'baz'
