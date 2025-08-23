interface AttrsReturn {
  class?: string
  style?: string
  'data-style-src'?: string
}

/** StyleX removed the `attrs` api at [0.13.0](https://stylexjs.com/blog/v0.13.0/#breaking-changes).
 * Follow the [guide](https://stylexjs.com/docs/api/javascript/props/#not-using-react) to add it back.
 */
export default ({
  className,
  'data-style-src': dataStyleSrc,
  style,
}: ReturnType<(typeof import('@stylexjs/stylex'))['props']>): AttrsReturn => {
  const result: AttrsReturn = {}
  // Convert className to class
  if (className != null && className !== '') {
    result.class = className
  }
  // Convert style object to string
  if (style != null && Object.keys(style).length > 0) {
    result.style = Object.keys(style)
      .map((key) => `${key}:${style[key]};`)
      .join('')
  }
  if (dataStyleSrc != null && dataStyleSrc !== '') {
    result['data-style-src'] = dataStyleSrc
  }
  return result
}
