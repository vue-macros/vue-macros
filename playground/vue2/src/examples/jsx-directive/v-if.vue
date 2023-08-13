<script setup lang="tsx">
import { expectTypeOf } from 'expect-type'
import { Fail, Ok } from '../../assert'
const { foo = 0 } = defineProps<{
  foo?: number
}>()

defineRender(() => (
  <fieldset>
    <legend>v-if</legend>

    <div v-if={typeof foo === 'number'}>
      <div v-if={foo === 0}>
        <Ok /> {expectTypeOf<0>(foo).toBeNumber()}
      </div>
      <div v-else-if={foo === 1}>
        <Fail /> {expectTypeOf<1>(foo).toBeNumber()}
      </div>
      <div v-else>
        <Fail /> {expectTypeOf<number>(foo).toBeNumber()}
      </div>
    </div>
    <div v-else>
      <Fail />
      {expectTypeOf<undefined>(foo).toBeUndefined()}
    </div>
  </fieldset>
))
</script>
