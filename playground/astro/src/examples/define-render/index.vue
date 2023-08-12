<script setup lang="tsx">
import { ref } from 'vue'

console.log('defineRender: hello world')

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
