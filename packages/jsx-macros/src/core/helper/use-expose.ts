export function useExpose(i: any, exposed = {}): void {
  if (i) {
    i.exposed = exposed
    if (i.vnode) i.vnode.shapeFlag = 4
  }
}
