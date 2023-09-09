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

    let index
    let objectIndex
    let item = attribute.initializer.expression.left
    const list = attribute.initializer.expression.right
    if (
      ts.isParenthesizedExpression(item) &&
      ts.isBinaryExpression(item.expression)
    ) {
      if (ts.isBinaryExpression(item.expression.left)) {
        index = item.expression.left.right
        objectIndex = item.expression.right
        item = item.expression.left.left
      } else {
        index = item.expression.right
        item = item.expression.left
      }
    }
    if (!item || !list) return

    replaceSourceRange(
      codes,
      source,
      node.pos,
      node.pos,
      `${parent ? '{' : ' '}`,
      '__VLS_getVForSourceType(',
      [
        sfc[source]!.content.slice(list.pos + 1, list.end),
        source,
        list.pos + 1,
        FileRangeCapabilities.full,
      ],
      ').map(([',
      [
        `${sfc[source]?.content.slice(item.pos, item.end)}`,
        source,
        item.pos,
        FileRangeCapabilities.full,
      ],
      index
        ? [
            `, ${sfc[source]?.content.slice(index.pos + 1, index.end)}`,
            source,
            index.pos - 1,
            FileRangeCapabilities.full,
          ]
        : objectIndex
        ? ', undefined'
        : '',
      objectIndex
        ? [
            `, ${sfc[source]?.content.slice(
              objectIndex.pos + 1,
              objectIndex.end
            )}`,
            source,
            objectIndex.pos - 1,
            FileRangeCapabilities.full,
          ]
        : '',
      ']) => '
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
  if (nodes.length === 0) return
  codes.push(`type __VLS_getSlots<T> = T extends new (...args: any) => any
  ? InstanceType<T>['$slots']
  : T extends (props: any, ctx: infer Ctx) => any
  ? Ctx['slots']
  : any`)

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

    const slotMap = new Map(
      attribute && ts.isJsxAttribute(attribute)
        ? [
            [
              ts.isJsxNamespacedName(attribute.name)
                ? attribute.name.name
                : undefined,
              {
                isTemplateTag: false,
                initializer: attribute.initializer,
                children: [...node.children],
              },
            ],
          ]
        : []
    )
    if (!attribute) {
      for (const child of node.children) {
        let name
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
                ? attr.name.name
                : undefined
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

        if (!slotMap.get(name)) {
          slotMap.set(name, {
            isTemplateTag,
            initializer,
            children: [child],
          })
        }
        const slot = slotMap.get(name)!
        if (slot && !slot?.isTemplateTag) {
          slot.initializer = initializer
          slot.isTemplateTag = isTemplateTag
          if (isTemplateTag) {
            slot.children = [child]
          } else {
            slot.children.push(child)
          }
        }
      }
    }

    const result = [
      ' v-slots={{',
      ...Array.from(slotMap.entries()).flatMap(
        ([name, { initializer, children }]) => [
          name
            ? [
                `'${name.escapedText}'`,
                source,
                name.pos - 1,
                FileRangeCapabilities.full,
              ]
            : 'default',
          `: (`,
          initializer &&
          ts.isJsxExpression(initializer) &&
          initializer.expression
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
        ]
      ),
      `} as __VLS_getSlots<typeof ${node.openingElement.tagName.escapedText}> }`,
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

function transformVModel({
  nodes,
  codes,
  ts,
  sfc,
  source,
}: TransformOptions & { nodes: JsxAttributeNode[] }) {
  nodes.forEach(({ attribute }) => {
    const start = attribute.getStart(sfc[`${source}Ast`])
    let end = start + 7
    let name = 'modelValue'

    if (ts.isJsxNamespacedName(attribute.name)) {
      name = attribute.name.name.getText(sfc[`${source}Ast`])
      end += 1 + name.length
    }

    replaceSourceRange(codes, source, start, end, `onUpdate:${name} `, name)
  })
}

function transformJsxDirective({ codes, sfc, ts, source }: TransformOptions) {
  const vIfAttributeMap = new Map<any, JsxAttributeNode[]>()
  const vForAttributes: JsxAttributeNode[] = []
  const vSlotNodeSet = new Set<
    import('typescript/lib/tsserverlibrary').JsxElement
  >()
  const vModelAttributes: JsxAttributeNode[] = []

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
    let vModelAttribute

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
      if (
        /^v-model(_.*)?$/.test(
          (ts.isJsxNamespacedName(attribute.name)
            ? attribute.name.namespace
            : attribute.name
          ).getText(sfc[`${source}Ast`])
        )
      ) {
        vModelAttribute = attribute
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
    if (vModelAttribute) {
      vModelAttributes.push({
        node,
        attribute: vModelAttribute,
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
  transformVModel({ nodes: vModelAttributes, codes, sfc, ts, source })
}

const plugin: VueLanguagePlugin = ({ modules: { typescript: ts } }) => {
  return {
    name: 'vue-macros-jsx-directive',
    version: 1,
    resolveEmbeddedFile(fileName, sfc, embeddedFile) {
      if (embeddedFile.kind !== FileKind.TypeScriptHostFile) return

      for (const source of ['script', 'scriptSetup'] as const) {
        if (!/\sv-(if|for|slot|model)/.test(`${sfc[source]?.content}`)) continue

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
