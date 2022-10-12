export function getVueLibraryName(vueVersion: number) {
  return vueVersion < 2.7 ? '@vue/runtime-dom' : 'vue'
}
