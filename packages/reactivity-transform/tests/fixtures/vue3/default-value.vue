<script setup lang="ts">
const {
  fn = () => {
    console.log('hello')
  },
  obj = (() => ({ foo: 'bar' })) as never,
} = defineProps<{
  fn: () => void
  obj: Record<string, string>
}>()

console.log(fn, obj)
</script>
