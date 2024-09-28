export function useExpose(i: any, exposed = {}): any {
  if (i) {
    i.exposed = exposed
    if (i.vnode) i.vnode.shapeFlag = 4
  }
  return exposed
}
