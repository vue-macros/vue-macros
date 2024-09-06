export default function () {
  const slots = defineSlots({
    default: () => <div>default</div>,
  })
  return <div>{slots.default()}</div>
}
