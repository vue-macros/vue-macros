<script setup lang="ts">
type T = {
  optional: number
}
defineProps<
  Partial<T> &
    Required<{
      required?: boolean
    }> &
    Readonly<{
      readonly: string
    }>
>()
</script>
