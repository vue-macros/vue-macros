import {
  parse,
  type SFCDescriptor,
  type SFCParseResult,
  type SFCScriptBlock as SFCScriptBlockMixed,
} from '@vue/compiler-sfc'
import { babelParse, getLang, resolveString } from 'ast-kit'
import { REGEX_VUE_SFC } from './constants'
import type { Node, Program } from '@babel/types'
import type { MagicString, MagicStringAST } from 'magic-string-ast'

export type SFCScriptBlock = Omit<
  SFCScriptBlockMixed,
  'scriptAst' | 'scriptSetupAst'
>

export type SFC = Omit<SFCDescriptor, 'script' | 'scriptSetup'> & {
  sfc: SFCParseResult
  script?: SFCScriptBlock | null
  scriptSetup?: SFCScriptBlock | null
  lang: string | undefined
  getScriptAst: () => Program | undefined
  getSetupAst: () => Program | undefined
  offset: number
} & Pick<SFCParseResult, 'errors'>

export function parseSFC(code: string, id: string): SFC {
  const sfc = parse(code, {
    filename: id,
  })
  const { descriptor, errors } = sfc

  const scriptLang = sfc.descriptor.script?.lang
  const scriptSetupLang = sfc.descriptor.scriptSetup?.lang

  if (
    sfc.descriptor.script &&
    sfc.descriptor.scriptSetup &&
    (scriptLang || 'js') !== (scriptSetupLang || 'js')
  ) {
    throw new Error(
      `[vue-macros] <script> and <script setup> must have the same language type.`,
    )
  }

  const lang = scriptLang || scriptSetupLang

  return Object.assign({}, descriptor, {
    sfc,
    lang,
    errors,
    offset: descriptor.scriptSetup?.loc.start.offset ?? 0,
    getSetupAst() {
      if (!descriptor.scriptSetup) return
      return babelParse(descriptor.scriptSetup.content, lang, {
        plugins: [['importAttributes', { deprecatedAssertSyntax: true }]],
        cache: true,
      })
    },
    getScriptAst() {
      if (!descriptor.script) return
      return babelParse(descriptor.script.content, lang, {
        plugins: [['importAttributes', { deprecatedAssertSyntax: true }]],
        cache: true,
      })
    },
  } satisfies Partial<SFC>)
}

export function getFileCodeAndLang(
  code: string,
  id: string,
): { code: string; lang: string } {
  if (!REGEX_VUE_SFC.test(id)) {
    return {
      code,
      lang: getLang(id),
    }
  }

  const sfc = parseSFC(code, id)
  const scriptCode = sfc.script?.content ?? ''
  return {
    code: sfc.scriptSetup
      ? `${scriptCode}\n;\n${sfc.scriptSetup.content}`
      : scriptCode,
    lang: sfc.lang ?? 'js',
  }
}

export function addNormalScript({ script, lang }: SFC, s: MagicString) {
  return {
    start(): number {
      if (script) return script.loc.end.offset

      const attrs = lang ? ` lang="${lang}"` : ''
      s.prependLeft(0, `<script${attrs}>`)
      return 0
    },

    end(): void {
      if (!script) s.appendRight(0, `\n</script>\n`)
    },
  }
}

export function removeMacroImport(
  node: Node,
  s: MagicStringAST,
  offset: number,
): true | undefined {
  if (
    node.type === 'ImportDeclaration' &&
    node.attributes?.some(
      (attr) =>
        resolveString(attr.key) === 'type' && attr.value.value === 'macro',
    )
  ) {
    s.removeNode(node, { offset })
    return true
  }
}
