import { Dep } from './dep'
import { effect, ReactiveEffect } from './effect'
import { ReactiveFlags } from './reactive'
import { Ref, trackRefValue, triggerRefValue } from './ref'

export type ComputedGetter<T> = (...args: any[]) => T
export interface ComputedRef<T = any> extends Ref<T> {
  readonly value: T
}

export function computed<T>(
  getter: ComputedGetter<T>
): ComputedRef<T> {
  return new ComputedRefImpl(getter)
}

export class ComputedRefImpl<T> {
  private _value!: T
  // if _dirty is true, it means that something outsides
  // have been changed so we need to compute it again
  public _dirty = true

  public dep?: Dep = undefined
  public readonly effect: ReactiveEffect<T>

  public readonly __v_isRef = true
  public readonly [ReactiveFlags.IS_READONLY] = true

  constructor(getter: ComputedGetter<T>) {
    const that = this
    this.effect = effect(getter, {
      lazy: true,
      scheduler() {
        if (!that._dirty) {
          that._dirty = true
          triggerRefValue(that)
        }
      }
    })
  }

  get value() {
    // we should track its deps every time
    // the `value` prop is read.
    // it ensures that `computed` works correctly in cases like
    // it's called in chains.
    // same principle is applied in `ref`
    trackRefValue(this)
    if (this._dirty) {
      // manually execute `this.effect()` to get the new value
      this._value = this.effect()
      this._dirty = false
    }
    return this._value
  }
}

