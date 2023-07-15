<script setup lang="ts">
import { defineProp } from '../../../define-prop/macros'
const { foo } = definePropsRefs<{ foo?: string }>()
const bar = defineProp('bar')
const { baz } = defineModels<{ baz: string }>()
</script>
