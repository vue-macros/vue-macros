<script setup lang="tsx">
import { defineProps } from '../../macros' with { type: 'macro' }

defineProps<{
  foo?: string
}>().withDefaults({
  foo: '111',
})
</script>
