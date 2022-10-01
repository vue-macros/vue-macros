import { SetupFC } from '../../macros'
import { ref } from 'vue'

export const App: SetupFC<{ name: string }> = (props) => {
  const count = ref(0)

  return () => (
    <div>
      <p>hi, this is {props.name}</p>
      <p>{count.value}</p>
      <button onClick={() => count.value++}>inc</button>
    </div>
  )
}
