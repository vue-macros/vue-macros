import type {
  ComponentObjectPropsOptions,
  ComponentPropsOptions,
  EmitsOptions,
  ObjectEmitsOptions,
} from 'vue'

export default (props: ComponentPropsOptions | EmitsOptions) => {
  return Array.isArray(props)
    ? props.reduce(
        (normalized, p) => ((normalized[p] = null), normalized),
        {} as ComponentObjectPropsOptions | ObjectEmitsOptions,
      )
    : props
}
