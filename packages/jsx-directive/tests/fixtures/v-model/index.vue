<script setup lang="tsx">
import { ref } from 'vue'

let foo = ref('')
const value = ref('value')
defineRender(() => (
  <div>
    <input v-model:$value_value$_trim_number={foo} />
    <input v-model={foo} type="checkbox" value="1"></input>
    {foo}
  </div>
))
</script>
