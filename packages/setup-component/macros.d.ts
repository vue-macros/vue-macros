import type { EmitsOptions, FunctionalComponent } from 'vue'

export declare const defineSetupComponent: <T extends FunctionalComponent>(
  fn: T
) => T

export declare type SetupFC<
  P = {},
  E extends EmitsOptions = {},
  S extends Record<string, any> = any,
> = FunctionalComponent<P, E, S>
