import { isObject } from '@mini-vue3/shared'
import {
  track,
  trigger
} from './effect'
import { reactive, ReactiveFlags, reactiveMap, Target, toRaw } from './reactive'

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

    track(target, key)

    // make nested properties to be reactive
    if (isObject(res)) {
      return reactive(res)
    }

    return res
  },
  set(target, key, value: unknown, receiver: object) {
    // get old value first
    const oldVal = (target as any)[key]

    const res = Reflect.set(target, key, value, receiver)

    // don't trigger if target is something up in the
    // prototype chain of original
    if (target === toRaw(receiver)) {
      if (!Object.is(oldVal, value)) {
        trigger(target, key)
      }
    }
    return res
  }
}
