# defineRender

Defining render function in `<script setup>` using the `defineRender`.

|      Features      |     Supported      |
| :----------------: | :----------------: |
|       Vue 3        | :white_check_mark: |
|       Vue 2        | :white_check_mark: |
| TypeScript / Volar | :white_check_mark: |

## Basic Usage

```vue
<script setup lang="tsx">
// JSX passed directly
defineRender(
  <div>
    <span>Hello</span>
  </div>
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
