import { computed, ref } from 'vue'
import { foo } from './foo'

console.log(foo)

export const SetupComponentTypeDecl: SetupFC = () => {
  const count = ref(0)
  const double = computed(() => count.value * 2)

  console.log(foo)

  return () => (
    <div>
      <div>SetupComponent type declaration</div>
      <div>count: {count.value}</div>
      <div>double: {double.value}</div>
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
