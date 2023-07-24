<script setup lang="tsx">
// @ts-nocheck
const list = [1, 2, 3]

defineRender(() => (
  <>
    <div v-for={i in list} key={i}>
      <div>{i}</div>
    </div>
  </>
))
</script>
