import type { VNode } from 'vue'

export declare function defineRender(
  render: JSX.Element | (() => JSX.Element | VNode | null)
): void
