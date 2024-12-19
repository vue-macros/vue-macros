<script setup lang="ts">
import { expectTypeOf } from 'expect-type'

const props = simpleProps<{
  msg?: string
  foo?: number | undefined
}>()

expectTypeOf<{
  msg?: string
  foo?: number | undefined
  [key: string]: any
}>(props)
</script>
