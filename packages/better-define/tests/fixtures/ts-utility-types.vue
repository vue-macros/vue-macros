<script setup lang="ts">
type Union = '1' | '2' | '3'

type FooExtract = '1' | '2'
type Foo = Extract<Union, FooExtract>

type BarExclude = '2'
type Bar = Exclude<Union, BarExclude>

defineProps<{
  foo: Foo
  bar: Bar
}>()
</script>
