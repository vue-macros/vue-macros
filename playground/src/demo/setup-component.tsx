export const SetupComponentFoo = defineSetupComponent(() => {
  defineRender(() => (
    <>
      SetupComponent - Foo{' '}
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
