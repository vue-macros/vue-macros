<script setup lang="ts">
defineModel<{
  // @ts-expect-error
  foo
  // @ts-expect-error
  bar?
}>()
</script>
