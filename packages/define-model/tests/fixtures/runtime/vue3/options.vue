<script setup lang="ts">
const { foo, bar } = defineModel<{
  foo?: string
  bar?: ModelOptions<boolean, { defaultValue: true, }>
}>()

console.log(foo.value, bar.value)
</script>
