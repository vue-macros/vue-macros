import type { defineRender as _defineRender } from './vue2-macros'

declare global {
  const defineRender: typeof _defineRender
}

export {}
