export const SetupComponentFoo = defineSetupComponent(() => {
  return () => (
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
  )
})
