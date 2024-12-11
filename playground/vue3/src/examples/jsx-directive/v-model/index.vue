<!-- eslint-disable prefer-const -->
<script setup lang="tsx">
import Child from './child.vue'

let foo = $ref(1)
let bar = $ref('')
// eslint-disable-next-line unused-imports/no-unused-vars
const baz = $ref('title')
defineRender(() => (
  <fieldset>
    <legend>v-model</legend>

    <Child bar={bar} v-model={foo} v-model:$baz$={bar}>
      {bar}
    </Child>
  </fieldset>
))
</script>
