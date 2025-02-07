<script setup lang="tsx">
const map = new Map([
  [1, '2'],
  [3, '4'],
])
const set = new Set(['1', '2', '3'])
const object = { id: 1, name: 'admin' }
let selected = 0

const Comp = <div v-for={i in 4}>{i}</div>

defineRender(() => (
  <>
    <div v-for={i in 4} key={i}>
      <div>{i}</div>
    </div>

    <div v-for={(value, key, index) in object} key={index}>
      {key}: {value}
    </div>

    <div v-for={(i, index) in [1, 2, 3][Symbol.iterator]()} key={index}>
      <div>{i}</div>
    </div>

    <div v-for={i in [1, 2, 3]} v-memo={[selected === i]} key={i}>
      <div>{i}</div>
    </div>

    <div v-if={set} v-for={i in set} key={i}>
      <div>{i}</div>
    </div>

    <div v-for={([key, value], index) in map} key={index}>
      {key}
      <div v-for={key in 3}>
        {key}: {value}
      </div>
    </div>
  </>
))
</script>
