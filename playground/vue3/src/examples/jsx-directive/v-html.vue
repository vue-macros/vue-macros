<script setup lang="tsx">
const html = '<div>123</div>'

defineRender(() => (
  <fieldset>
    <legend>v-html</legend>

    <div v-html={html}></div>
  </fieldset>
))
</script>
