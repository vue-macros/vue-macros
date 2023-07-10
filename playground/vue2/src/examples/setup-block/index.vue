<setup>
import { Ok } from '../../assert'
import { ref } from 'vue'
const msg = ref('Hello World')
</setup>

<template>
  <div>
    <Ok />
    <!-- @vue-skip ignore it -->
    {{ msg }}
  </div>
</template>
