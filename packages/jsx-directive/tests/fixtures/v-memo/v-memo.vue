<script setup lang="tsx">
// @ts-nocheck
const list = [1, 2, 3]
let selected = $ref(0)

defineRender(() => (
  <>
    <div v-for={(i, index) in list} v-memo={[selected === i]} key={index}>
      <div>
        {i}: {selected}
      </div>
    </div>
  </>
))
</script>
