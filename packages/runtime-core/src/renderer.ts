import { ShapeFlags } from '@mini-vue3/shared'
import type { CreateAppFunction } from './apiCreateApp'
import type { Component } from './component'
import { VNode, VNodeArrayChildren, normalizeVNode } from './vnode'

export interface Renderer<HostElement = RendererElement> {
  render: RootRenderFunction<HostElement>
  createApp: CreateAppFunction<HostElement>
}

export type RootRenderFunction<HostElement = RendererElement> = (
  vnode: VNode | null,
  container: HostElement
) => void

// Renderer Node can technically be any object in the context of core renderer
// logic - they are never directly operated on and always passed to the node op
// functions provided via options, so the internal constraint is really just
// a generic object.
export interface RendererNode {
  [key: string]: any
}

export interface RendererElement extends RendererNode {}

export interface RendererOptions<
  HostNode = RendererNode,
  HostElement = RendererElement
> {
  patchProp(el: HostElement, key: string, prevValue: any, nextValue: any): void
  insert(el: HostNode, parent: HostElement, anchor?: HostNode | null): void
  remove(el: HostNode): void
  createElement(type: string): HostElement
  setElementText(node: HostElement, text: string): void
}

export function createRenderer(options: RendererOptions) {
  return baseCreateRenderer(options)
}

function baseCreateRenderer(options: RendererOptions): Renderer {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    setElementText: hostSetElementText
  } = options

  const patch: (
    /** old vnode */
    n1: VNode | null,
    /** new vnode */
    n2: VNode,
    container: RendererElement,
    anchor?: RendererNode | null
  ) => void = (n1, n2, container, anchor = null) => {
    if (n1 === n2) return

    if (!n1) {
      mount(n2, container, anchor)
    }
  }

  const mount: (
    vnode: VNode,
    container: RendererElement,
    anchor?: RendererNode | null
  ) => void = (vnode, container, anchor = null) => {
    const { props, children, type, shapeFlag } = vnode
    const el = hostCreateElement(type as string)

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children as string)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children as VNodeArrayChildren, el, null)
    }

    hostInsert(el, container, anchor)
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }
  }

  const mountChildren: (
    children: VNodeArrayChildren,
    container: RendererElement,
    anchor?: RendererNode | null
  ) => void = (children, container, anchor = null) => {
    for (let i = 0; i < children.length; i++) {
      const child = normalizeVNode(children[i])
      patch(null, child, container, anchor)
    }
  }

  const unmount: (
    vnode: VNode,
    parentComponent: Component,
    doRemove?: boolean
  ) => void = (vnode, parentComponent, doRemove = false) => {
    // TODO: clean side effects here
    if (doRemove) remove(vnode)
  }

  const remove: (vnode: VNode) => void = vnode => {
    hostRemove(vnode)
  }

  const render: RootRenderFunction = (vnode, container) => {
    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode, null, true)
      }
    } else {
      patch(container._vnode || null, vnode, container, null)
    }
    container._vnode = vnode
  }

  return {
    render,
    createApp: null as unknown as CreateAppFunction<RendererElement>
  }
}
