import { FileKind, FileRangeCapabilities } from '@volar/language-core'
import {
  type Segment,
  type Sfc,
  type VueLanguagePlugin,
  replaceSourceRange,
} from '@vue/language-core'

type JsxAttributeNode = {
  attribute: import('typescript/lib/tsserverlibrary').JsxAttribute
  node: import('typescript/lib/tsserverlibrary').Node
  parent?: import('typescript/lib/tsserverlibrary').Node
}

type TransformOptions = {
  codes: Segment<FileRangeCapabilities>[]
  sfc: Sfc
  ts: typeof import('typescript/lib/tsserverlibrary')
  source: 'script' | 'scriptSetup'
}

function transformVIf({
  nodes,
  codes,
  ts,
  sfc,
  source,
}: TransformOptions & { nodes: JsxAttributeNode[] }) {
  nodes.forEach(({ node, attribute, parent }, index) => {
    if (!ts.isIdentifier(attribute.name)) return

    if (
      ['v-if', 'v-else-if'].includes(attribute.name.escapedText!) &&
      attribute.initializer &&
      ts.isJsxExpression(attribute.initializer) &&
      attribute.initializer.expression
    ) {
      const hasScope = parent && attribute.name.escapedText === 'v-if'
      const expressionText = sfc[source]!.content.slice(
        attribute.initializer.expression.pos,
        attribute.initializer.expression.end
      )
      replaceSourceRange(
        codes,
        source,
        node.pos,
        node.pos,
        `${hasScope ? `{` : ' '}`,
        [
          expressionText,
          source,
          attribute.end - expressionText.length - 1,
          FileRangeCapabilities.full,
        ],
        ' ? '
      )

      const nextAttribute = nodes[index + 1]?.attribute
      const nextNodeHasElse =
        nextAttribute && ts.isIdentifier(nextAttribute.name)
          ? `${nextAttribute.name.escapedText}`.startsWith('v-else')
          : false
      replaceSourceRange(
        codes,
        source,
        node.end,
        node.end,
        nextNodeHasElse ? ' : ' : ` : null${parent ? '}' : ''}`
      )
    } else if (attribute.name.escapedText === 'v-else') {
      replaceSourceRange(codes, source, node.end, node.end, parent ? '}' : '')
    }
    replaceSourceRange(codes, source, attribute.pos, attribute.end)
  })
}

function transformVFor({
  nodes,
  codes,
  ts,
  sfc,
  source,
}: TransformOptions & { nodes: JsxAttributeNode[] }) {
  nodes.forEach(({ attribute, node, parent }) => {
    if (
      !(
        attribute.initializer &&
        ts.isJsxExpression(attribute.initializer) &&
        attribute.initializer.expression &&
        ts.isBinaryExpression(attribute.initializer.expression)
      )
    )
      return

    const listText = sfc[source]!.content.slice(
      attribute.initializer.expression.right.pos + 1,
      attribute.initializer.expression.right.end
    )
    const itemText = sfc[source]!.content.slice(
      attribute.initializer.expression.left.pos,
      attribute.initializer.expression.left.end
    )
    replaceSourceRange(
      codes,
      source,
      node.pos,
      node.pos,
      `${parent ? '{' : ' '}`,
      'Array.from(',
      [
        listText,
        source,
        attribute.end - listText.length - 1,
        FileRangeCapabilities.full,
      ],
      ').map(',
      [itemText, source, attribute.pos + 8, FileRangeCapabilities.full],
      ' => '
    )

    replaceSourceRange(
      codes,
      source,
      node.end - 1,
      node.end,
      `>)${parent ? '}' : ''}`
    )
    replaceSourceRange(codes, source, attribute.pos, attribute.end)
  })
}

function transformVSlot({
  nodes,
  codes,
  ts,
  sfc,
  source,
}: TransformOptions & {
  nodes: import('typescript/lib/tsserverlibrary').JsxElement[]
}) {
  nodes.forEach((node) => {
    if (!ts.isIdentifier(node.openingElement.tagName)) return

    const attribute = node.openingElement.attributes.properties.find(
      (attribute) =>
        ts.isJsxAttribute(attribute) &&
        (ts.isJsxNamespacedName(attribute.name)
          ? attribute.name.namespace
          : attribute.name
        ).escapedText === 'v-slot'
    )

    const slots =
      attribute && ts.isJsxAttribute(attribute)
        ? {
            [`${
              ts.isJsxNamespacedName(attribute.name)
                ? attribute.name.name.escapedText
                : 'default'
            }`]: {
              isTemplateTag: false,
              initializer: attribute.initializer,
              children: [...node.children],
            },
          }
        : {}
    if (!attribute) {
      for (const child of node.children) {
        let name = 'default'
        let initializer
        const isTemplateTag =
          ts.isJsxElement(child) &&
          ts.isIdentifier(child.openingElement.tagName) &&
          child.openingElement.tagName.escapedText === 'template'

        if (ts.isJsxElement(child)) {
          for (const attr of child.openingElement.attributes.properties) {
            if (!ts.isJsxAttribute(attr)) continue
            if (isTemplateTag) {
              name = ts.isJsxNamespacedName(attr.name)
                ? `${attr.name.name.escapedText}`
                : 'default'
            }

            if (
              (ts.isJsxNamespacedName(attr.name)
                ? attr.name.namespace
                : attr.name
              ).escapedText === 'v-slot'
            )
              initializer = attr.initializer
          }
        }

        slots[name] ??= {
          isTemplateTag,
          initializer,
          children: [child],
        }
        if (!slots[name].isTemplateTag) {
          slots[name].initializer = initializer
          slots[name].isTemplateTag = isTemplateTag
          if (isTemplateTag) {
            slots[name].children = [child]
          } else {
            slots[name].children.push(child)
          }
        }
      }
    }

    const result = [
      ' v-slots={{',
      ...Object.entries(slots).flatMap(([name, { initializer, children }]) => [
        `'${name}': (`,
        initializer && ts.isJsxExpression(initializer) && initializer.expression
          ? [
              `${sfc[source]!.content.slice(
                initializer.expression.pos,
                initializer.expression.end
              )}`,
              source,
              initializer.expression.pos,
              FileRangeCapabilities.full,
            ]
          : '',
        ') => <>',
        ...children.map((child) => {
          const node =
            ts.isJsxElement(child) &&
            ts.isIdentifier(child.openingElement.tagName) &&
            child.openingElement.tagName.escapedText === 'template'
              ? child.children
              : child
          replaceSourceRange(codes, source, child.pos, child.end)
          return [
            sfc[source]!.content.slice(node.pos, node.end),
            source,
            node.pos,
            FileRangeCapabilities.full,
          ]
        }),
        '</>,',
      ]),
      `} as InstanceType<typeof ${node.openingElement.tagName.escapedText}>['$slots'] }`,
    ] as Segment<FileRangeCapabilities>[]

    if (attribute) {
      replaceSourceRange(codes, source, attribute.pos, attribute.end, ...result)
    } else {
      replaceSourceRange(
        codes,
        source,
        node.openingElement.end - 1,
        node.openingElement.end - 1,
        ...result
      )
    }
  })
}

function transformJsxDirective({ codes, sfc, ts, source }: TransformOptions) {
  const vIfAttributeMap = new Map<any, JsxAttributeNode[]>()
  const vForAttributes: JsxAttributeNode[] = []
  const vSlotNodeSet = new Set<
    import('typescript/lib/tsserverlibrary').JsxElement
  >()
  function walkJsxDirective(
    node: import('typescript/lib/tsserverlibrary').Node,
    parent?: import('typescript/lib/tsserverlibrary').Node
  ) {
    const properties = ts.isJsxElement(node)
      ? node.openingElement.attributes.properties
      : ts.isJsxSelfClosingElement(node)
      ? node.attributes.properties
      : []
    let vIfAttribute
    let vForAttribute
    for (const attribute of properties) {
      if (!ts.isJsxAttribute(attribute)) continue
      if (ts.isIdentifier(attribute.name)) {
        if (
          ['v-if', 'v-else-if', 'v-else'].includes(attribute.name.escapedText!)
        )
          vIfAttribute = attribute
        if (attribute.name.escapedText === 'v-for') vForAttribute = attribute
      }
      if (
        (ts.isJsxNamespacedName(attribute.name)
          ? attribute.name.namespace
          : attribute.name
        ).escapedText === 'v-slot' &&
        ts.isJsxElement(node)
      ) {
        vSlotNodeSet.add(
          ts.isIdentifier(node.openingElement.tagName) &&
            node.openingElement.tagName.escapedText === 'template' &&
            parent &&
            ts.isJsxElement(parent)
            ? parent
            : node
        )
      }
    }
    if (vIfAttribute) {
      if (!vIfAttributeMap.has(parent!)) vIfAttributeMap.set(parent!, [])
      vIfAttributeMap.get(parent!)?.push({
        node,
        attribute: vIfAttribute,
        parent,
      })
    }
    if (vForAttribute) {
      vForAttributes.push({
        node,
        attribute: vForAttribute,
        parent: vIfAttribute ? undefined : parent,
      })
    }

    node.forEachChild((child) => {
      walkJsxDirective(
        child,
        ts.isJsxElement(node) || ts.isJsxFragment(node) ? node : undefined
      )
    })
  }
  sfc[`${source}Ast`]!.forEachChild(walkJsxDirective)

  transformVSlot({ nodes: Array.from(vSlotNodeSet), codes, sfc, ts, source })
  transformVFor({ nodes: vForAttributes, codes, sfc, ts, source })
  vIfAttributeMap.forEach((nodes) =>
    transformVIf({ nodes, codes, sfc, ts, source })
  )
}

const plugin: VueLanguagePlugin = ({ modules: { typescript: ts } }) => {
  return {
    name: 'vue-macros-jsx-directive',
    version: 1,
    resolveEmbeddedFile(fileName, sfc, embeddedFile) {
      if (embeddedFile.kind !== FileKind.TypeScriptHostFile) return

      for (const source of ['script', 'scriptSetup'] as const) {
        if (!/\sv-(if|for|slot)/.test(`${sfc[source]?.content}`)) continue

        transformJsxDirective({
          codes: embeddedFile.content,
          sfc,
          ts,
          source,
        })
      }
    },
  }
}
export default plugin
