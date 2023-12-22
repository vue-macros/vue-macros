<script setup lang="tsx">
import Child from './child.vue'

let bar = $ref('')
defineRender(() => (
  <fieldset>
    <legend>v-on</legend>

    <Child
      v-on={{ log: console.log }}
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
