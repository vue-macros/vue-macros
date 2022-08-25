import { ref } from 'vue'

const msg = ref('Hello')

export default (
  <div>
    setupSFC demo. {msg.value}{' '}
    <button
      onClick={() => {
        debugger
      }}
    >
      Check sourcemap
    </button>
  </div>
)
