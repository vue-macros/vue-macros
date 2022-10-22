import { initContext } from '@vue-macros/common'
import { describe, expect, test } from 'vitest'

describe('analyzeComponent', () => {
  describe('props', () => {
    test('object props', () => {
      const { ctx } = initContext(
        `<script setup>
  defineProps(props)
  </script>`,
        'basic.vue'
      )
      expect(ctx.component).toMatchSnapshot()
    })

    test('typescript props', () => {
      const { ctx } = initContext(
        `<script setup lang="ts">
  defineProps<{ title: string }>()
  </script>`,
        'basic.vue'
      )
      expect(ctx.component).toMatchSnapshot()
    })
  })
})
