<script setup lang="ts">
import { expectTypeOf } from 'expect-type'

interface Props {
  modelValue?: {
    signatureAppearance: 'none'
  }
}

// definePropsRefs

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({
    signatureAppearance: 'none',
  }),
})

expectTypeOf(props.modelValue).toEqualTypeOf<{
  signatureAppearance: 'none'
}>()
</script>
