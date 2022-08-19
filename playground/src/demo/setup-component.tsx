export const SetupComponentFoo = defineSetupComponent(() => {
  defineRender(() => (
    <>
      <p>SetupComponent - Foo</p>
      <button
        onClick={() => {
          // TODO: sourcemap
          debugger
        }}
      >
        Check sourcemap
      </button>
    </>
  ))
})
