function resolveDefaultProps(paths: Record<string, any>): any {
  const result: Record<string, any> = {}

  for (const path of Object.keys(paths)) {
    const segments = path.split(/[?.[\]]/).filter(Boolean)
    let current = result

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      if (i === segments.length - 1) {
        current[segment] = paths[path]
      } else {
        if (!current[segment]) {
          current[segment] = Number.isNaN(Number(segments[i + 1])) ? {} : []
        }
        current = current[segment]
      }
    }
  }

  return result
}

export function createPropsDefaultProxy(
  props: Record<string, any>,
  defaults: Record<string, any>,
): Record<string, any> {
  const defaultProps = resolveDefaultProps(defaults)
  const result: Record<string, any> = {}

  for (const key of [
    ...new Set([...Object.keys(props), ...Object.keys(defaultProps)]),
  ]) {
    Object.defineProperty(result, key, {
      enumerable: true,
      get: () => (props[key] === undefined ? defaultProps[key] : props[key]),
    })
  }

  return result
}
