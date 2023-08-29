import { SetupComponentTypeDecl } from './type-decl'
import Context from './context'

export const SetupComponentFoo = defineSetupComponent(() => {
  const Ctx = Context()
  return () => (
    <>
      <SetupComponentTypeDecl />
      <Ctx />
    </>
  )
})
