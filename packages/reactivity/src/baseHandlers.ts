import { 
  isObject,
  hasOwn,
  hasChanged
} from '@mini-vue3/shared'
import {
  ITERATE_KEY,
  track,
  trigger
} from './effect'
import { 
  reactive,
  readonly,
  ReactiveFlags,
  reactiveMap,
  readonlyMap,
  Target,
  toRaw,
  isReadonly
} from './reactive'
import { TrackOpTypes, TriggerOpTypes } from './operations'
import { isRef } from './ref'

function createGetter(isReadonly = false) {
  return function get(target: Target, key: string | symbol, receiver: object) {
    // this works with `isReactive()` API
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) { // works with `isReadonly()`
      return isReadonly
    } else if ( // return the raw target, works with 'toRaw()' API
      key === ReactiveFlags.RAW &&
      receiver === (isReadonly ? readonlyMap : reactiveMap).get(target)
    ) {
      return target
    }

    const res = Reflect.get(target, key, receiver)

    if (!isReadonly) {
      track(target, TrackOpTypes.GET, key)
    }

    if (isRef(res)) {
      // ref unwrapping
      return res.value
    }

    // make nested properties to be reactive or readonly
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }

    return res
  }
}

export const mutableHandlers: ProxyHandler<object> = {
  get: createGetter(),
  set(target, key, value: unknown, receiver: object) {
    // get old value first
    let oldVal = (target as any)[key]

    if (!isReadonly(value)) {
    // value should be the original object rather Proxy
      oldVal = toRaw(oldVal)
      value = toRaw(value)
    }
    if (isRef(oldVal) && !isRef(value)) {
      oldVal.value = value
      return true
    }

    const hadKey = hasOwn(target, key)
    const res = Reflect.set(target, key, value, receiver)
    // don't trigger if target is something up in the
    // prototype chain of original
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, TriggerOpTypes.ADD, key)
      } else if (hasChanged(value, oldVal)) {
        trigger(target, TriggerOpTypes.SET ,key)
      }
    }
    return res
  },
  has(target, key) {
    const res = Reflect.has(target, key)
    track(target, TrackOpTypes.HAS, key)
    return res
  },
  deleteProperty(target, key) {
    // determine whether the key is belong to target itself
    // before delete it
    const hadKey = hasOwn(target, key)
    const res = Reflect.deleteProperty(target, key)

    // triggers only if key is belong to target itself
    // and be deleted successfully
    if (res && hadKey) {
      trigger(target, TriggerOpTypes.DELETE, key)
    }
    return res
  },
  ownKeys(target) {
    track(target, TrackOpTypes.ITERATE, ITERATE_KEY)
    return Reflect.ownKeys(target)
  }
}

export const readonlyHandlers: ProxyHandler<object> = {
  get: createGetter(true),
  set() {
    return true
  },
  deleteProperty() {
    return true
  }
}
