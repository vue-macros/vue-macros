<script setup lang="tsx">
import Child from './child.vue'
import type { FunctionalComponent } from 'vue'

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

defineRender(() => (
  <fieldset>
    <legend>v-slot</legend>

    <Child>
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
