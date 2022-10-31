import { SetupComponentTypeDecl } from './type-decl'
import Context from './context'

export const SetupComponentFoo = defineSetupComponent(() => {
  const Ctx = Context()
  return () => (
    <>
      SetupComponent - Foo{' '}
      <button
        onClick={() => {
          // TODO: sourcemap
          debugger
        }}
      >
        Check sourcemap
      </button>
      <hr />
      <SetupComponentTypeDecl />
      <hr />
      <Ctx />
    </>
  )
})
