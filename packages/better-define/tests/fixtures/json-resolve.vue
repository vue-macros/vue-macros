<script setup lang="ts">
import pkg from './json.json'
const props = defineProps<{
  foo: string
  bar?: Record<string, any>
}>()
</script>
