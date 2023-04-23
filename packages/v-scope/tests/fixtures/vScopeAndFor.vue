<script setup>
import {ref} from 'vue'
</script>

<template>
  <div v-for="i in [1,2,3]" v-scope="{x: i+1}">{{x}}</div>
</template>