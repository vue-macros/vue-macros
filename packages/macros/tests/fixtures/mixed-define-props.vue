<script setup lang="ts">
import { defineProp } from 'unplugin-vue-macros/macros' with { type: 'macro' }
const { foo } = definePropsRefs<{ foo?: string }>()
const bar = defineProp('bar')
const { baz } = defineModels<{ baz: string }>()
</script>
