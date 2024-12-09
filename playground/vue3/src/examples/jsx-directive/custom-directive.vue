<script setup lang="tsx">
import type { Directive } from 'vue'

// eslint-disable-next-line unused-imports/no-unused-vars
const vPermission: Directive<
  HTMLElement,
  string,
  'modifier1' | 'modifier2',
  'disable' | 'readonly'
> = (el, { value, arg }) => {
  if (['admin'].includes(value)) return

  if (arg === 'disable') {
    el.style.setProperty('color', 'unset')
    el.style.pointerEvents = 'none'
    return
  } else if (arg === 'readonly') {
    el.style.setProperty('opacity', '70%')
    el.style.pointerEvents = 'none'
    return
  }

  el.style.display = 'none'
}

defineRender(() => <div v-permission:disable_modifier1_modifier2="admin" />)
</script>
