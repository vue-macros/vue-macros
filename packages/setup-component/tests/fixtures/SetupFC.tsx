import { SetupFC } from '../../macros'
import { ref } from 'vue'

const a = 1

const arrowFn = () => {
  console.log('arrowFn')
}

function fn() {
  console.log('fn')
}


for (const item of [1, 2, 3]) {
  console.log(item)
}

export const App: SetupFC<{ name: string }> = (props) => {
  const count = ref(0)


  arrowFn()
  fn()

  return () => (
    <div>
      <p>hi, this is {props.name}</p>
      <p>{count.value}</p>
      <button onClick={() => count.value++}>inc</button>
    </div>
  )
}


