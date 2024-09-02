<script lang="tsx">
const list: number[] | undefined = [1, 2, 3]

function Foo({ count = 0 }) {
  return (
    <div>
      <span v-if={!list} />
      <span v-else v-for={(i, index) in list}>
        {index + count}
      </span>
    </div>
  )
}
</script>

<script setup lang="tsx">
defineRender(() => (
  <fieldset>
    <legend>v-for</legend>

    <span v-if={list} v-for={i in list} class="flex gap-3">
      <span v-for={(item, index) in list}>
        <Foo count={index + i} />
      </span>
    </span>
  </fieldset>
))
</script>
