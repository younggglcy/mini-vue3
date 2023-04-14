import { Dep, createDep } from './dep'
import { isReadonly, toRaw, toReactive } from './reactive'
import {
  activeEffect,
  shouldTrack,
  trackEffects,
  triggerEffects
} from './effect'
import { hasChanged } from '@mini-vue3/shared'

export declare const RawSymbol: unique symbol

export interface Ref<T = any> {
  value: T
}

export function ref<T extends object>(
  value: T
): [T] extends [Ref] ? T : Ref<UnwrapRef<T>>
export function ref<T>(value: T): Ref<UnwrapRef<T>>
export function ref<T = any>(): Ref<T | undefined>
export function ref(value?: unknown) {
  return new RefImpl(value)
}

export function isRef<T>(r: Ref<T> | unknown): r is Ref<T>
export function isRef(r: any): r is Ref {
  return !!(r && r.__v_isRef)
}

export function unref<T>(ref: T | Ref<T>): T {
  return isRef(ref) ? ref.value : ref
}

export type ToRef<T> = [T] extends [Ref] ? T : Ref<T>
export function toRef<T extends object, K extends keyof T>(
  object: T,
  key: K
): ToRef<T[K]> {
  const val = object[key]
  if (isRef(val)) return val as any
  return new ObjectRefImpl(object, key) as any
}

export type ToRefs<T extends object> = { [K in keyof T]: ToRef<T[K]> }
export function toRefs<T extends object>(object: T): ToRefs<T> {
  const ret: any = {}
  for (const key in object) {
    ret[key] = toRef(object, key)
  }
  return ret
}

class ObjectRefImpl<T extends object, K extends keyof T> {
  public readonly __v_isRef = true

  constructor(private readonly _object: T, private readonly _key: K) {}

  get value() {
    return this._object[this._key]
  }

  set value(newVal) {
    this._object[this._key] = newVal
  }
}

class RefImpl<T> {
  private _value: T
  private _rawValue: T

  public dep?: Dep = undefined
  public readonly __v_isRef = true

  constructor(value: T) {
    this._rawValue = toRaw(value)
    this._value = toReactive(value)
  }

  get value() {
    trackRefValue(this)
    return this._value
  }

  set value(newVal) {
    const useDirectiveValue = isReadonly(newVal)
    newVal = useDirectiveValue ? newVal : toRaw(newVal)
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal
      this._value = useDirectiveValue ? newVal : toReactive(newVal)
      // manually execute this after change `this._value`
      triggerRefValue(this)
    }
  }
}

type RefBase<T> = {
  dep?: Dep
  value: T
}

/**
 * collect dependencies for a ref-like object
 * by calling `trackEffects()` underneth
 */
export function trackRefValue(ref: RefBase<any>) {
  if (activeEffect && shouldTrack) {
    trackEffects(ref.dep || (ref.dep = createDep()))
  }
}

/**
 * find related effects and invoke them for a ref-like object
 * by calling `triggerEffects()` underneth
 */
export function triggerRefValue(ref: RefBase<any>) {
  if (ref.dep) {
    triggerEffects(ref.dep)
  }
}

export type UnwrapRef<T> = T extends Ref<infer V>
  ? UnwrapRefSimple<V>
  : UnwrapRefSimple<T>

export type UnwrapRefSimple<T> = T extends
  | Function
  | string
  | number
  | boolean
  | Ref
  ? T
  : T extends object
  ? { [P in keyof T]: P extends symbol ? T[P] : UnwrapRef<T[P]> }
  : T
