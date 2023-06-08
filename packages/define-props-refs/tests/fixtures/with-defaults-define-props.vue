<script setup lang="ts">
import { expectTypeOf } from 'expect-type'

// definePropsRefs

interface Props {
  modelValue?: {
    signatureAppearance: 'none'
  }
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({
    signatureAppearance: 'none',
  }),
})

expectTypeOf(props.modelValue).toEqualTypeOf<{
  signatureAppearance: 'none'
}>()
</script>
