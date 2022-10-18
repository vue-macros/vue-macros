import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import { REGEX_VUE_SFC } from '@vue-macros/common'
import { createCombinePlugin } from 'unplugin-combine'
import { parseVueRequest } from '@vitejs/plugin-vue'
import { postTransform, preTransform } from './core'
import {
  MAIN_TEMPLATE,
  QUERY_NAMED_TEMPLATE,
  QUERY_TEMPLATE,
} from './core/constants'
import type { FilterPattern } from '@rollup/pluginutils'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
}

export type OptionsResolved = Omit<Required<Options>, 'exclude'> & {
  exclude?: FilterPattern
}

function resolveOption(options: Options): OptionsResolved {
  return {
    include: [REGEX_VUE_SFC],
    ...options,
  }
}

export type TemplateContent = Record<
  string,
  Record<string, string> & { [MAIN_TEMPLATE]?: string }
>

export const PrePlugin = createUnplugin((options: OptionsResolved) => {
  const filter = createFilter(options.include, options.exclude)

  const templateContent: TemplateContent = {}

  const name = 'unplugin-vue-named-template-pre'
  return {
    name,
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
      try {
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
      } catch (err: unknown) {
        this.error(`${name} ${err}`)
      }
    },
  }
})

export type CustomBlocks = Record<string, Record<string, string>>
export const PostPlugin = createUnplugin((options: OptionsResolved) => {
  const filter = createFilter(options.include, options.exclude)
  const customBlocks: CustomBlocks = {}

  function transformInclude(id: string) {
    return filter(id) || id.includes(QUERY_TEMPLATE)
  }

  const name = 'unplugin-vue-named-template-post'
  return {
    name,
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
})

const name = 'unplugin-vue-named-template'
export default createCombinePlugin((userOptions: Options = {}) => {
  const options = resolveOption(userOptions)
  return {
    name,
    plugins: [
      [PrePlugin, options],
      [PostPlugin, options],
    ],
  }
})
