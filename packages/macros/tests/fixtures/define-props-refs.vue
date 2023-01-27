<script setup lang="ts">
const { foo } = definePropsRefs<{
  foo: string
}>()

console.log(foo.value)

// @ts-expect-error
foo.value = 'hello'
</script>
