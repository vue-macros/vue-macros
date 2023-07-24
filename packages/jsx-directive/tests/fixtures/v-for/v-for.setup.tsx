// @ts-nocheck
const list = [1, 2, 3]

export default () => (
  <>
    <div v-for={(i, index) in list} key={index}>
      <div>{i}</div>
    </div>
  </>
)
