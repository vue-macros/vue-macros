<script lang="ts" setup>
interface Foo {
  (bar: number): void
  a?: string
  new (): void
}

defineProps<{
  foo?: Foo
}>()
</script>
