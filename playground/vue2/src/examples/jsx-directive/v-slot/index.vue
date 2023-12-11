<script setup lang="tsx">
import Child from './child.vue'

defineRender(() => (
  <fieldset>
    <legend>v-slot</legend>

    <Child v-on={{ log: console.log }}>
      <div>default: begin</div>

      <template v-slot:bottom={{ foo }}>
        bottom:{' '}
        <Child v-if={foo} v-slot:bottom={props}>
          {props.foo + foo}
        </Child>
      </template>

      <div>default: end</div>
    </Child>
  </fieldset>
))
</script>
