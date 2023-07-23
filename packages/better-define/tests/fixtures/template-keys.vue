<script setup lang="ts">
type T = 'foo' | 'bar'
type S = 'x' | 'y'
type Z = 0 | 1
defineProps<{
  [K in `T${T}S${S}Z${Z}str${`${'static'}_${'value'}'`}` | 'extra']: string
}>()
</script>
