<script setup lang="tsx">
import { ref } from 'vue'
import { Assert } from '../../assert'

const msg = ref('hello')

setTimeout(() => {
  msg.value = 'world'
}, 10)

defineRender(() => <Assert l={msg.value} r="world" />)
</script>
