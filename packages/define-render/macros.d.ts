import type { VNodeChild } from 'vue'

export declare function defineRender(
  render: JSX.Element | (() => JSX.Element | VNodeChild),
): void
