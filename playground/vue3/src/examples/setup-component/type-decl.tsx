import { computed, ref } from 'vue'
import { foo } from './foo'

console.log(foo)

const Comp: SetupFC = ({ foo }: { foo: number }) => <span>{foo}</span>

export const SetupComponentTypeDecl: SetupFC = () => {
  const count = ref(1)
  const double = computed(() => count.value * 2)
  defineExpose({ double })
  const slots = defineSlots({
    default: Comp,
  })

  const foo = ref(1)
  return () => (
    <fieldset>
      <legend>Type Declaration</legend>
      <input v-model={foo.value} type="number" />
      count: <Comp foo={foo.value} />
      <slots.default foo={foo.value} />
      <button onClick={() => count.value++}>inc</button>
    </fieldset>
  )
}
