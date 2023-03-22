<script setup lang="ts">
defineProps<{
  // @ts-expect-error
  foo: Foo
}>()
</script>
