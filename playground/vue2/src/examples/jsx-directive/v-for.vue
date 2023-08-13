<script setup lang="tsx">
const list: number[] | undefined = [1, 2, 3]

defineRender(() => (
  <fieldset>
    <legend>v-for</legend>

    <span v-if={list} v-for={i in list} class="flex gap-3">
      <div v-for={(item, index) in list}>
        <span v-for={(_, _index) in list}>{index + _index + i}</span>
      </div>
    </span>
  </fieldset>
))
</script>
