<script setup lang="tsx">
import { defineProps } from '../../macros' assert { type: 'macro' }

defineProps<{
  foo?: string
}>().withDefaults({
  foo: '111'
})
</script>
