<script setup lang="ts">
export const foo: string = 'foo',
  bar = 10
export let baz: string | undefined
export var qux = fn()
export const { a: a1, b, c } = { a: 1, b: 2, c: 3 }

export function fn() {}
export class A {}

const a = 1
export { foo as foo1, bar }
</script>
