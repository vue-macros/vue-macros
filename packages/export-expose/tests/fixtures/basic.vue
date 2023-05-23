<script setup lang="ts">
export const foo: string = 'foo',
  bar = 10
export let baz: string | undefined
export var qux = fn()
export const { a, b, c } = { a: 1, b: 2, c: 3 }

export function fn() {}
export class A {}

export { foo as foo1 }
</script>
