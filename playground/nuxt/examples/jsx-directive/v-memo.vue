<script setup lang="tsx">
import { Fail, Ok } from '../../assert'

const list = $ref<number[] | undefined>([1, 2, 3])
let selected = $ref(0)

defineRender(() => (
  <>
    <fieldset>
      <legend>v-memo</legend>

      <div
        v-if={list}
        v-for={i in list}
        v-memo={[selected === i]}
        key={i}
        onClick={() => (selected = i)}
      >
        {i}: {selected}
      </div>
    </fieldset>

    <fieldset>
      <legend>v-once</legend>

      <div v-once>
        <Ok v-if={selected === 0} />
        <Fail v-else />
      </div>
    </fieldset>
  </>
))
</script>
