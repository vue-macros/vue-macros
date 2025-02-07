<script setup lang="ts">
import { type PrimitiveProps } from 'radix-vue'

interface Props extends PrimitiveProps {
  foo?: string
}

defineProps<Props>()
</script>
