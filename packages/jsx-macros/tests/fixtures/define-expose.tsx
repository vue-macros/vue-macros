export function Comp() {
  defineExpose({
    foo: 1,
  })
  return <div />
}

export const Comp1 = function (_props: any) {
  defineExpose({
    foo: 1,
  })
  return <div />
}

export const Comp2 = ({ ref: _ref }: any) => {
  defineExpose({
    foo: 1,
  })
  return <div />
}
