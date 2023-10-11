import type { EmitsOptions, FunctionalComponent } from 'vue'

export declare const defineSetupComponent: <T extends FunctionalComponent>(
  fn: T
) => T

export declare type SetupFC<
  P = {},
  E extends EmitsOptions = {},
> = FunctionalComponent<P, E>
