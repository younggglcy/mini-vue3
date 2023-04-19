import {
  createRenderer,
  VNode,
  RootRenderFunction,
  CreateAppFunction
} from '@mini-vue3/runtime-core'
import { nodeOps, TestElement } from './nodeOps'
import { patchProp } from './patchProp'
import { serializeInner } from './serialize'
import { extend } from '@mini-vue3/shared'

const { render: baseRender, createApp: baseCreateApp } = createRenderer(
  extend({ patchProp }, nodeOps)
)

export const render = baseRender as RootRenderFunction<TestElement>
export const createApp = baseCreateApp as CreateAppFunction<TestElement>

// convenience for one-off render validations
export function renderToString(vnode: VNode) {
  const root = nodeOps.createElement('div')
  render(vnode, root)
  return serializeInner(root)
}

export * from './triggerEvent'
export * from './serialize'
export * from './nodeOps'
export * from '@mini-vue3/runtime-core'
