<script setup lang="ts">
export const foo: string = 'foo'
export const bar = 10
export let baz: string | undefined
export var qux = fn()

console.log(foo, bar, baz)

function fn() {}
</script>
