import type MagicString from 'magic-string'

export const getTransformResult = (
  s: MagicString | undefined,
  id: string
): { code: string; map: any } | undefined => {
  if (s?.hasChanged()) {
    return {
      code: s.toString(),
      get map() {
        return s.generateMap({
          source: id,
          includeContent: true,
        })
      },
    }
  }
}
