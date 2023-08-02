<script lang="tsx">
const list = [1, 2, 3]

function Foo({ count = 0 }) {
  return (
    <div>
      <span v-for={(i, index) in list}>{index + count}</span>
    </div>
  )
}
</script>

<script setup lang="tsx">
defineRender(() => (
  <fieldset>
    <legend>v-for</legend>

    <span v-for={i in list} style="display:flex; gap: 10px">
      <Foo v-for={(item, index) in list} count={index + i} />
    </span>
  </fieldset>
))
</script>
