import { computed, ref } from 'vue'
import { a } from './foo'

export const SetupFCType: SetupFC = () => {
  const count = ref(0)
  const double = computed(() => count.value * 2)

  return () => (
    <div>
      <h3>SetupFCType</h3>
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
