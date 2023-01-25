<script setup lang="ts">
defineProps<{
  onClick?(): void
  onSubmit(): void
  // @ts-expect-error
  onSubmit?(): void
}>()
</script>
