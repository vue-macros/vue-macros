<setup>
import { Ok } from '../../assert'
import { ref } from 'vue'
const msg = ref('Hello World')
</setup>

<template>
  <Ok />
  <!-- @vue-skip ignore it -->
  {{ msg }}
</template>
