<script setup lang="ts">
import type { HelloWorldProps } from './types'

const msg = 'Hello'
withDefaults(defineProps<HelloWorldProps>(), {
  msg,
})
</script>
