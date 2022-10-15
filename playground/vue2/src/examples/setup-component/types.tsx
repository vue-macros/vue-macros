import { computed, ref } from 'vue'
import { foo } from './foo'

console.log(foo)

export const SetupComponentType: SetupFC = () => {
  const count = ref(0)
  const double = computed(() => count.value * 2)

  console.log(foo)

  return () => (
    <div>
      <h3>SetupComponent type declaration</h3>
      <p>count: {count.value}</p>
      <p>double: {double.value}</p>
      <button
        onClick={() => {
          count.value++
          debugger
        }}
      >
        inc & check sourcemap
      </button>
    </div>
  )
}
