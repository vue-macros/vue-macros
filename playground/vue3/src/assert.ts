import { h } from 'vue'

export function Assert({ l, r }: { l: any; r: any }) {
  const res =
    typeof l === 'object' ? JSON.stringify(l) === JSON.stringify(r) : l === r
  return res ? Ok() : Fail()
}

export const Ok = () => h('span', { class: ['ok'] }, ['ok'])
export const Fail = () => h('span', { class: ['fail'] }, ['fail'])
