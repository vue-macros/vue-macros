<script setup lang="ts">
import { defineEmits } from '../../macros' with { type: 'macro' }

const emit = defineEmits<{
  // TSPropertySignature
  input: []
  'update:modelValue': [val: string]
  'update:color': [val: number]
  change: (value: boolean) => boolean

  // TSMethodSignature
  update(): void

  ['foo"\''](value: boolean): boolean

  0: (value: boolean) => void
}>()

emit('update:color', 1)
emit('update:modelValue', 'foo')
emit('change', false)
emit(0, false)

const emit2 = defineEmits<(e: 'change') => void>()
emit2('change')
</script>
