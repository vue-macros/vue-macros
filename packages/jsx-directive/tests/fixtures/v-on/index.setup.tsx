import { expectTypeOf } from 'expect-type'
import Child from './child.setup'

let bar = $ref('')
export default (
  <fieldset>
    <legend>v-on</legend>

    <Child
      bar={bar}
      v-on={{ log: (e) => expectTypeOf<string>(e) }}
      onClick_capture_stop={() => console.log('stopped')}
    >
      <input
        value={bar}
        onInput_prevent={(event: any) => (bar = event.target.value)}
        onKeydown_down={() => {}}
        onKeydown_up
      />
      {bar}
    </Child>
  </fieldset>
)
