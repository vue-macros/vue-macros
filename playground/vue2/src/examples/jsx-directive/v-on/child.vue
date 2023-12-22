<script setup lang="tsx">
import { getCurrentInstance } from 'vue'
defineSlots<{
  default: () => any
}>()

const { proxy } = getCurrentInstance()!

const emit = defineEmits(['log', 'click'])

defineRender(() => (
  <form onSubmit_prevent onClick={() => emit('log', 1)}>
    {proxy.$slots.default}
  </form>
))
</script>
