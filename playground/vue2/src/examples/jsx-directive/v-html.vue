<script setup lang="tsx">
defineRender(() => (
  <fieldset>
    <legend>v-html</legend>

    <div v-html={'<div>123</div>'}></div>
  </fieldset>
))
</script>
