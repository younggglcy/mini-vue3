import { 
  isObject,
  hasOwn
} from '@mini-vue3/shared'
import {
  ITERATE_KEY,
  track,
  trigger
} from './effect'
import { reactive, ReactiveFlags, reactiveMap, Target, toRaw } from './reactive'
import { TrackOpTypes, TriggerOpTypes } from './operations'

export const mutableHandlers: ProxyHandler<object> = {
  get(target: Target, key, receiver: object) {
    // this works with `isReactive()` API
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    } else if ( // return the raw target, works with 'toRaw()' API
      key === ReactiveFlags.RAW &&
      receiver === reactiveMap.get(target)
    ) {
      return target
    }

    const res = Reflect.get(target, key, receiver)

    track(target, TrackOpTypes.GET, key)

    // make nested properties to be reactive
    if (isObject(res)) {
      return reactive(res)
    }

    return res
  },
  set(target, key, value: unknown, receiver: object) {
    // get old value first
    let oldVal = (target as any)[key]

    // value should be the original object rather Proxy
    oldVal = toRaw(oldVal)
    value = toRaw(value)

    const hadKey = hasOwn(target, key)
    const res = Reflect.set(target, key, value, receiver)
    // don't trigger if target is something up in the
    // prototype chain of original
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, TriggerOpTypes.ADD, key)
      } else if (!Object.is(oldVal, value)) {
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
