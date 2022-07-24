<script setup lang="ts">
let a = 'b',
  { modelValue } = defineModel<{
    modelValue: string
    visible: boolean
  }>()
</script>
