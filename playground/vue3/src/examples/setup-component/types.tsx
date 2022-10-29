import { computed, ref } from 'vue'
import { foo } from './foo'

console.log(foo)

const a = 1

const arrowFn = () => {
  console.log('arrowFn')
}

function fn() {
  console.log('fn')
}

export const SetupComponentType: SetupFC = () => {
  const count = ref(0)
  const double = computed(() => count.value * 2)

  console.log(foo)
  console.log('a', a)
  arrowFn()
  fn()

  return () => (
    <div>
      <p>SetupComponent type declaration</p>
      <p>count: {count.value}</p>
      <p>double: {double.value}</p>
      <p></p>
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
