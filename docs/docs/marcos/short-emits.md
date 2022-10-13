# shortEmits

Simplify the definition of emits.

## Basic Usage

```vue
<script setup lang="ts">
const emits = defineEmits<
  // `ShortEmits` or for short `SE`
  SE<{
    // tuple
    'update:modelValue': [val: string]
    // function
    update(val: string): void
  }>
>()
</script>
```
