<script setup lang="ts">
let { modelValue, title } = defineModel<{
  modelValue: string
  title: string
}>()

modelValue = title = '123'
</script>
