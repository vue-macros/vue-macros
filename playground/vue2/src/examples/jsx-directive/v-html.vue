<script setup lang="tsx">
defineRender(() => (
  <fieldset>
    <legend>v-html</legend>

    <div v-html={'<span class="ok">ok</span>'}></div>
  </fieldset>
))
</script>
