# shortEmits

Simplify the definition of emits.

|      Features      |     Supported      |
| :----------------: | :----------------: |
|       Vue 3        | :white_check_mark: |
|       Vue 2        | :white_check_mark: |
| TypeScript / Volar | :white_check_mark: |

## Basic Usage

Using type `ShortEmits` or for short `SE`.

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
