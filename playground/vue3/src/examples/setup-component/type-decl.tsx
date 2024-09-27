import { computed, ref } from 'vue'
import { foo } from './foo'

console.log(foo)

export const SetupComponentTypeDecl: SetupFC = () => {
  const count = ref(0)
  const double = computed(() => count.value * 2)

  return () => (
    <fieldset>
      <legend>Type Declaration</legend>
      <button onClick={() => count.value++}>inc</button>
      <div>count: {count.value}</div>
      <div>double: {double.value}</div>
    </fieldset>
  )
}
