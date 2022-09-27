<script setup lang="ts">
const emits = defineEmits<
  SE<{
    // TSPropertySignature
    'input': []
    'update:modelValue': [val: string]
    'update:color': [val: number]
    change: (value: boolean) => boolean

    // TSMethodSignature
    update(): void

    ['foo"\''](value: boolean): boolean

    0: (value: boolean) => void
  }>
>()

const e = defineEmits<{
  (evt: 'update:modelValue', ...args: [val: string]): void
}>()

emits('update:color', 1)
emits('update:modelValue', 'foo')
emits('change', false)
emits(0, false)
</script>
