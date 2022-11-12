# defineSlots

Declaring type of SFC slots in `<script setup>` using the `defineSlots`.

|   Features    |              Supported              |
| :-----------: | :---------------------------------: |
|     Vue 3     |         :white_check_mark:          |
|     Vue 2     |         :white_check_mark:          |
| Volar + Vue 3 |         :white_check_mark:          |
| Volar + Vue 2 | :x: (Volar is not supported it yet) |

## Basic Usage

```vue
<script setup lang="ts">
defineSlots<{
  // slot name
  title: {
    // scoped slot
    foo: 'bar' | boolean
  }
}>()
</script>
```

## Volar Configuration

```jsonc {6}
// tsconfig.json
{
  "vueCompilerOptions": {
    "target": 3, // or 2.7 is not supported by Volar.
    "plugins": [
      "@vue-macros/volar/define-slots"
      // ...more feature
    ]
  }
}
```
