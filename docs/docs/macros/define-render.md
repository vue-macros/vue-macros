# defineRender

`defineRender` allow define render function in `<script setup>` block.

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
