export const QUERY_NAMED_TEMPLATE = '?vue&type=named-template'
export const QUERY_TEMPLATE = 'type=template&namedTemplate'
export const QUERY_TEMPLATE_MAIN: 'type=template&namedTemplate&mainTemplate' = `${QUERY_TEMPLATE}&mainTemplate`

export const MAIN_TEMPLATE: unique symbol = Symbol()
