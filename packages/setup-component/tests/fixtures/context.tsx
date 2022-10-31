const foo = 'foo'
function bar() {}

export const App = defineSetupComponent(() => {
  const bar = 'BAR'
  console.log(foo, bar, baz, App)
})

{
  const qux = 'qux'
  defineSetupComponent(() => {
    console.log(foo, bar, baz, qux, quux)
  })
  const quux = 'quux'
}

var baz = 'baz'

export {}
