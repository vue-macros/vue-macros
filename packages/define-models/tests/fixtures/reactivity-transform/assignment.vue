<script setup lang="ts">
let { modelValue, title } = $defineModels<{
  modelValue: string
  title: string
}>()

modelValue = title = '123'
</script>
