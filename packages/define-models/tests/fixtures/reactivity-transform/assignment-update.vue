<script setup lang="ts">
let { count } = $defineModels<{
  count: number
}>()

count++
count--
++count
--count
count = 1
count += 1
count -= 1
count *= 1
count /= 1

count = count + 1

const additionAssignment = () => (count += 1)
const increment = () => count++
const add = () => (count = count + 1)
</script>
