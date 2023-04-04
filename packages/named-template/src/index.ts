import { createUnplugin } from 'unplugin'
import {
  REGEX_VUE_SFC,
  createFilter,
  detectVueVersion,
} from '@vue-macros/common'
import { type BaseOptions, type MarkRequired } from '@vue-macros/common'
import { parseVueRequest, postTransform, preTransform } from './core'
import {
  MAIN_TEMPLATE,
  QUERY_NAMED_TEMPLATE,
  QUERY_TEMPLATE,
} from './core/constants'

export type Options = BaseOptions

export type OptionsResolved = MarkRequired<Options, 'include' | 'version'>

function resolveOption(options: Options): OptionsResolved {
  const version = options.version || detectVueVersion()
  return {
    include: [REGEX_VUE_SFC],
    ...options,
    version,
  }
}

export type TemplateContent = Record<
  string,
  Record<string, string> & { [MAIN_TEMPLATE]?: string }
>

const name = 'unplugin-vue-named-template'
export const PrePlugin = createUnplugin<Options | undefined, false>(
  (userOptions = {}) => {
    const options = resolveOption(userOptions)
    const filter = createFilter(options)

    const templateContent: TemplateContent = {}

    return {
      name: `${name}-pre`,
      enforce: 'pre',

      loadInclude(id) {
        return id.includes(QUERY_TEMPLATE)
      },

      load(id) {
        const { filename, query } = parseVueRequest(id) as any
        const content =
          templateContent[filename]?.[
            'mainTemplate' in query ? MAIN_TEMPLATE : query.name
          ]
        return content
      },

      transformInclude(id) {
        return filter(id) || id.includes(QUERY_NAMED_TEMPLATE)
      },

      transform(code, id) {
        if (id.includes(QUERY_NAMED_TEMPLATE)) {
          const { filename, query } = parseVueRequest(id)
          const { name } = query as any
          const request = `${filename}?vue&${QUERY_TEMPLATE}&name=${name}`
          return `import { createTextVNode } from 'vue'
          import { render } from ${JSON.stringify(request)}
export default {
  render: (...args) => {
    const r = render(...args)
    return typeof r === 'string' ? createTextVNode(r) : r
  }
}`
        } else {
          return preTransform(code, id, templateContent)
        }
      },
    }
  }
)

export type CustomBlocks = Record<string, Record<string, string>>
export const PostPlugin = createUnplugin<Options | undefined, false>(
  (userOptions = {}) => {
    const options = resolveOption(userOptions)
    const filter = createFilter(options)
    const customBlocks: CustomBlocks = {}

    function transformInclude(id: string) {
      return filter(id) || id.includes(QUERY_TEMPLATE)
    }

    return {
      name: `${name}-post`,
      enforce: 'post',

      transformInclude,
      transform(code, id) {
        return postTransform(code, id, customBlocks)
      },

      rollup: {
        transform: {
          order: 'post',
          handler(code, id) {
            if (!transformInclude(id)) return
            return postTransform(code, id, customBlocks)
          },
        },
      },
    }
  }
)

const plugin = createUnplugin<Options | undefined, true>(
  (userOptions = {}, meta) => {
    return [PrePlugin.raw(userOptions, meta), PostPlugin.raw(userOptions, meta)]
  }
)

export default plugin
