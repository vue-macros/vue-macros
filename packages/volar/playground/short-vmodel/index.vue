<script setup lang="ts">
import { ref } from 'vue'
import Foo from './Foo.vue'
import type {} from '../types'

const val = ref('')
</script>

<template>
  <input $="val" />
  <input v-model="val" />

  <Foo $foo="val" />
  <Foo v-model:foo="val" />

  <Foo $foo="val" />
</template>
