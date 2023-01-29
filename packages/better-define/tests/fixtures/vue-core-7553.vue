<script setup lang="ts">
export interface CommonProps {
  size?: 'xl' | 'l' | 'm' | 's' | 'xs'
}

type ConditionalProps =
  | {
      color: 'normal' | 'primary' | 'secondary'
      appearance: 'normal' | 'outline' | 'text'
    }
  | {
      color: 'white'
      appearance: 'outline'
      note: string
    }

type Props = CommonProps & ConditionalProps

defineProps<Props>()
</script>
