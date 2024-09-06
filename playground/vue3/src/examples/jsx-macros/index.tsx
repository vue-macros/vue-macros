import { defineComponent, ref } from 'vue'
import { Comp } from './comp'

export default defineComponent(() => {
  const foo = ref('1')

  return () => (
    <div>
      <Comp v-model_trim={foo.value} foo="foo">
        <template v-slot={{ bar }}>{bar}</template>
      </Comp>
      <input v-model={foo.value}></input>
      {foo.value}
    </div>
  )
})
