<script setup lang="tsx">
import { expectTypeOf } from 'expect-type'
import { defineComponent, ref, type Ref } from 'vue'
import { useRef } from 'vue-macros/runtime'
import Comp from './comp.vue'

const Comp1 = defineComponent({
  setup() {
    return { foo: 1 }
  },
})

const VaporComp = (
  _: any,
  { expose }: { expose: (exposed: { foo: Ref<number> }) => void },
) => {
  expose({
    foo: ref(1),
  })
  return <div />
}

const comp = useRef()
let comp1 = $(useRef())
const comp2 = $(useRef())
const vaporCompRef = useRef()

defineRender(
  <>
    <Comp ref={comp} foo={1 as const} />
    {expectTypeOf<[1 | null | undefined]>([comp.value?.foo])}

    <Comp1 ref={(e) => (comp1 = e)} />
    {expectTypeOf<[number | null | undefined]>([comp1?.foo])}

    <a ref={$$(comp2)} />
    {expectTypeOf<[HTMLAnchorElement | null | undefined]>([comp2])}

    <VaporComp ref={vaporCompRef} />
    {expectTypeOf<number | null | undefined>(vaporCompRef.value?.foo)}
  </>,
)
</script>
