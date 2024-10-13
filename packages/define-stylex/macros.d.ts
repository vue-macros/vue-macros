export declare const defineStyleX: (typeof import('@stylexjs/stylex'))['create']

type Styles =
  | (
      | null
      | undefined
      | import('@stylexjs/stylex/lib/StyleXTypes').CompiledStyles
    )
  | boolean
  | Readonly<
      [
        import('@stylexjs/stylex/lib/StyleXTypes').CompiledStyles,
        import('@stylexjs/stylex/lib/StyleXTypes').InlineStyles,
      ]
    >

declare module 'vue' {
  interface ComponentCustomProperties {
    vStylex: import('vue').Directive<
      any,
      | ReadonlyArray<
          import('@stylexjs/stylex/lib/StyleXTypes').StyleXArray<Styles>
        >
      | Styles
    >
  }
}
