<script setup lang="tsx">
import { Assert } from '../../assert'

// Kevin's Edition
const foo = defineProp<string>()
const bar = $defineProp('bar', { default: 'bar', required: true })
const baz = $(defineProp('baz', { default: 'baz' }))

// Johnson's Edition
// const foo = defineProp<string>()
// const bar = $defineProp('bar', true)
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
