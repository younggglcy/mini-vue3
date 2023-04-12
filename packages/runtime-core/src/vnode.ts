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
