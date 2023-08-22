import {
  MagicString,
  babelParse,
  generateTransform,
  getLang,
} from '@vue-macros/common'
import { SCOPE_DIRECTIVE, TS_LANG } from './constant'
import type * as t from '@babel/types'

export function transformVScope(code: string, id: string) {
  if (!SCOPE_DIRECTIVE.test(code)) return

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

  return generateTransform(s, id)
}

function parseReturn(
  argStmt: t.CallExpression | t.SequenceExpression | t.ConditionalExpression,
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

function parseSeqReturn(argStmt: t.SequenceExpression, s: MagicString) {
  const [isVFor, isArray, targetRetExp] = detectVFor(argStmt)

  //v-for with v-scope
  if (isVFor) {
    const { targetSeqCall, objExp } = getReturnExp(
      targetRetExp as t.CallExpression
    )

    const key = (objExp.properties[0] as t.ObjectProperty).key as t.Identifier
    const changedAllStr = changedScopeStr(targetSeqCall!, objExp, key, s)

    s.remove(targetRetExp!.start!, targetRetExp!.end!)
    s.prependRight(targetRetExp!.start!, changedAllStr)
  }

  //mutli-element
  if (isArray) {
    const targetArr = (targetRetExp as t.ArrayExpression)
      .elements as t.Expression[]

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

function parseCallExpReturn(argStmt: t.CallExpression, s: MagicString) {
  if (detectReturnWithDirective(argStmt)) {
    const { targetSeqCall, objExp } = getReturnExp(argStmt)
    const key = (objExp.properties[0] as t.ObjectProperty).key as t.Identifier

    const nestedExp = targetSeqCall!.arguments[2]
    if (nestedExp.type === 'ArrayExpression' && nestedScope(nestedExp)) {
      parseReturn(nestedExp.elements[0] as t.CallExpression, s)
    }

    const changedAllStr = changedScopeStr(targetSeqCall!, objExp, key, s)
    s.remove(argStmt.start!, argStmt.end!)
    s.prependRight(argStmt.start!, changedAllStr)
  }
}

function parseConditionReturn(
  argStmt: t.ConditionalExpression,
  s: MagicString
) {
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

function detectVIf(dirExp: t.CallExpression) {
  return (
    dirExp.callee.type === 'Identifier' &&
    dirExp.callee.name === '_createCommentVNode' &&
    dirExp.arguments[0].type === 'StringLiteral' &&
    dirExp.arguments[0].value === 'v-if'
  )
}

function detectVFor(
  stmt: t.SequenceExpression
): [boolean, boolean, t.Expression | null | undefined] {
  const targetCallExp = stmt.expressions[1] as t.CallExpression
  let isVFor = false,
    isArray = false,
    resultExp: t.Expression | null | undefined

  const targetCallExpArg = targetCallExp.arguments[2]
  if (targetCallExpArg.type === 'ArrayExpression') {
    isArray = true
    resultExp = targetCallExpArg
  } else if (targetCallExpArg.type === 'CallExpression') {
    const vForCallExp = targetCallExpArg
      .arguments[1] as t.ArrowFunctionExpression

    const vForBodyBlock = vForCallExp.body as t.BlockStatement
    const vForBodyRet = vForBodyBlock.body[0] as t.ReturnStatement
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

function detectReturnWithDirective(exp: t.CallExpression) {
  const isDir =
    exp.callee.type === 'Identifier' && exp.callee.name === '_withDirectives'
  const scopeArg = exp.arguments[1] as t.ArrayExpression
  return isDir && isCorrectScopeArg(scopeArg)
}

function getReturnExp(argStmt: t.CallExpression): {
  targetSeqCall?: t.CallExpression
  objExp: t.ObjectExpression
} {
  let targetSeqCall: t.CallExpression | undefined
  const sequence = argStmt.arguments[0]
  const arrayExp = argStmt.arguments[1] as t.ArrayExpression
  const objExp = (arrayExp.elements[0] as t.ArrayExpression)
    .elements[1] as t.ObjectExpression

  if (sequence.type === 'SequenceExpression') {
    targetSeqCall = sequence.expressions[1] as t.CallExpression
  } else if (sequence.type === 'CallExpression') {
    targetSeqCall = sequence
  }

  return { targetSeqCall, objExp }
}

function getRenderFunction(program: t.Program, isTS: boolean) {
  let importStatement: t.ImportDeclaration | undefined,
    scopeDefineStmt: t.VariableDeclaration | undefined,
    directiveReturn: t.ReturnStatement | undefined,
    targetList: t.Statement[]

  if (isTS) {
    targetList = program.body.filter(
      (item) => item.type === 'ExportDefaultDeclaration'
    )
  } else {
    targetList = program.body.filter(
      (item) =>
        item.type === 'FunctionDeclaration' ||
        item.type === 'VariableDeclaration'
    )
  }
  const main = targetList.at(-1)!
  if (main.type === 'FunctionDeclaration') {
    importStatement = program.body[1] as t.ImportDeclaration
    scopeDefineStmt = (main.body as t.BlockStatement)
      .body[0] as t.VariableDeclaration
    directiveReturn = (main.body as t.BlockStatement)
      .body[1] as t.ReturnStatement
  } else if (main.type === 'VariableDeclaration') {
    importStatement = program.body[0] as t.ImportDeclaration
    const valueStmt = main.declarations[0].init as t.ObjectExpression

    const setupStmt = valueStmt.properties[1] as t.ObjectMethod
    const setupBlock = setupStmt.body as t.BlockStatement
    const retStmt = setupBlock.body.at(-1) as t.ReturnStatement

    const arguStmt = retStmt.argument as t.ArrowFunctionExpression

    scopeDefineStmt = (arguStmt.body as t.BlockStatement)
      .body[0] as t.VariableDeclaration
    directiveReturn = (arguStmt.body as t.BlockStatement)
      .body[1] as t.ReturnStatement
  } else if (main.type === 'ExportDefaultDeclaration') {
    importStatement = program.body[1] as t.ImportDeclaration
    const argStmt = (main.declaration as t.CallExpression).arguments[0]
    const objMethodStmt = (argStmt as t.ObjectExpression)
      .properties[1] as t.ObjectMethod
    const retStmt = (objMethodStmt.body as t.BlockStatement)
      .body[1] as t.ReturnStatement
    const blockStmt = (retStmt.argument as t.ArrowFunctionExpression)
      .body as t.BlockStatement
    scopeDefineStmt = blockStmt.body[0] as t.VariableDeclaration
    directiveReturn = blockStmt.body[1] as t.ReturnStatement
  }

  return { importStatement, scopeDefineStmt, directiveReturn }
}

function changedScopeStr(
  targetSeq: t.CallExpression,
  arrStr: t.ObjectExpression,
  key: t.Identifier,
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

function nestedScope(exp: t.ArrayExpression) {
  const ele = exp.elements[0]
  return ele && ele.type === 'CallExpression' && detectReturnWithDirective(ele)
}

function isCorrectScopeArg(arg: t.ArrayExpression) {
  const argElements = arg.elements
  const innerArgElements = (argElements[0] as t.ArrayExpression).elements
  const isscopeId =
    innerArgElements[0]!.type === 'Identifier' &&
    innerArgElements[0]!.name === '_directive_scope'
  const isScopeArg = innerArgElements[1]?.type === 'ObjectExpression'

  return argElements.length === 1 && isscopeId && isScopeArg
}

function fixImportSpecifiers(
  importStatement: t.ImportDeclaration,
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
  }) as t.ImportSpecifier[]
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
