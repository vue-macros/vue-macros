<script setup lang="tsx">
import { expectTypeOf } from 'expect-type'
import { useRef } from 'unplugin-vue-macros/runtime'
import { defineComponent } from 'vue'
import Comp from './comp.vue'

const Comp1 = defineComponent({
  setup() {
    return { foo: 1 }
  },
})

const comp = useRef()
let comp1 = $(useRef())
const comp2 = $(useRef())

defineRender(
  <>
    <Comp ref={comp} foo={1 as const} />
    {expectTypeOf<[1 | null | undefined]>([comp.value?.foo])}

    <Comp1 ref={(e) => (comp1 = e)} />
    {expectTypeOf<[number | null | undefined]>([comp1?.foo])}

    <a ref={$$(comp2)} />
    {expectTypeOf<[HTMLAnchorElement | null | undefined]>([comp2])}
  </>,
)
</script>
