<script setup lang="ts">
type Foo = {
  foo: string
  bar?: number
}

interface M {
  foo(): void
  foo(): string
  bar(): number
  opt?(): void
}

type Arr = (string | number)[]
type Arr2 = Array<string | number>
type Tuple = [string, boolean]

defineProps<{
  foo: Foo['foo']
  bar: Foo['bar']
  baz: Foo[`${'bar' | 'foo'}`]
  qux: Foo['bar' | 'foo']
  all: Foo[keyof Foo]
  arr: Arr[number]
  arr2: Arr2[number]
  tuple: Tuple[number]
  methodFoo: M['foo']
  methodBar: M['bar']
  methodOpt: M['opt']
}>()
</script>
