import { exported } from './foo'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const foo = 'foo'
const bar = 'bar'

export default () => {
  const qux = 'qux'
  return defineSetupComponent(() => {
    const foo = 'FOO'

    return (
      <div>
        {foo},{bar},{baz},{qux},{exported}
      </div>
    )
  })
}

const baz = 'baz'
