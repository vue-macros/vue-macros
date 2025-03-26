import { expectTypeOf } from 'expect-type'
import { defineComponent, ref } from 'vue'
import { useRef } from 'vue-macros/runtime'
import { Comp } from './comp'

export default defineComponent(() => {
  const foo = ref('1')
  const compRef = useRef()
  expectTypeOf(compRef.value?.foo).toEqualTypeOf<1 | undefined>()

  return () => (
    <div>
      <Comp
        ref={(e) => (compRef.value = e)}
        v-model_trim={foo.value}
        foo={1}
        v-slot={{ bar }}
      >
        {bar}
      </Comp>

      <input v-model={foo.value}></input>
      {foo.value}
    </div>
  )
})
