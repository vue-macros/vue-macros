<script setup lang="ts">
defineProps<
  | { type: 'foo'; foo: string; optional?: boolean }
  | { type: 'bar'; bar: number; optional?: boolean }
>()
</script>
