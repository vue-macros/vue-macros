<script setup lang="tsx">
import Child from './child.vue'

defineRender(() => (
  <fieldset>
    <legend>v-slot</legend>

    <Child>
      default: begin
      <template v-slot:bottom={props}>
        <div>{props.foo}</div>
      </template>
      <Child class="ml-3" v-slot={{ foo }}>
        {foo}
      </Child>
      default: end
    </Child>
  </fieldset>
))
</script>
