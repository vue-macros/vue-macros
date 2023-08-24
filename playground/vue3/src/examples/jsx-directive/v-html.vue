<script setup lang="tsx">
const html = '<span class="ok">ok</span>'

defineRender(() => (
  <fieldset>
    <legend>v-html</legend>

    <div v-html={html}></div>
  </fieldset>
))
</script>
