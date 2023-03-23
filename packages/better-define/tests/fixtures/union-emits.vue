<script setup lang="ts">
type Emits = 'some' | 'emit'
const emit = defineEmits<{
  (e: Emits): void
  (e: 'another', val: string): void
}>()
</script>
