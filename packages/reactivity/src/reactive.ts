import { mutableHandlers } from './baseHandlers'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  RAW = '__v_raw'
}

export interface Target {
  [ReactiveFlags.IS_REACTIVE]?: boolean
  [ReactiveFlags.RAW]?: boolean
}

export const reactiveMap = new WeakMap<Target, any>()

export function reactive<T extends object>(target: T): any
export function reactive(target: Target) {
  // target is already a Proxy, return it.
  if (
    target[ReactiveFlags.RAW] 
  ) {
    return target
  }

  const existingProxy = reactiveMap.get(target)
  if (existingProxy) {
    return existingProxy
  }

  const proxy = new Proxy(
    target,
    mutableHandlers
  )
  reactiveMap.set(target, proxy)
  return proxy
}

export function isReactive(value: unknown): boolean {
  return !!(value && (value as Target)[ReactiveFlags.IS_REACTIVE])
}

/** return the raw object if it's a Proxy  */
export function toRaw<T>(observed: T): T {
  const raw = observed && (observed as Target)[ReactiveFlags.RAW] as any
  return raw ? toRaw(raw) : observed
}
