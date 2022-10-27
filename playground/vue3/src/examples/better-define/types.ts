export type Str = string
export interface BaseProps {
  name: Str
  age: number
}

type UpdateName = 'update:name'
export interface BaseEmits {
  (evt: UpdateName, name: Str): void
  (evt: 'update:foo', foo: string): void
}
