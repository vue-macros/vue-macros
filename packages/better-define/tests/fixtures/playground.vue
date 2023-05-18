<script setup lang="ts">
declare const a: string
defineProps<{
  foo: typeof a
}>()
</script>
