<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    fn: () => void
  }>(),
  {
    fn: () => {},
  }
)
</script>
