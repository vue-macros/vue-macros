import { h, defineComponent } from 'vue'

export const Assert = defineComponent({
  functional: true,
  props: ['l', 'r'],
  render: function (h, ctx) {
    const { l, r } = ctx.props
    let res: boolean
    if (typeof l === 'object') {
      res = JSON.stringify(l) === JSON.stringify(r)
    } else {
      res = l === r
    }
    return res ? h(Ok) : h(Fail)
  },
})

export const Ok = defineComponent({
  render: (h) => h('span', { class: ['ok'] }, ['ok']),
})

export const Fail = defineComponent({
  render: (h) => h('span', { class: ['fail'] }, ['fail']),
})
