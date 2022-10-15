<script setup lang="tsx">
import { ref } from 'vue'

const msg = ref('hello')

defineRender(() => (
  <div>
    defineRender TSX demo: {msg.value}{' '}
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
