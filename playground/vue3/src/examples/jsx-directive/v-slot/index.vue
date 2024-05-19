<script setup lang="tsx" generic="T">
import { type FunctionalComponent, shallowRef } from 'vue'
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
