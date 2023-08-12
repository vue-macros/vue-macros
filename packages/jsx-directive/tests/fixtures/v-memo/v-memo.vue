<script setup lang="tsx">
const list = [1, 2, 3]
let selected = $ref(0)

defineRender(() => (
  <>
    <div v-for={i in list} v-memo={[selected === i]} key={i}>
      <div>
        {i}: {selected}
      </div>
    </div>
  </>
))
</script>
