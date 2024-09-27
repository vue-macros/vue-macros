import Context from './context'
import { SetupComponentTypeDecl } from './type-decl'

export const SetupComponentFoo = defineSetupComponent(() => {
  const Ctx = Context()
  return () => (
    <>
      <SetupComponentTypeDecl />
      <Ctx />
    </>
  )
})
