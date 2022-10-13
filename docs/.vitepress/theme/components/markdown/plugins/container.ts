import container from 'markdown-it-container'

type RenderPlaceFunction = (info: string) => string

interface ContainerPluginOptions {
  /**
   * The type of the container
   *
   * It would be used as the `name` of the container
   *
   * @see https://github.com/markdown-it/markdown-it-container#api
   */
  type: string

  /**
   * A function to render the starting tag of the container.
   *
   * This option will not take effect if you don't specify the `after` option.
   */
  before: RenderPlaceFunction

  /**
   * A function to render the ending tag of the container.
   *
   * This option will not take effect if you don't specify the `before` option.
   */
  after: RenderPlaceFunction
}

/** Powered by vuepress-next */
export const useMarkdownContainer = ({
  type,
  after,
  before,
}: ContainerPluginOptions) => {
  const infoStack: string[] = []
  const render = (tokens: any, index: number): string => {
    const token = tokens[index]
    if (token.nesting === 1) {
      // resolve info (title)
      const info = token.info.trim().slice(type.length).trim()
      infoStack.push(info)
      return before(info)
    } else {
      // `after` tag

      // pop the info from stack
      const info = infoStack.pop() || ''

      // render
      return after(info)
    }
  }
  return {
    container,
    type,
    render,
  }
}
