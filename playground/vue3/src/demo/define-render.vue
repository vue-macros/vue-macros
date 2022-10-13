<script setup lang="tsx">
defineProps<{
  foo?: string
}>()

defineRender(() => (
  <div>
    defineRender TSX demo.
    <button
      onClick={() => {
        debugger
      }}
    >
      Check source map
    </button>
  </div>
))
</script>
