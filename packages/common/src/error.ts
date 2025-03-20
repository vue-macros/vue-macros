export class TransformError<T extends string> extends SyntaxError {
  constructor(public message: T) {
    super(message)
    this.name = 'TransformError'
  }
}
