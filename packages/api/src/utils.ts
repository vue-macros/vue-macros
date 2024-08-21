import type { Err } from 'neverthrow'

export function extractError<T>(err: Err<any, T>): Err<never, T> {
  return err as any
}
