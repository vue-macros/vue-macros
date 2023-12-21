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

let show = $ref<boolean | undefined>()
defineRender(() => (
  <div>
    <Child v-slot:bottom={{ foo }}>
      {foo}
      <Child v-slot>default</Child>
    </Child>

    <Comp v-slot>default</Comp>
    <Child v-slot:bottom={{ foo }}>{foo}</Child>

    <Comp v-slot />
    <Child v-slot:bottom={{ foo }} />

    <Child>
      <template v-slot>default</template>
      <template v-if={show} v-slot:bottom={{ foo }}>
        {show}
      </template>
      <template v-else-if={show === false} v-slot:bot-tom={{ foo }}>
        {foo}
      </template>
      <template v-else v-slot:title />
    </Child>
  </div>
))
</script>
