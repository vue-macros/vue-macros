import { h } from 'vue'

export function Assert({ l, r }: { l: any; r: any }) {
  let res: boolean
  if (typeof l === 'object') {
    res = JSON.stringify(l) === JSON.stringify(r)
  } else {
    res = l === r
  }
  return res ? Ok() : Fail()
}

export const Ok = () => h('span', { class: ['ok'] }, ['ok'])
export const Fail = () => h('span', { class: ['fail'] }, ['fail'])
