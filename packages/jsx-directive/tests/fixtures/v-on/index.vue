<script setup lang="tsx">
import { expectTypeOf } from 'expect-type'
import Child from './child.vue'

let bar = $ref('')
defineRender(() => (
  <fieldset>
    <legend>v-on</legend>

    <Child
      bar={bar}
      v-on={{ log: (e) => expectTypeOf<string>(e) }}
      onClick_capture_stop={() => console.log('stopped')}
    >
      <input
        value={bar}
        onInput_prevent={(event: any) => (bar = event.target.value)}
      />
      {bar}
    </Child>
  </fieldset>
))
</script>
