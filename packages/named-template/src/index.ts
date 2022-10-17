import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import { REGEX_VUE_SFC } from '@vue-macros/common'
import { createCombinePlugin } from 'unplugin-combine'
import { parseVueRequest } from '@vitejs/plugin-vue'
import { transformMainTemplate, transformSubTemplates } from './core'
import { QUERY_NAMED_TEMPLATE, QUERY_TEMPLATE } from './core/constants'
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

export type FileTemplateContext = Record<string, Record<string, string>>

export const PrePlugin = createUnplugin((options: OptionsResolved) => {
  const filter = createFilter(options.include, options.exclude)

  const fileTemplateContext: FileTemplateContext = {}

  const name = 'unplugin-vue-named-template-pre'
  return {
    name,
    enforce: 'pre',

    loadInclude(id) {
      return id.includes(QUERY_TEMPLATE)
    },

    load(id) {
      const { filename, query } = parseVueRequest(id) as any
      return fileTemplateContext[filename][query.name]
    },

    transformInclude(id) {
      return filter(id) || id.includes(QUERY_NAMED_TEMPLATE)
    },

    transform(code, id) {
      try {
        if (id.includes(QUERY_NAMED_TEMPLATE)) {
          const { filename, query } = parseVueRequest(id)
          const { name } = query as any
          const request = `${filename}?vue&type=template&named-template&name=${name}`
          return `import { createTextVNode } from 'vue'
          import { render } from '${request}'
          export default {
            render: (...args) => {
              const r = render(...args)
              return typeof r === 'string' ? createTextVNode(r) : r
            }
          }`
        } else {
          return transformSubTemplates(code, id, fileTemplateContext)
        }
      } catch (err: unknown) {
        this.error(`${name} ${err}`)
      }
    },
  }
})

export const PostPlugin = createUnplugin((options: OptionsResolved) => {
  const filter = createFilter(options.include, options.exclude)

  const name = 'unplugin-vue-named-template-post'
  return {
    name,
    enforce: 'post',

    transformInclude(id) {
      return filter(id)
    },

    transform(code, id) {
      return transformMainTemplate(code, id)
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
