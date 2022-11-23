import type { AnotherType } from './another-types'

export type Str = string
export interface BaseProps extends AnotherType {
  name: Str
  age: number
}

type UpdateName = 'update:name'
export interface BaseEmits {
  (evt: UpdateName, name: Str): void
  (evt: 'update:foo', foo: string): void
}
