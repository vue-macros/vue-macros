---
layout: page
---

<script setup>
import InteractiveDemo from './InteractiveDemo.vue'
</script>

<Suspense>
  <InteractiveDemo />
  <template #fallback>
    <div flex justify-center items-center h-64>
      <div text-2xl>Loading...</div>
    </div>
  </template>
</Suspense>
