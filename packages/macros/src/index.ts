import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import { getPackageInfoSync } from 'local-pkg'
import type { FilterPattern } from '@rollup/pluginutils'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  root?: string
  version?: 2 | 3
  defineOptions?: boolean
  defineModel?: boolean
  hoistStatic?: boolean
  setupComponent?: boolean | FilterPattern
}

export type OptionsResolved = Omit<
  Required<Options>,
  'exclude' | 'setupComponent' | 'setupSFC'
> & {
  exclude?: FilterPattern
  setupComponent: false | FilterPattern
}

function resolveOption(options: Options): OptionsResolved {
  let version: 2 | 3 | undefined = options.version
  if (version === undefined) {
    const vuePkg = getPackageInfoSync('vue')
    if (vuePkg) {
      version = +vuePkg.version.slice(0, 1) as 2 | 3
    } else {
      version = 3
    }
  }
  const setupComponent =
    options.setupComponent === false ? false : [/\.[cm]?[jt]sx?/]

  return {
    include: [/\.vue$/],
    defineOptions: true,
    defineModel: true,
    hoistStatic: true,
    root: process.cwd(),
    ...options,
    version,
    setupComponent,
  }
}

const name = 'unplugin-vue-macros'

export default createUnplugin((userOptions: Options = {}) => {
  const options = resolveOption(userOptions)
  const filterSFC = createFilter(options.include, options.exclude)
  const filterSetupComponent = options.setupComponent
    ? createFilter(options.setupComponent)
    : undefined

  return {
    name,

    transformInclude(id) {
      if (filterSetupComponent?.(id)) return true
      return filterSFC(id)
    },

    resolveId: options.setupComponent
      ? (id) => {
          if (SETUP_COMPONENT_ID_REGEX.test(id)) return id
        }
      : undefined,

    load: options.setupComponent
      ? (id) => {
          if (SETUP_COMPONENT_ID_REGEX.test(id))
            return loadSetupComponent(id, setupComponentContext, options.root)
        }
      : undefined,

    transform(code, id) {
      try {
        if (filterSetupComponent?.(id)) {
          return transformSetupComponent(code, id, setupComponentContext)
        }
      } catch (err: unknown) {
        this.error(`${name} ${err}`)
      }
    },

    vite: {
      configResolved(config) {
        options.root = config.root
      },

      handleHotUpdate: filterSetupComponent
        ? (ctx) => {
            if (filterSetupComponent(ctx.file))
              return hotUpdateSetupComponent(ctx, setupComponentContext)
          }
        : undefined,
    },
  }
})
