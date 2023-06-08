import {
  MagicString,
  babelParse,
  getLang,
  getTransformResult,
} from '@vue-macros/common'
import {
  type ArrayExpression,
  type ArrowFunctionExpression,
  type BlockStatement,
  type CallExpression,
  type ConditionalExpression,
  type Expression,
  type Identifier,
  type ImportDeclaration,
  type ImportSpecifier,
  type ObjectExpression,
  type ObjectMethod,
  type ObjectProperty,
  type Program,
  type ReturnStatement,
  type SequenceExpression,
  type Statement,
  type VariableDeclaration,
} from '@babel/types'
import { SCOPE_DIRECTIVE, TS_LANG } from './constant'

export * from './constant'

interface ScopeNeededASType {
  importStatement?: ImportDeclaration
  scopeDefineStmt?: VariableDeclaration
  directiveReturn?: ReturnStatement
}

export function transformVScope(code: string, id: string) {
  if (!code.includes(SCOPE_DIRECTIVE)) return

  const lang = getLang(id)
  const program = babelParse(code, lang)
  const s = new MagicString(code)
  const isTs = code.includes(TS_LANG)
  const { importStatement, scopeDefineStmt, directiveReturn } =
    getRenderFunction(program, isTs)

  // fix ImportDeclartion
  fixImportSpecifiers(importStatement!, s)

  // overwrite render function
  s.remove(scopeDefineStmt!.start!, scopeDefineStmt!.end!)
  if (
    directiveReturn!.argument?.type === 'CallExpression' ||
    directiveReturn!.argument?.type === 'SequenceExpression' ||
    directiveReturn!.argument?.type === 'ConditionalExpression'
  ) {
    parseReturn(directiveReturn!.argument, s)
  }

  return getTransformResult(s, id)
}

function parseReturn(
  argStmt: CallExpression | SequenceExpression | ConditionalExpression,
  s: MagicString
) {
  //for CallExpression
  if (argStmt.type === 'CallExpression') {
    parseCallExpReturn(argStmt, s)
  }
  //for SequenceExpression
  if (argStmt.type === 'SequenceExpression') {
    parseSeqReturn(argStmt, s)
  }
  //for ConditionalExpression
  if (argStmt.type === 'ConditionalExpression') {
    parseConditionReturn(argStmt, s)
  }
}

function parseSeqReturn(argStmt: SequenceExpression, s: MagicString) {
  const [isVFor, isArray, targetRetExp] = detectVFor(argStmt)

  //v-for with v-scope
  if (isVFor) {
    const { targetSeqCall, objExp } = getReturnExp(
      targetRetExp as CallExpression
    )

    const key = (objExp.properties[0] as ObjectProperty).key as Identifier
    const changedAllStr = changedScopeStr(targetSeqCall!, objExp, key, s)

    s.remove(targetRetExp!.start!, targetRetExp!.end!)
    s.prependRight(targetRetExp!.start!, changedAllStr)
  }

  //mutli-element
  if (isArray) {
    const targetArr = (targetRetExp as ArrayExpression).elements as Expression[]

    targetArr.forEach((item) => {
      if (
        item.type === 'CallExpression' ||
        item.type === 'SequenceExpression'
      ) {
        parseReturn(item, s)
      }
    })
  }
}

function parseCallExpReturn(argStmt: CallExpression, s: MagicString) {
  if (detectReturnWithDirective(argStmt)) {
    const { targetSeqCall, objExp } = getReturnExp(argStmt)
    const key = (objExp.properties[0] as ObjectProperty).key as Identifier

    const nestedExp = targetSeqCall!.arguments[2]
    if (nestedExp.type === 'ArrayExpression' && nestedScope(nestedExp)) {
      parseReturn(nestedExp.elements[0] as CallExpression, s)
    }

    const changedAllStr = changedScopeStr(targetSeqCall!, objExp, key, s)
    s.remove(argStmt.start!, argStmt.end!)
    s.prependRight(argStmt.start!, changedAllStr)
  }
}

function parseConditionReturn(argStmt: ConditionalExpression, s: MagicString) {
  const consequent = argStmt.consequent
  const alternate = argStmt.alternate
  if (consequent.type === 'CallExpression') {
    parseReturn(consequent, s)
  }
  const isParseAlternate =
    (alternate.type === 'CallExpression' && !detectVIf(alternate)) ||
    alternate.type === 'ConditionalExpression'
  if (isParseAlternate) {
    parseReturn(alternate, s)
  }
}

function detectVIf(dirExp: CallExpression) {
  return (
    dirExp.callee.type === 'Identifier' &&
    dirExp.callee.name === '_createCommentVNode' &&
    dirExp.arguments[0].type === 'StringLiteral' &&
    dirExp.arguments[0].value === 'v-if'
  )
}

function detectVFor(
  stmt: SequenceExpression
): [boolean, boolean, Expression | null | undefined] {
  const targetCallExp = stmt.expressions[1] as CallExpression
  let isVFor = false,
    isArray = false,
    resultExp: Expression | null | undefined

  const targetCallExpArg = targetCallExp.arguments[2]
  if (targetCallExpArg.type === 'ArrayExpression') {
    isArray = true
    resultExp = targetCallExpArg
  } else if (targetCallExpArg.type === 'CallExpression') {
    const vForCallExp = targetCallExpArg.arguments[1] as ArrowFunctionExpression

    const vForBodyBlock = vForCallExp.body as BlockStatement
    const vForBodyRet = vForBodyBlock.body[0] as ReturnStatement
    const vForBodyRetCall = vForBodyRet.argument
    const isLocalVFor =
      targetCallExp.type === 'CallExpression' &&
      targetCallExpArg.type === 'CallExpression' &&
      targetCallExpArg.callee.type === 'Identifier' &&
      targetCallExpArg.callee.name === '_renderList'

    const isVForWithScope =
      vForBodyRetCall?.type === 'CallExpression' &&
      detectReturnWithDirective(vForBodyRetCall)
    isVFor = isLocalVFor && isVForWithScope
    resultExp = vForBodyRetCall
  }
  return [isVFor, isArray, resultExp]
}

function detectReturnWithDirective(exp: CallExpression) {
  const isDir =
    exp.callee.type === 'Identifier' && exp.callee.name === '_withDirectives'
  const scopeArg = exp.arguments[1] as ArrayExpression
  return isDir && isCorrectScopeArg(scopeArg)
}

function getReturnExp(argStmt: CallExpression): {
  targetSeqCall?: CallExpression
  objExp: ObjectExpression
} {
  let targetSeqCall: CallExpression | undefined
  const sequence = argStmt.arguments[0]
  const arrayExp = argStmt.arguments[1] as ArrayExpression
  const objExp = (arrayExp.elements[0] as ArrayExpression)
    .elements[1] as ObjectExpression

  if (sequence.type === 'SequenceExpression') {
    targetSeqCall = sequence.expressions[1] as CallExpression
  } else if (sequence.type === 'CallExpression') {
    targetSeqCall = sequence
  }

  return { targetSeqCall, objExp }
}

function getRenderFunction(program: Program, isTS: boolean): ScopeNeededASType {
  let importStatement: ImportDeclaration | undefined,
    scopeDefineStmt: VariableDeclaration | undefined,
    directiveReturn: ReturnStatement | undefined,
    targetList: Statement[]

  if (!isTS) {
    targetList = program.body.filter(
      (item) =>
        item.type === 'FunctionDeclaration' ||
        item.type === 'VariableDeclaration'
    )
  } else {
    targetList = program.body.filter(
      (item) => item.type === 'ExportDefaultDeclaration'
    )
  }
  const main = targetList.at(-1)!
  if (main.type === 'FunctionDeclaration') {
    importStatement = program.body[1] as ImportDeclaration
    scopeDefineStmt = (main.body as BlockStatement)
      .body[0] as VariableDeclaration
    directiveReturn = (main.body as BlockStatement).body[1] as ReturnStatement
  } else if (main.type === 'VariableDeclaration') {
    importStatement = program.body[0] as ImportDeclaration
    const valueStmt = main.declarations[0].init as ObjectExpression

    const setupStmt = valueStmt.properties[1]
    const setupBlock = (setupStmt as ObjectMethod).body as BlockStatement
    const retStmt = setupBlock.body.at(-1) as ReturnStatement

    const arguStmt = retStmt.argument as ArrowFunctionExpression

    scopeDefineStmt = (arguStmt.body as BlockStatement)
      .body[0] as VariableDeclaration
    directiveReturn = (arguStmt.body as BlockStatement)
      .body[1] as ReturnStatement
  } else if (main.type === 'ExportDefaultDeclaration') {
    importStatement = program.body[1] as ImportDeclaration
    const argStmt = (main.declaration as CallExpression).arguments[0]
    const objMethodStmt = (argStmt as ObjectExpression)
      .properties[1] as ObjectMethod
    const retStmt = (objMethodStmt.body as BlockStatement)
      .body[1] as ReturnStatement
    const blockStmt = (retStmt.argument as ArrowFunctionExpression)
      .body as BlockStatement
    scopeDefineStmt = blockStmt.body[0] as VariableDeclaration
    directiveReturn = blockStmt.body[1] as ReturnStatement
  }

  return { importStatement, scopeDefineStmt, directiveReturn }
}
function changedScopeStr(
  targetSeq: CallExpression,
  arrStr: ObjectExpression,
  key: Identifier,
  s: MagicString
): string {
  const targetSeqStart = targetSeq.start
  const targetSeqEnd = targetSeq.end
  const argStart = arrStr.start
  const argEnd = arrStr.end

  const argStr = s.slice(argStart!, argEnd!)

  const ctxArg = `_ctx.${key.name}`

  const targetSeqStr = s.slice(targetSeqStart!, targetSeqEnd!)

  const changedTarget = targetSeqStr
    .replace(ctxArg, key.name)
    .replace('_createElementBlock', '_createElementVNode')
  const changedStr = `${argStr
    .replace(':', '=')
    .replace('{', '(')
    .replace('}', ')')}=>`

  const changedAllStr = `(${changedStr} ${changedTarget})()`

  return changedAllStr
}

function nestedScope(exp: ArrayExpression) {
  const ele = exp.elements[0]
  return ele && ele.type === 'CallExpression' && detectReturnWithDirective(ele)
}

function isCorrectScopeArg(arg: ArrayExpression) {
  const argElements = arg.elements
  const innerArgElements = (argElements[0] as ArrayExpression).elements
  const isscopeId =
    innerArgElements[0]!.type === 'Identifier' &&
    innerArgElements[0]!.name === '_directive_scope'
  const isScopeArg = innerArgElements[1]?.type === 'ObjectExpression'

  return argElements.length === 1 && isscopeId && isScopeArg
}

function fixImportSpecifiers(
  importStatement: ImportDeclaration,
  s: MagicString
) {
  const notNeedSpecifier = ['withDirectives', 'resolveDirective']
  const origSpecifiers = importStatement.specifiers
  const specifiersFilter = importStatement.specifiers.filter((item) => {
    return (
      item.type === 'ImportSpecifier' &&
      item.imported.type === 'Identifier' &&
      !notNeedSpecifier.includes(item.imported.name)
    )
  }) as ImportSpecifier[]
  let specifiersFilter2Str = specifiersFilter
    .map((item) => s.slice(item.start!, item.end!))
    .join(',')
  const importStart = origSpecifiers[0].start!
  const importEnd = origSpecifiers.at(-1)!.end!

  s.remove(importStart, importEnd)

  if (!specifiersFilter2Str.includes('createElementVNode')) {
    specifiersFilter2Str =
      `${specifiersFilter2Str},` + `createElementVNode as _createElementVNode`
  }

  s.prependRight(importStart!, specifiersFilter2Str)
}
