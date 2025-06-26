<script setup lang="ts">
const { foo } = definePropsRefs<{ foo?: string }>()
const bar = defineProp('bar')
const { baz } = defineModels<{ baz: string }>()
</script>
