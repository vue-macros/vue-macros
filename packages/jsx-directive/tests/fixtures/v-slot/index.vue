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
      default
      <template v-if={show} v-slot:title={{ foo }}>
        {show}
      </template>
      <template v-else-if={show === false} v-slot:center={{ foo }}>
        {foo}
      </template>
      <template v-else v-slot:bottom />
      <template v-slot:bot-tom>bot-tom</template>
    </Child>
  </div>
))
</script>
