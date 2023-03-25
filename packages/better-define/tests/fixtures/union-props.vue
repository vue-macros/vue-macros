<script setup lang="ts">
type T = 'foo' | 'bar'
defineProps<
  { [K in T]: string | number } & {
    [K in 'optional']?: boolean
  }
>()
</script>
