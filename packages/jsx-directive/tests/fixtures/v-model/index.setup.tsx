import { ref } from 'vue'

let foo = ref('')
const value = ref('value')
export default (
  <div>
    <input v-model:$value$_trim_number={foo} />
    {foo}
  </div>
)
