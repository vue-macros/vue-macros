import { ref } from 'vue'

export const SetupFCType: SetupFC = () => {
  const count = ref(0)

  return () => (
    <div>
      <h3>SetupFCType</h3>
      <p>count: {count.value}</p>
      <button onClick={() => {
        count.value++
        debugger
      }}>inc & check sourcemap</button>
    </div>
  )
}
