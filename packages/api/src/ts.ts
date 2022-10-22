import { getStaticKey } from '@vue-macros/common'

import type {
  Node,
  TSCallSignatureDeclaration,
  TSConstructSignatureDeclaration,
  TSInterfaceBody,
  TSMethodSignature,
  TSPropertySignature,
  TSType,
  TSTypeElement,
  TSTypeLiteral,
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

export function resolveTSProperties(node: TSInterfaceBody | TSTypeLiteral) {
  const properties: TSProperties = {
    callSignatures: [],
    constructSignatures: [],
    methods: {},
    properties: {},
  }
  resolveTypeElements(
    properties,
    node.type === 'TSInterfaceBody' ? node.body : node.members
  )
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
    resolved.type === 'TSInterfaceBody' ||
    resolved.type === 'TSTypeLiteral'
  )
    return resolved
  return undefined
}

export function resolveTSReferencedType(
  body: Node[],
  reference: TSType
): Exclude<TSType, 'TSTypeReference'> | TSInterfaceBody | undefined {
  if (reference.type !== 'TSTypeReference') {
    return reference
  } else if (reference.typeName.type !== 'Identifier') {
    return undefined
  }
  const refName = reference.typeName.name
  for (let node of body) {
    if (node.type === 'ExportNamedDeclaration' && node.declaration) {
      node = node.declaration
    }

    if (node.type === 'TSInterfaceDeclaration' && node.id.name === refName) {
      return node.body
    } else if (
      node.type === 'TSTypeAliasDeclaration' &&
      node.id.name === refName
    ) {
      return resolveTSReferencedType(body, node.typeAnnotation)
    }
  }
}
