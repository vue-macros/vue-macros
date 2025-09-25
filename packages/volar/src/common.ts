import path from 'node:path'
import process from 'node:process'
import {
  resolveOptions,
  type FeatureName,
  type OptionsResolved,
} from '@vue-macros/config'
import { replace, replaceAll, type Code } from 'ts-macro'
import type { SFCScriptBlock } from '@vue-macros/common'
import type { VueLanguagePlugin } from '@vue/language-core'

export const REGEX_DEFINE_COMPONENT: RegExp =
  /(?<=(?:__VLS_|\(await import\(\S+\)\)\.)defineComponent\(\{\n)/g

export function addProps(
  codes: Code[],
  decl: Code[],
  version: number,
): true | undefined {
  const codeString = codes.toString()
  if (!decl.length) return

  replace(
    codes,
    /(?<=type __VLS_PublicProps = )/,
    `{\n${decl.join(',\n')}\n} & `,
  )

  if (
    !codeString.includes(
      version >= 3.5
        ? '__typeProps: '
        : 'props: ,{} as __VLS_TypePropsToOption',
    )
  ) {
    replaceAll(
      codes,
      REGEX_DEFINE_COMPONENT,
      version >= 3.5
        ? '__typeProps: {} as __VLS_PublicProps,\n'
        : 'props: {} as __VLS_TypePropsToOption<__VLS_PublicProps>,\n',
    )

    if (version < 3.5 && !codeString.includes('type __VLS_NonUndefinedable')) {
      codes.push(
        `type __VLS_NonUndefinedable<T> = T extends undefined ? never : T;\n`,
        `type __VLS_TypePropsToOption<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? { type: import('vue').PropType<__VLS_NonUndefinedable<T[K]>> } : { type: import('vue').PropType<T[K]>, required: true } };\n`,
      )
    }
  }

  return true
}

export function addEmits(
  codes: Code[],
  decl: Code[],
  version: number,
): true | undefined {
  const codeString = codes.toString()
  if (!decl.length) return

  const index = codes.findIndex((code) =>
    code.toString().startsWith('type __VLS_Emit = '),
  )
  const result = decl.join(',\n')
  const modelIndex = codes.findIndex((code) =>
    code.toString().includes('type __VLS_ModelEmit = '),
  )
  if (modelIndex !== -1) {
    codes.splice(modelIndex + 1, 0, ` ${result} , `)
  }
  if (index === -1) {
    const propsIndex = codes.findIndex((code) =>
      code.toString().includes('type __VLS_PublicProps = '),
    )
    codes.splice(
      propsIndex,
      0,
      ...(version < 3.5
        ? [
            `const __VLS_emit = (await import('vue')).defineEmits<{\n${result}\n}>();\n`,
            `type __VLS_Emit = typeof __VLS_emit;;\n`,
          ]
        : [`type __VLS_Emit = {\n${result}\n};\n`]),
    )
  } else if (modelIndex === -1) {
    codes.splice(index + 2, 0, ` & {\n${result}}\n`)
  }

  if (version >= 3.5) {
    if (!codeString.includes('__typeEmits: {} as ')) {
      replaceAll(
        codes,
        REGEX_DEFINE_COMPONENT,
        '__typeEmits: {} as __VLS_Emit,\n',
      )
    }
  } else if (!codeString.includes('{} as __VLS_NormalizeEmits<typeof __VLS')) {
    replaceAll(
      codes,
      REGEX_DEFINE_COMPONENT,
      'emits: {} as __VLS_NormalizeEmits<__VLS_Emit>,\n',
    )
  }

  return true
}

export function addCode(codes: Code[], ...args: Code[]): void {
  const index = codes.findIndex((code) =>
    code.includes('__VLS_setup = (async () => {'),
  )
  codes.splice(index !== -1 ? index + 1 : codes.length, 0, ...args)
}

export type VueMacrosPlugin<K extends FeatureName> = (
  ctx: PluginContext,
  options?: OptionsResolved[K],
) => ReturnType<VueLanguagePlugin>

export type PluginContext = Parameters<VueLanguagePlugin>[0]

const resolvedOptions: Map<string, OptionsResolved> = new Map()

export function getVolarOptions<K extends keyof OptionsResolved>(
  context: PluginContext,
  key: K,
): OptionsResolved[K] {
  const configPath = context.compilerOptions.configFilePath
  const root =
    typeof configPath === 'string' ? path.dirname(configPath) : process.cwd()
  let resolved: OptionsResolved | undefined
  if (!resolvedOptions.has(root)) {
    resolved = resolveOptions.sync(context.vueCompilerOptions.vueMacros, root)
    resolvedOptions.set(root, resolved)
  }

  return (resolved || resolvedOptions.get(root)!)[key]
}

export function patchSFC(block: SFCScriptBlock | null, offset: number): void {
  if (block) {
    block.loc.start.column -= offset
    block.loc.start.offset -= offset
    block.loc.end.offset -= offset
    if (block.loc.end.line === block.loc.start.line) {
      block.loc.end.column -= offset
    }
  }
}
