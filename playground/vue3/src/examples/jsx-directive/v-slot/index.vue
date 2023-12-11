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
  return <slots.default foo="foo"></slots.default>
}

defineRender(() => (
  <fieldset>
    <legend>v-slot</legend>

    <Comp>
      <template v-slot:default={{ foo }}>{''}</template>
    </Comp>

    <Child v-on={{ log: console.log }}>
      <div>default: begin</div>

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
