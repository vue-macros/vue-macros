function resolveDefaultProps(paths: Record<string, any>): any {
  const result: any = {}

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

function defaultPropsProxy(props: any, defaultProps: any): any {
  return new Proxy(props, {
    get(target, prop) {
      const value =
        target[prop] === undefined ? defaultProps?.[prop] : target?.[prop]
      if (typeof value === 'object' && value !== null) {
        return defaultPropsProxy(value, defaultProps[prop])
      }
      return value
    },
  })
}

export function createDefaultPropsProxy(props: any, defaultProps: any): any {
  const resolvedDefaultProps = resolveDefaultProps(defaultProps)
  return defaultPropsProxy(props, resolvedDefaultProps)
}
