<script setup lang="ts">
defineProps<{
  // @ts-expect-error
  foo: Foo
  bar: Pick<{ foo: string }, 'foo'>
  bool: unknown | boolean
  fun: unknown | Function
  boolAndFun: unknown | boolean | Function | number
}>()
</script>
