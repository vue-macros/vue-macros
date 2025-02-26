import { parse, type ParserPlugin } from '@babel/parser'
import {
  isFunctionType,
  TS_NODE_TYPES,
  unwrapTSNode,
  walkAST,
} from '@vue-macros/common'
import {
  extractIdentifiers,
  isInDestructureAssignment,
  isReferencedIdentifier,
  isStaticProperty,
  walkFunctionParams,
} from '@vue/compiler-core'
import { genPropsAccessExp, hasOwn, isArray, isString } from '@vue/shared'
import MagicStringAST, { type SourceMap } from 'magic-string'
import type {
  ArrayPattern,
  BlockStatement,
  CallExpression,
  Expression,
  Identifier,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportNamespaceSpecifier,
  ImportSpecifier,
  Node,
  ObjectPattern,
  Program,
  VariableDeclaration,
  VariableDeclarator,
} from '@babel/types'

const CONVERT_SYMBOL = '$'
const ESCAPE_SYMBOL = '$$'
const IMPORT_SOURCES = [
  'vue/macros',
  '@vue-macros/reactivity-transform/macros',
  'unplugin-vue-macros/macros',
]
const shorthands = ['ref', 'computed', 'shallowRef', 'toRef', 'customRef']
const transformCheckRE =
  /\W\$(?:\$|ref|computed|shallowRef|toRef|customRef)?\s*(?:[(<]|as)/

export function shouldTransform(src: string): boolean {
  return transformCheckRE.test(src)
}

interface Binding {
  isConst?: boolean
  isProp?: boolean
}
type Scope = Record<string, Binding | false>

export interface RefTransformOptions {
  filename?: string
  sourceMap?: boolean
  parserPlugins?: ParserPlugin[]
  importHelpersFrom?: string
}

export interface RefTransformResults {
  code: string
  map: SourceMap | null
  rootRefs: string[]
  importedHelpers: string[]
}

export interface ImportBinding {
  local: string
  imported: string
  source: string
  specifier: ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier
}

export function transform(
  src: string,
  {
    filename,
    sourceMap,
    parserPlugins,
    importHelpersFrom = 'vue',
  }: RefTransformOptions = {},
): RefTransformResults {
  const plugins: ParserPlugin[] = parserPlugins || []
  if (filename) {
    if (/\.tsx?$/.test(filename)) {
      plugins.push('typescript')
    }
    if (filename.endsWith('x')) {
      plugins.push('jsx')
    }
  }

  const ast = parse(src, {
    sourceType: 'module',
    plugins,
  })
  const s = new MagicStringAST(src)
  const res = transformAST(ast.program, s, 0)

  // inject helper imports
  if (res.importedHelpers.length > 0) {
    s.prepend(
      `import { ${res.importedHelpers
        .map((h) => `${h} as _${h}`)
        .join(', ')} } from '${importHelpersFrom}'\n`,
    )
  }

  return {
    ...res,
    code: s.toString(),
    map: sourceMap
      ? s.generateMap({
          source: filename,
          hires: true,
          includeContent: true,
        })
      : null,
  }
}

export function transformAST(
  ast: Program,
  s: MagicStringAST,
  offset = 0,
  knownRefs?: string[],
  knownProps?: Record<
    string, // public prop key
    {
      local: string // local identifier, may be different
      default?: any
      isConst?: boolean
    }
  >,
): {
  rootRefs: string[]
  importedHelpers: string[]
} {
  const userImports: Record<string, ImportBinding> = Object.create(null)
  for (const node of ast.body) {
    if (node.type !== 'ImportDeclaration') continue
    walkImportDeclaration(node)
  }

  // macro import handling
  let convertSymbol: string | undefined
  let escapeSymbol: string | undefined
  for (const { local, imported, source, specifier } of Object.values(
    userImports,
  )) {
    if (IMPORT_SOURCES.includes(source)) {
      if (imported === ESCAPE_SYMBOL) {
        escapeSymbol = local
      } else if (imported === CONVERT_SYMBOL) {
        convertSymbol = local
      } else if (imported !== local) {
        error(
          `macro imports for ref-creating methods do not support aliasing.`,
          specifier,
        )
      }
    }
  }

  // default symbol
  if (!convertSymbol && !userImports[CONVERT_SYMBOL]) {
    convertSymbol = CONVERT_SYMBOL
  }
  if (!escapeSymbol && !userImports[ESCAPE_SYMBOL]) {
    escapeSymbol = ESCAPE_SYMBOL
  }

  const importedHelpers = new Set<string>()
  const rootScope: Scope = Object.create(null)
  const scopeStack: Scope[] = [rootScope]
  let currentScope: Scope = rootScope
  let escapeScope: CallExpression | undefined // inside $$()
  const excludedIds = new WeakSet<Identifier>()
  const parentStack: Node[] = []
  const propsLocalToPublicMap: Record<string, string> = Object.create(null)

  if (knownRefs) {
    for (const key of knownRefs) {
      rootScope[key] = Object.create(null)
    }
  }
  if (knownProps) {
    for (const key of Object.keys(knownProps)) {
      const { local, isConst } = knownProps[key]
      rootScope[local] = {
        isProp: true,
        isConst: !!isConst,
      }
      propsLocalToPublicMap[local] = key
    }
  }

  function walkImportDeclaration(node: ImportDeclaration) {
    const source = node.source.value

    if (IMPORT_SOURCES.includes(source)) {
      s.remove(node.start! + offset, node.end! + offset)
    }

    for (const specifier of node.specifiers) {
      const local = specifier.local.name
      const imported =
        (specifier.type === 'ImportSpecifier' &&
          specifier.imported.type === 'Identifier' &&
          specifier.imported.name) ||
        'default'
      userImports[local] = {
        source,
        local,
        imported,
        specifier,
      }
    }
  }

  function isRefCreationCall(callee: string): string | false {
    if (!convertSymbol || getCurrentScope()[convertSymbol] !== undefined) {
      return false
    }
    if (callee === convertSymbol) {
      return convertSymbol
    }
    if (callee[0] === '$' && shorthands.includes(callee.slice(1))) {
      return callee
    }
    return false
  }

  function error(msg: string, node: Node): never {
    const e = new Error(msg)
    ;(e as any).node = node
    throw e
  }

  function helper(msg: string) {
    importedHelpers.add(msg)
    return `_${msg}`
  }

  function getCurrentScope() {
    return scopeStack.reduce((prev, curr) => ({ ...prev, ...curr }), {})
  }

  function registerBinding(id: Identifier, binding?: Binding) {
    excludedIds.add(id)
    if (currentScope) {
      currentScope[id.name] = binding ? binding : false
    } else {
      error(
        'registerBinding called without active scope, something is wrong.',
        id,
      )
    }
  }

  const registerRefBinding = (id: Identifier, isConst = false) =>
    registerBinding(id, { isConst })

  let tempVarCount = 0
  function genTempVar() {
    return `__$temp_${++tempVarCount}`
  }

  function snip(node: Node) {
    return s.original.slice(node.start! + offset, node.end! + offset)
  }

  function findUpParent() {
    return parentStack
      .slice()
      .reverse()
      .find(({ type }) => !TS_NODE_TYPES.includes(type as any))
  }

  function walkScope(node: Program | BlockStatement, isRoot = false) {
    for (const stmt of node.body) {
      if (stmt.type === 'VariableDeclaration') {
        walkVariableDeclaration(stmt, isRoot)
      } else if (
        stmt.type === 'FunctionDeclaration' ||
        stmt.type === 'ClassDeclaration'
      ) {
        if (stmt.declare || !stmt.id) continue
        registerBinding(stmt.id)
      } else if (
        (stmt.type === 'ForOfStatement' || stmt.type === 'ForInStatement') &&
        stmt.left.type === 'VariableDeclaration'
      ) {
        walkVariableDeclaration(stmt.left)
      } else if (
        stmt.type === 'ExportNamedDeclaration' &&
        stmt.declaration &&
        stmt.declaration.type === 'VariableDeclaration'
      ) {
        walkVariableDeclaration(stmt.declaration, isRoot)
      } else if (
        stmt.type === 'LabeledStatement' &&
        stmt.body.type === 'VariableDeclaration'
      ) {
        walkVariableDeclaration(stmt.body, isRoot)
      }
    }
  }

  function walkVariableDeclaration(stmt: VariableDeclaration, isRoot = false) {
    if (stmt.declare) {
      return
    }
    for (const decl of stmt.declarations) {
      let refCall: string | false
      const init = decl.init ? unwrapTSNode(decl.init) : null
      const isCall =
        init &&
        init.type === 'CallExpression' &&
        init.callee.type === 'Identifier'
      if (isCall && (refCall = isRefCreationCall((init.callee as any).name))) {
        processRefDeclaration(
          refCall,
          decl.id,
          decl.init!,
          init,
          stmt.kind === 'const',
        )
      } else {
        const isProps =
          isRoot && isCall && (init.callee as Identifier).name === 'defineProps'
        for (const id of extractIdentifiers(decl.id)) {
          if (isProps) {
            // for defineProps destructure, only exclude them since they
            // are already passed in as knownProps
            excludedIds.add(id)
          } else {
            registerBinding(id)
          }
        }
      }
    }
  }

  function processRefDeclaration(
    method: string,
    id: VariableDeclarator['id'],
    init: Node,
    call: CallExpression,
    isConst: boolean,
  ) {
    excludedIds.add(call.callee as Identifier)
    if (method === convertSymbol) {
      // $
      // remove macro
      s.remove(call.callee.start! + offset, call.callee.end! + offset)
      if (id.type === 'Identifier') {
        // single variable
        registerRefBinding(id, isConst)
      } else if (id.type === 'ObjectPattern') {
        processRefObjectPattern(id, init, isConst)
      } else if (id.type === 'ArrayPattern') {
        processRefArrayPattern(id, init, isConst)
      }

      removeTrailingComma(s, call, offset)
    } else if (id.type === 'Identifier') {
      // shorthands
      registerRefBinding(id, isConst)
      // replace call
      s.overwrite(
        call.start! + offset,
        call.start! + method.length + offset,
        helper(method.slice(1)),
      )
    } else {
      error(`${method}() cannot be used with destructure patterns.`, call)
    }
  }

  function processRefObjectPattern(
    pattern: ObjectPattern,
    value: Node,
    isConst: boolean,
    tempVar?: string,
    path: PathSegment[] = [],
  ) {
    if (!tempVar) {
      tempVar = genTempVar()
      // const { x } = $(useFoo()) --> const __$temp_1 = useFoo()
      s.overwrite(pattern.start! + offset, pattern.end! + offset, tempVar)
    }

    let nameId: Identifier | undefined
    for (const p of pattern.properties) {
      let key: any //TODO: strict type, Expression | string | undefined
      let defaultValue: Expression | undefined
      if (p.type === 'ObjectProperty') {
        if (p.key.start! === p.value.start!) {
          // shorthand { foo }
          nameId = p.key as Identifier
          if (p.value.type === 'Identifier') {
            // avoid shorthand value identifier from being processed
            excludedIds.add(p.value)
          } else if (
            p.value.type === 'AssignmentPattern' &&
            p.value.left.type === 'Identifier'
          ) {
            // { foo = 1 }
            excludedIds.add(p.value.left)
            defaultValue = p.value.right
          }
        } else {
          key = p.computed ? p.key : (p.key as Identifier).name
          if (p.value.type === 'Identifier') {
            // { foo: bar }
            nameId = p.value
          } else if (p.value.type === 'ObjectPattern') {
            processRefObjectPattern(p.value, value, isConst, tempVar, [
              ...path,
              key,
            ])
          } else if (p.value.type === 'ArrayPattern') {
            processRefArrayPattern(p.value, value, isConst, tempVar, [
              ...path,
              key,
            ])
          } else if (p.value.type === 'AssignmentPattern') {
            if (p.value.left.type === 'Identifier') {
              // { foo: bar = 1 }
              nameId = p.value.left
              defaultValue = p.value.right
            } else if (p.value.left.type === 'ObjectPattern') {
              processRefObjectPattern(p.value.left, value, isConst, tempVar, [
                ...path,
                [key, p.value.right],
              ])
            } else if (p.value.left.type === 'ArrayPattern') {
              processRefArrayPattern(p.value.left, value, isConst, tempVar, [
                ...path,
                [key, p.value.right],
              ])
            } else {
              // MemberExpression case is not possible here, ignore
            }
          }
        }
      } else {
        // rest element { ...foo }
        error(`reactivity destructure does not support rest elements.`, p)
      }
      if (nameId) {
        registerRefBinding(nameId, isConst)
        // inject toRef() after original replaced pattern
        const source = pathToString(tempVar, path)
        const keyStr = isString(key)
          ? `'${key}'`
          : key
            ? snip(key)
            : `'${nameId.name}'`
        const defaultStr = defaultValue ? `, ${snip(defaultValue)}` : ``
        s.appendLeft(
          value.end! + offset,
          `,\n  ${nameId.name} = ${helper(
            'toRef',
          )}(${source}, ${keyStr}${defaultStr})`,
        )
      }
    }
    if (nameId) {
      s.appendLeft(value.end! + offset, ';')
    }
  }

  function processRefArrayPattern(
    pattern: ArrayPattern,
    value: Node,
    isConst: boolean,
    tempVar?: string,
    path: PathSegment[] = [],
  ) {
    if (!tempVar) {
      // const [x] = $(useFoo()) --> const __$temp_1 = useFoo()
      tempVar = genTempVar()
      s.overwrite(pattern.start! + offset, pattern.end! + offset, tempVar)
    }

    let nameId: Identifier | undefined
    for (let i = 0; i < pattern.elements.length; i++) {
      const e = pattern.elements[i]
      if (!e) continue
      let defaultValue: Expression | undefined
      if (e.type === 'Identifier') {
        // [a] --> [__a]
        nameId = e
      } else if (e.type === 'AssignmentPattern') {
        // [a = 1]
        nameId = e.left as Identifier
        defaultValue = e.right
      } else if (e.type === 'RestElement') {
        // [...a]
        error(`reactivity destructure does not support rest elements.`, e)
      } else if (e.type === 'ObjectPattern') {
        processRefObjectPattern(e, value, isConst, tempVar, [...path, i])
      } else if (e.type === 'ArrayPattern') {
        processRefArrayPattern(e, value, isConst, tempVar, [...path, i])
      }
      if (nameId) {
        registerRefBinding(nameId, isConst)
        // inject toRef() after original replaced pattern
        const source = pathToString(tempVar, path)
        const defaultStr = defaultValue ? `, ${snip(defaultValue)}` : ``
        s.appendLeft(
          value.end! + offset,
          `,\n  ${nameId.name} = ${helper(
            'toRef',
          )}(${source}, ${i}${defaultStr})`,
        )
      }
    }
    if (nameId) {
      s.appendLeft(value.end! + offset, ';')
    }
  }

  type PathSegmentAtom = Expression | string | number

  type PathSegment =
    | PathSegmentAtom
    | [PathSegmentAtom, Expression /* default value */]

  function pathToString(source: string, path: PathSegment[]): string {
    if (path.length > 0) {
      for (const seg of path) {
        if (isArray(seg)) {
          source = `(${source}${segToString(seg[0])} || ${snip(seg[1])})`
        } else {
          source += segToString(seg)
        }
      }
    }
    return source
  }

  function segToString(seg: PathSegmentAtom): string {
    if (typeof seg === 'number') {
      return `[${seg}]`
    } else if (typeof seg === 'string') {
      return `.${seg}`
    } else {
      return snip(seg)
    }
  }

  function rewriteId(
    scope: Scope,
    id: Identifier,
    parent: Node,
    parentStack: Node[],
  ): boolean {
    if (hasOwn(scope, id.name)) {
      const binding = scope[id.name]

      if (binding) {
        if (
          binding.isConst &&
          ((parent.type === 'AssignmentExpression' && id === parent.left) ||
            parent.type === 'UpdateExpression')
        ) {
          error(`Assignment to constant variable.`, id)
        }

        const { isProp } = binding
        if (isStaticProperty(parent) && parent.shorthand) {
          // let binding used in a property shorthand
          // skip for destructure patterns
          if (
            !(parent as any).inPattern ||
            isInDestructureAssignment(parent, parentStack)
          ) {
            if (isProp) {
              if (escapeScope) {
                // prop binding in $$()
                // { prop } -> { prop: __props_prop }
                registerEscapedPropBinding(id)
                s.appendLeft(
                  id.end! + offset,
                  `: __props_${propsLocalToPublicMap[id.name]}`,
                )
              } else {
                // { prop } -> { prop: __props.prop }
                s.appendLeft(
                  id.end! + offset,
                  `: ${genPropsAccessExp(propsLocalToPublicMap[id.name])}`,
                )
              }
            } else {
              // { foo } -> { foo: foo.value }
              s.appendLeft(id.end! + offset, `: ${id.name}.value`)
            }
          }
        } else if (isProp) {
          if (escapeScope) {
            // x --> __props_x
            registerEscapedPropBinding(id)
            s.overwrite(
              id.start! + offset,
              id.end! + offset,
              `__props_${propsLocalToPublicMap[id.name]}`,
            )
          } else {
            // x --> __props.x
            s.overwrite(
              id.start! + offset,
              id.end! + offset,
              genPropsAccessExp(propsLocalToPublicMap[id.name]),
            )
          }
        } else {
          // x --> x.value
          s.appendLeft(id.end! + offset, '.value')
        }
      }
      return true
    }
    return false
  }

  const propBindingRefs: Record<string, true> = {}
  function registerEscapedPropBinding(id: Identifier) {
    if (!Object.prototype.hasOwnProperty.call(propBindingRefs, id.name)) {
      propBindingRefs[id.name] = true
      const publicKey = propsLocalToPublicMap[id.name]
      s.prependRight(
        offset,
        `const __props_${publicKey} = ${helper(
          `toRef`,
        )}(__props, '${publicKey}');\n`,
      )
    }
  }

  // check root scope first
  walkScope(ast, true)
  walkAST<Node>(ast, {
    enter(node, parent) {
      parent && parentStack.push(parent)

      // function scopes
      if (isFunctionType(node)) {
        scopeStack.push((currentScope = Object.create(null)))
        walkFunctionParams(node, registerBinding)
        if (node.body.type === 'BlockStatement') {
          walkScope(node.body)
        }
        return
      }

      // catch param
      if (node.type === 'CatchClause') {
        scopeStack.push((currentScope = Object.create(null)))
        if (node.param && node.param.type === 'Identifier') {
          registerBinding(node.param)
        }
        walkScope(node.body)
        return
      }

      // non-function block scopes
      if (node.type === 'BlockStatement' && !isFunctionType(parent!)) {
        scopeStack.push((currentScope = Object.create(null)))
        walkScope(node)
        return
      }

      // skip type nodes
      if (
        parent &&
        parent.type.startsWith('TS') &&
        !TS_NODE_TYPES.includes(parent.type as any)
      ) {
        return this.skip()
      }

      if (node.type === 'Identifier') {
        const binding = rootScope[node.name]
        if (
          // if inside $$(), skip unless this is a destructured prop binding
          (!escapeScope || (binding && binding.isProp)) &&
          isReferencedIdentifier(node, parent!, parentStack) &&
          !excludedIds.has(node)
        ) {
          // walk up the scope chain to check if id should be appended .value
          let i = scopeStack.length
          while (i--) {
            if (rewriteId(scopeStack[i], node, parent!, parentStack)) {
              return
            }
          }
        }
      }

      if (node.type === 'CallExpression' && node.callee.type === 'Identifier') {
        const callee = node.callee.name

        const refCall = isRefCreationCall(callee)
        const parent = findUpParent()
        if (refCall && (!parent || parent.type !== 'VariableDeclarator')) {
          return error(
            `${refCall} can only be used as the initializer of ` +
              `a variable declaration.`,
            node,
          )
        }

        if (
          escapeSymbol &&
          getCurrentScope()[escapeSymbol] === undefined &&
          callee === escapeSymbol
        ) {
          escapeScope = node
          s.remove(node.callee.start! + offset, node.callee.end! + offset)
          removeTrailingComma(s, node, offset)

          if (parent?.type === 'ExpressionStatement') {
            // edge case where the call expression is an expression statement
            // if its own - prepend semicolon to avoid it being parsed as
            // function invocation of previous line
            let i =
              (node.leadingComments
                ? node.leadingComments[0].start
                : node.start)! + offset
            while (i--) {
              const char = s.original.charAt(i)
              if (char === '\n') {
                // only insert semi if it's actually the first thing after
                // newline
                s.prependRight(node.start! + offset, ';')
                break
              } else if (!/\s/.test(char)) {
                break
              }
            }
          }
        }
      }
    },
    leave(node, parent) {
      parent && parentStack.pop()
      if (
        (node.type === 'BlockStatement' && !isFunctionType(parent!)) ||
        isFunctionType(node) ||
        node.type === 'CatchClause'
      ) {
        scopeStack.pop()
        currentScope = scopeStack.at(-1)!
      }
      if (node === escapeScope) {
        escapeScope = undefined
      }
    },
  })

  return {
    rootRefs: Object.keys(rootScope).filter((key) => {
      const binding = rootScope[key]
      return binding && !binding.isProp
    }),
    importedHelpers: [...importedHelpers],
  }
}

function removeTrailingComma(
  s: MagicStringAST,
  node: CallExpression,
  offset: number,
) {
  if (typeof node.extra?.trailingComma === 'number') {
    s.remove(
      node.extra?.trailingComma + offset,
      node.extra?.trailingComma + offset + 1,
    )
  }
}
