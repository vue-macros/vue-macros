declare const defineSetupComponent: typeof import('./macros').defineSetupComponent
declare type SetupFC<
  P = {},
  E extends import('vue').EmitsOptions = {},
  S extends Record<string, any> = any,
> = import('./macros').SetupFC<P, E, S>
