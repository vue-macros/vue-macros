<script setup lang="tsx">
import Child from './child.vue'

const foo = $ref(1)
const bar = $ref('')

defineRender(() => (
  <Child bar={bar} v-model:title={foo} v-model:bottom={foo} v-model={foo}>
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
