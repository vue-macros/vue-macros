<script lang="tsx">
import { defineComponent, ref } from 'vue'
import type { Component } from 'vue'
export default defineComponent({
  name: 'CodeGroup',
  setup(_, { slots }) {
    const currentIndex = ref(0)
    return () => {
      // use jsx instead of template because we need to change slots
      // so jsx could handle but template not
      const items = (slots.default?.() ?? [])
        .filter((vnode) => (vnode.type as Component).name === 'CodeGroupItem')
        .map((vnode) => {
          vnode.props = vnode.props ?? {}
          return vnode
        })

      items.forEach((item, index) => {
        item.props!.active = index === currentIndex.value
      })

      return (
        <div rounded="2" overflow="hidden" my="4" w="full">
          <div
            w="full"
            flex="~"
            justify="start"
            items="center"
            gap="10px"
            h="12"
            dark:bg="#27272A"
            bg="#F5F5F5"
            px="3"
            py="4"
            box="border"
          >
            {items.map((item, index) => (
              <div
                key={index}
                cursor="pointer"
                text="sm black"
                px="2"
                py="5px"
                tracking="tight"
                transition="colors"
                rounded="6px"
                box="border"
                class={[
                  'dark:color-white hover:bg-#E5E5E5 dark:hover:bg-#3A3A3D',
                  {
                    active: index === currentIndex.value,
                  },
                ]}
                onClick={() => (currentIndex.value = index)}
              >
                {item.props?.title}
              </div>
            ))}
          </div>
          <div>{items}</div>
        </div>
      )
    }
  },
})
</script>

<style scoped>
.active {
  --at-apply: dark:bg-#3f3f46 bg-#e6e6e6;
}
</style>
