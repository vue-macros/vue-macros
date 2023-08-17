<script setup lang="tsx">
const map = new Map([
  [1, '2'],
  [3, '4'],
])
const set = new Set(['1', '2', '3'])

defineRender(() => (
  <>
    <div v-for={i in [1, 2, 3]} key={i}>
      <div>{i}</div>
    </div>

    <div v-for={i in set} key={i}>
      <div>{i}</div>
    </div>

    <div v-for={([key, value], index) in map} key={index}>
      <div>
        {key}: {value}
      </div>
    </div>
  </>
))
</script>
