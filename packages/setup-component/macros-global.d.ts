declare const defineSetupComponent: typeof import('./macros').defineSetupComponent
declare type SetupFC<
  P = {},
  E extends import('vue').EmitsOptions = {}
> = import('./macros').SetupFC<P, E>
