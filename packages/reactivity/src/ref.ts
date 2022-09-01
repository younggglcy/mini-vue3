import { Dep, createDep } from './dep'
import { isReadonly, toRaw, toReactive } from './reactive'
import { 
  activeEffect,
  shouldTrack,
  trackEffects,
  triggerEffects
} from './effect'
import { hasChanged } from '@mini-vue3/shared'

export function ref(value?: unknown) {
  return new RefImpl(value)
}

export function isRef(r: any): boolean {
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

export function trackRefValue(ref: any) {
  if (activeEffect && shouldTrack) {
    trackEffects(ref.dep || (ref.dep = createDep()))
  }
}

export function triggerRefValue(ref: any) {
  if (ref.dep) {
    triggerEffects(ref.dep)
  }
}

