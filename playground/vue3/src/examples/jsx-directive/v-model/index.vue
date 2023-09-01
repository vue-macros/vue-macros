<script setup lang="tsx">
import Child from './child.vue'

defineRender(() => (
  <Child>
    <template v-slot:title={{ value, ...emits }}>
      <input
        value={value}
        onInput={(e: any) => emits['onUpdate:value'](e.target.value)}
      />
    </template>

    <template v-slot={{ value }}>{value}</template>
  </Child>
))
</script>
