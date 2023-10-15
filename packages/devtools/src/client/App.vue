<script setup lang="ts"></script>

<template>
  <div w-screen h-screen flex="~ col gap2" justify-center items-center>
    <img src="https://vue-macros.dev/logo.svg" alt="Vue Macros" h-40 />
    <h1 text-2xl font-mono>Vue Macros is working!</h1>
    <a href="https://vue-macros.dev/" target="_blank">
      📜
      <span text-blue underline underline-offset-3>Documentation</span>
    </a>

    <span opacity-50 text-sm>More features are coming soon!</span>
  </div>
</template>

<style>
html.dark {
  background: #000;
  color: #eee;
}
</style>
