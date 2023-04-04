import { type StringLiteral } from '@babel/types'

export function keyToString(key: string | StringLiteral) {
  if (typeof key === 'string') return key
  else return key.value
}
