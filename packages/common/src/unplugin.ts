import type { MagicString } from '@vue/compiler-sfc'

export const getTransformResult = (
  s: MagicString | undefined,
  id: string
): { code: string; map: any } | undefined => {
  if (s && s.original !== s.toString()) {
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
