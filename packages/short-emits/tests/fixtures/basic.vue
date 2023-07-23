<script setup lang="ts">
const emit = defineEmits<
  SE<{
    // TSPropertySignature
    input: []
    'update:modelValue': [val: string]
    'update:color': [val: number]
    change: (value: boolean) => boolean

    // TSMethodSignature
    update(): void

    ['foo"\''](value: boolean): boolean

    0: (value: boolean) => void

    (evt: 'update:modelValue', ...args: [val: string]): void
  }>
>()

emit('update:color', 1)
emit('update:modelValue', 'foo')
emit('change', false)
emit(0, false)
</script>
