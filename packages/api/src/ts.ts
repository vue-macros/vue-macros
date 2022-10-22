import { getStaticKey } from '@vue-macros/common'

import type {
  Identifier,
  Node,
  TSCallSignatureDeclaration,
  TSConstructSignatureDeclaration,
  TSInterfaceDeclaration,
  TSMethodSignature,
  TSPropertySignature,
  TSType,
  TSTypeElement,
  TSTypeLiteral,
  TSTypeReference,
} from '@babel/types'

export interface TSProperties {
  callSignatures: TSCallSignatureDeclaration[]
  constructSignatures: TSConstructSignatureDeclaration[]
  methods: Record<string | number, Array<TSMethodSignature>>
  properties: Record<
    string | number,
    { value: TSType | null; optional: boolean; signature: TSPropertySignature }
  >
}

export function mergeTSProperties(
  a: TSProperties,
  b: TSProperties
): TSProperties {
  return {
    callSignatures: [...a.callSignatures, ...b.callSignatures],
    constructSignatures: [...a.constructSignatures, ...b.constructSignatures],
    methods: { ...a.methods, ...b.methods },
    properties: { ...a.properties, ...b.properties },
  }
}

export function resolveTSProperties(
  body: Node[],
  node: TSInterfaceDeclaration | TSTypeLiteral
) {
  let properties: TSProperties = {
    callSignatures: [],
    constructSignatures: [],
    methods: {},
    properties: {},
  }
  if (node.type === 'TSInterfaceDeclaration') {
    resolveTypeElements(properties, node.body.body)
    if (node.extends) {
      const ext = node.extends
        .map((node) =>
          node.expression.type === 'Identifier'
            ? resolveTSReferencedType(body, node.expression)
            : undefined
        )
        .filter(
          (node): node is TSInterfaceDeclaration | TSTypeLiteral =>
            node?.type === 'TSInterfaceDeclaration' ||
            node?.type === 'TSTypeLiteral'
        )
        .map((node) => resolveTSProperties(body, node))
        .reduceRight((accu, curr) => mergeTSProperties(accu, curr))
      properties = mergeTSProperties(ext, properties)
    }
  } else {
    resolveTypeElements(properties, node.members)
  }
  return properties
}

export function resolveTypeElements(
  properties: TSProperties,
  elements: Array<TSTypeElement>
) {
  const getKey = (element: TSMethodSignature | TSPropertySignature) => {
    try {
      return getStaticKey(element.key, element.computed, false)
    } catch {}
  }
  for (const element of elements) {
    switch (element.type) {
      case 'TSCallSignatureDeclaration':
        properties.callSignatures.push(element)
        break
      case 'TSConstructSignatureDeclaration':
        properties.constructSignatures.push(element)
        break
      case 'TSMethodSignature': {
        const key = getKey(element)
        if (!key) continue

        // cannot overwrite if already exists
        if (properties.properties[key]) continue

        if (!properties.methods[key]) properties.methods[key] = []
        if (element.typeAnnotation) {
          properties.methods[key].push(element)
        }
        break
      }
      case 'TSPropertySignature': {
        const key = getKey(element)
        if (!key) continue

        if (!properties.properties[key] && !properties.methods[key])
          // cannot be override
          properties.properties[key] = {
            value: element.typeAnnotation?.typeAnnotation ?? null,
            optional: !!element.optional,
            signature: element,
          }
        break
      }
      case 'TSIndexSignature':
        // unsupported
        break
    }
  }
}

export function resolveTSReferencedDecl(body: Node[], reference: TSType) {
  const resolved = resolveTSReferencedType(body, reference)
  if (!resolved) return
  else if (
    resolved.type === 'TSInterfaceDeclaration' ||
    resolved.type === 'TSTypeLiteral'
  )
    return resolved
  return undefined
}

export function resolveTSReferencedType(
  body: Node[],
  reference: TSType | Identifier
): Exclude<TSType, TSTypeReference> | TSInterfaceDeclaration | undefined {
  if (reference.type !== 'TSTypeReference' && reference.type !== 'Identifier')
    return reference

  let refName: string
  if (reference.type === 'Identifier') {
    refName = reference.name
  } else {
    if (reference.typeName.type !== 'Identifier') return undefined
    refName = reference.typeName.name
  }

  for (let node of body) {
    if (node.type === 'ExportNamedDeclaration' && node.declaration) {
      node = node.declaration
    }

    if (node.type === 'TSInterfaceDeclaration' && node.id.name === refName) {
      return node
    } else if (
      node.type === 'TSTypeAliasDeclaration' &&
      node.id.name === refName
    ) {
      return resolveTSReferencedType(body, node.typeAnnotation)
    }
  }
}
