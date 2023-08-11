<script setup lang="tsx">
let selected = $ref(0)

defineRender(() => (
  <div v-once onClick={() => selected++}>
    {selected}
  </div>
))
</script>
