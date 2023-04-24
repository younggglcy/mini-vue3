// TODO: export
export { ref, reactive } from '@mini-vue3/reactivity'

export { createRenderer } from './renderer'

export { h } from './h'

export { createVNode, isVNode } from './vnode'

export type { App, CreateAppFunction } from './apiCreateApp'

export type { Component } from './component'

export type {
  RootRenderFunction,
  Renderer,
  RendererElement,
  RendererNode,
  RendererOptions
} from './renderer'

export type { VNode, VNodeProps, VNodeNormalizedChildren } from './vnode'
