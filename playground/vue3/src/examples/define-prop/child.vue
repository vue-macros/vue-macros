<script setup lang="tsx">
import { Assert } from '../../assert'

// KevinEdition
const foo = defineProp<string>()
const bar = $defineProp('bar', { default: 'bar', required: true })
const baz = $(defineProp('baz', { default: 'baz' }))

// johnsonEdition
// const foo = defineProp<string>()
// const bar = $defineProp(() => 'bar', true)
// const baz = $(defineProp('baz'))

const props = definePropsRefs<{ msg?: string }>()

defineRender(() => (
  <>
    <div>foo: {{ foo }}</div>
    <div>
      <Assert l={bar} r="bar" />
      <Assert l={baz} r="baz" />
      <Assert l={'msg' in props} r={true} />
    </div>
  </>
))
</script>
