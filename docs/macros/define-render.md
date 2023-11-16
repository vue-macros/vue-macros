# defineRender

<StabilityLevel level="stable" />

Defining render function in `<script setup>` using the `defineRender`.

|  Features  |     Supported      |
| :--------: | :----------------: |
|   Vue 3    | :white_check_mark: |
|   Nuxt 3   | :white_check_mark: |
|   Vue 2    | :white_check_mark: |
| TypeScript | :white_check_mark: |

We need more feedback on [RFC Discussion](https://github.com/vuejs/rfcs/discussions/585)!

## Basic Usage

```vue
<script setup lang="tsx">
// JSX passed directly
defineRender(
  <div>
    <span>Hello</span>
  </div>,
)

// Or using render function
defineRender(() => {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  )
})
</script>
```
