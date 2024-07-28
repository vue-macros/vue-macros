let selected = $ref(0)

export default (
  <div v-once onClick={() => selected++}>
    {selected}
  </div>
)
