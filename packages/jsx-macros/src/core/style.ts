import { compileStyleAsync } from 'vue/compiler-sfc'
import type { OptionsResolved } from '../api'

export async function transformStyle(
  code: string,
  id: string,
  options: OptionsResolved,
): Promise<string> {
  const query = new URLSearchParams(id.split('?')[1])
  const result = await compileStyleAsync({
    filename: id,
    id: `data-v-${query.get('scopeId')}`,
    isProd: options.isProduction,
    source: code,
    scoped: query.get('scoped') === 'true',
  })

  return result.code
}
