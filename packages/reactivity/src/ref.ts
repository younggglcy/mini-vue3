import { Dep, createDep } from './dep'
import { isReadonly, toRaw, toReactive } from './reactive'
import { 
  activeEffect,
  shouldTrack,
  trackEffects,
  triggerEffects
} from './effect'
import { hasChanged } from '@mini-vue3/shared'

export interface Ref<T = any> {
  value: T
}

export function ref<T extends object>(value: T): [T] extends [Ref] ? T : Ref<UnwrapRef<T>>
export function ref<T>(value: T): Ref<UnwrapRef<T>>
export function ref<T = any>(): Ref<T | undefined>
export function ref(value?: unknown) {
  return new RefImpl(value)
}

export function isRef<T>(r: Ref<T> | unknown): r is Ref<T>
export function isRef(r: any): r is Ref {
  return !!(r && r.__v_isRef)
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
      triggerRefValue(this)
    }
  }
}

type RefBase<T> = {
  dep?: Dep
  value: T
}

export function trackRefValue(ref: RefBase<any>) {
  if (activeEffect && shouldTrack) {
    trackEffects(ref.dep || (ref.dep = createDep()))
  }
}

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
