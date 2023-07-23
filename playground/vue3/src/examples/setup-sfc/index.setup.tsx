import { ref } from 'vue'

const msg = ref('Hello World')

export default () => (
  <div>
    <input type="text" v-model={msg.value} />
    <div>{msg.value}</div>
  </div>
)
