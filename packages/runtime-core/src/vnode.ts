import { isProxy } from '@mini-vue3/reactivity'
import type { Data } from './component'
import {
  extend,
  isArray,
  isObject,
  isString,
  normalizeClass,
  normalizeStyle,
  ShapeFlags
} from '@mini-vue3/shared'
import { RendererNode } from './renderer'

export type VNodeProps = {
  [key: string]: any
}

type VNodeChildAtom =
  | VNode
  | string
  | number
  | boolean
  | null
  | undefined
  | void

export type VNodeArrayChildren = Array<VNodeArrayChildren | VNodeChildAtom>

export type VNodeChild = VNodeChildAtom | VNodeArrayChildren

export type VNodeNormalizedChildren = string | VNodeArrayChildren | null

export const Fragment = Symbol.for('v-fgt')
export const Text = Symbol.for('v-txt')
export const Comment = Symbol.for('v-cmt')

export type VNodeTypes = string | typeof Fragment | typeof Text | typeof Comment

export interface VNode<HostNode = RendererNode> {
  type: VNodeTypes
  props: VNodeProps | null
  children: VNodeNormalizedChildren
  shapeFlag: number

  // DOM
  el: HostNode | null
  anchor: HostNode | null
}

export function isVNode(value: any): value is VNode {
  return value ? value.__v_isVNode === true : false
}

export function createVNode(
  type: VNodeTypes,
  props: (Data & VNodeProps) | null = null,
  children: unknown = null
) {
  // class & style normalization.
  if (props) {
    // for reactive or proxy objects, we need to clone it to enable mutation.
    props = guardReactiveProps(props)!
    let { class: klass, style } = props
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass)
    }
    if (isObject(style)) {
      // reactive state objects need to be cloned since they are likely to be
      // mutated
      if (isProxy(style) && !isArray(style)) {
        style = extend({}, style)
      }
      props.style = normalizeStyle(style)
    }
  }

  // encode the vnode type information into a bitmap
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0

  return createBaseVNode(type, props, children, shapeFlag)
}

function createBaseVNode(
  type: VNodeTypes,
  props: (Data & VNodeProps) | null = null,
  children: unknown = null,
  shapeFlag = type === Fragment ? 0 : ShapeFlags.ELEMENT
) {
  const vnode: VNode = {
    type,
    props,
    children: children as VNodeNormalizedChildren,
    shapeFlag,
    el: null,
    anchor: null
  }

  if (children) {
    // compiled element vnode - if children is passed, only possible types are
    // string or Array.
    vnode.shapeFlag |= isString(children)
      ? ShapeFlags.TEXT_CHILDREN
      : ShapeFlags.ARRAY_CHILDREN
  }

  return vnode
}

export function guardReactiveProps(props: (Data & VNodeProps) | null) {
  if (!props) return null
  return isProxy(props) ? extend({}, props) : props
}

export function normalizeVNode(child: VNodeChild): VNode {
  if (child == null || typeof child === 'boolean') {
    // empty placeholder
    return createVNode(Comment)
  } else if (isArray(child)) {
    // fragment
    return createVNode(Fragment, null, child)
  } else {
    // strings and numbers
    return createVNode(Text, null, String(child))
  }
}

export function isSameVNodeType(n1: VNode, n2: VNode): boolean {
  return n1.type === n2.type
}
