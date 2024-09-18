import { useRef } from 'unplugin-vue-macros/runtime'
import Context from './context'
import { SetupComponentTypeDecl } from './type-decl'

export const SetupComponentFoo = defineSetupComponent(() => {
  const Ctx = Context()
  const compRef = useRef()
  return () => (
    <>
      <SetupComponentTypeDecl ref={compRef} v-slot={{ foo }}>
        <div>double: {Number(compRef.value?.double) * foo}</div>
      </SetupComponentTypeDecl>
      <Ctx />
    </>
  )
})
