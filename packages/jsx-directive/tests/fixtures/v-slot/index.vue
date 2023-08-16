<script setup lang="tsx">
import Child from './child.vue'

defineRender(() => (
  <div>
    <Child v-slot:bottom={{ foo }}>
      {foo}
      <Child v-slot>default</Child>
    </Child>
  </div>
))
</script>
