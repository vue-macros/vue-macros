export function hideAstLocation<T>(ast: T): T {
  return JSON.parse(
    JSON.stringify(ast, (key, value) =>
      key === 'ast' ||
      (typeof value === 'object' && 'type' in value && 'loc' in value)
        ? `${value.type}...`
        : value
    )
  )
}
