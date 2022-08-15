// @ts-expect-error
defineOptions({
  name: 'App',
})

export default () => {
  // @ts-ignore
  return <div />
}
