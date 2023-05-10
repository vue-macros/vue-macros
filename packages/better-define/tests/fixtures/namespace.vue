<script setup lang="ts">
// type X = string
// type Y = string
// type Z = string
// namespace Foo {
//   export type X = number
//   export type Y = number
//   export namespace Bar {
//     export type A = {
//       x: X
//       y: Y
//       z: Z
//     }
//     export type X = boolean
//   }
// }
// defineProps<Foo.Bar.A>()

type X = string
type Y = string
type Z = string
export type A = {
  x: X
  y: Y
  z: Z
}
defineProps<A>()
</script>
