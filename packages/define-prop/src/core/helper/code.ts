import {
  type ComponentObjectPropsOptions,
  type ComponentPropsOptions,
  type EmitsOptions,
  type ObjectEmitsOptions,
} from 'vue'

// eslint-disable-next-line import/no-default-export
export default (props: ComponentPropsOptions | EmitsOptions) => {
  return Array.isArray(props)
    ? props.reduce(
        (normalized, p) => ((normalized[p] = null), normalized),
        {} as ComponentObjectPropsOptions | ObjectEmitsOptions
      )
    : props
}
