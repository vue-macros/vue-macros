# shortEmits

<StabilityLevel level="stable" />

Simplify the definition of emits.

For Vue >= 3.3, this feature will be turned off by default.

|  Features  |     Supported      |
| :--------: | :----------------: |
|   Vue 3    | :white_check_mark: |
|   Vue 2    | :white_check_mark: |
| TypeScript | :white_check_mark: |

## Basic Usage

Using type `ShortEmits` or for short `SE`.

```vue
<script setup lang="ts">
const emits = defineEmits<{
  // tuple
  'update:modelValue': [val: string]
  // function
  update(val: string): void
}>()
</script>
```

## Difference with Official Version

- function style of declaration is not supported by official version.
