<script setup lang="tsx" generic="T">
import { shallowRef, type FunctionalComponent } from 'vue'
import Child from './child.vue'

const Comp: FunctionalComponent<
  {},
  {},
  {
    default: (scope: { foo: string }) => any
  }
> = (props, { slots }) => {
  return (
    <Child>
      <template v-for={(Slot, slotName) in slots} v-slot:$slotName$={scope}>
        <Slot {...scope} />
      </template>
    </Child>
  )
}

const childRef = shallowRef<InstanceType<typeof Child>>()

// https://github.com/vue-macros/vue-macros/issues/869
const foo = $ref('foo')

defineRender(() => (
  <fieldset>
    <legend>v-slot</legend>

    <Child
      ref={(e) => {
        childRef.value = e
      }}
    >
      <Comp v-slot={{ foo }}>
        <div>default: {foo}</div>
      </Comp>

      <template v-slot:bottom={{ foo }}>
        bottom:{' '}
        <Child v-if={foo} v-slot:bottom={props}>
          {props.foo + foo}
        </Child>
      </template>

      <div>default: end</div>
    </Child>
  </fieldset>
))
</script>
