import { defineComponent, ref } from 'vue'

export const Comp = () => {
  const color = ref('red')
  defineStyle(`
    .foo {
      color: ${color.value};
    }
  `)
  return <div class="foo">foo</div>
}

export default defineComponent(() => {
  const color = ref('red')
  defineStyle.scss(
    `
    .bar {
      color: ${color.value};
    }
  `,
    { scoped: true },
  )
  return () => (
    <>
      <div class="bar">foo</div>
      <div class="bar">
        <span>bar</span>
      </div>
    </>
  )
})

defineStyle.scss(`
  .bar {
    color: red;
  }
`)
