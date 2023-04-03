<script setup lang="ts">
let a = 'b',
  { modelValue } = $defineModels<{
    modelValue: string
    visible: boolean
  }>()
</script>
