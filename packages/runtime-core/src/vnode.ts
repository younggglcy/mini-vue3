import { isProxy } from "@mini-vue3/reactivity"
import type { Data } from "./component"
import { extend, isArray, isObject, isString, normalizeClass, normalizeStyle } from "@mini-vue3/shared"

export type VNodeProps = {
  [key: string]: any
}

type VNodeChildAtom = VNode | null | undefined | void

export type VNodeArrayChildren = Array<VNodeArrayChildren | VNodeChildAtom>

export type VNodeNormalizedChildren = VNodeArrayChildren | null

export interface VNode {
  type: string
  props: VNodeProps | null
  children: VNodeNormalizedChildren
}

export function isVNode(value: any): value is VNode {
  return value ? value.__v_isVNode === true : false
}

export function createVNode(
  type: string,
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

  return createBaseVNode(
    type,
    props,
    children
  )
}

function createBaseVNode(
  type: string,
  props: (Data & VNodeProps) | null = null,
  children: unknown = null
) {
  const vnode: VNode = {
    type,
    props,
    children: children as VNodeNormalizedChildren
  }
  return vnode
}

export function guardReactiveProps(props: (Data & VNodeProps) | null) {
  if (!props) return null
  return isProxy(props)
    ? extend({}, props)
    : props
}
