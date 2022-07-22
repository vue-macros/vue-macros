<script lang="ts" setup>
const a = 'hello'
defineOptions({
  foo() {
    console.log('hello')
  },
  bar: () => console.log('world'),
  baz: class {
    a() {
      const a = () => 'b'
      return a
    }
  },
  fun: function () {
    console.log('fun')
  },
  iife: (() => Math.random())(),
})
</script>
