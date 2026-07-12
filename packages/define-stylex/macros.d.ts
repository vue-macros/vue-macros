export declare const defineStyleX: (typeof import('@stylexjs/stylex'))['create']

type Styles =
  | (null | undefined | import('@stylexjs/stylex').CompiledStyles)
  | boolean
  | Readonly<
      [
        import('@stylexjs/stylex').CompiledStyles,
        import('@stylexjs/stylex').InlineStyles,
      ]
    >

declare module 'vue' {
  interface ComponentCustomProperties {
    vStylex: import('vue').Directive<
      any,
      ReadonlyArray<import('@stylexjs/stylex').StyleXArray<Styles>> | Styles
    >
  }
}
