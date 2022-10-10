import type { EmitsOptions } from 'vue'

declare global {
  const defineSetupComponent: typeof import('./macros').defineSetupComponent
  type SetupFC<
    P = {},
    E extends EmitsOptions = {}
  > = import('./macros').SetupFC<P, E>
}

export {}
