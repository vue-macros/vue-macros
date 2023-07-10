<script setup lang="ts">
import { defineProp } from '../../../define-prop/macros'
const { foo } = definePropsRefs(['foo'])

const bar = defineProp('bar')
</script>
