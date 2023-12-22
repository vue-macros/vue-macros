<script setup lang="tsx">
import Child from './child.vue'

let bar = $ref('')
defineRender(() => (
  <fieldset onClick_capture_stop={() => console.log('stopped')}>
    <legend>v-on</legend>

    <Child v-on={{ log: console.log }}>
      <input
        value={bar}
        onInput_prevent={(event: any) => (bar = event.target.value)}
      />
      {bar}
    </Child>
  </fieldset>
))
</script>
