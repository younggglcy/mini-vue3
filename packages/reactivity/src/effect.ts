import { createDep, Dep } from './dep'

// The main WeakMap that stores {target -> key -> dep} connections.
// Conceptually, it's easier to think of a dependency as a Dep class
// which maintains a Set of subscribers, but we simply store them as
// raw Sets to reduce memory overhead.
type KeyToDepMap = Map<any, Dep>
const targetMap = new WeakMap<any, KeyToDepMap>()

export interface ReactiveEffect<T = any> {
  (): T
  raw: () => T
  deps: Dep[]
  _isEffect: true
}

export let activeEffect: ReactiveEffect | undefined
// stores all effects, which allow nested effects to work
const effectStack: ReactiveEffect[] = []

export function isEffect(fn: any): fn is ReactiveEffect {
  return !!fn && fn._isEffect
}

export function effect<T = any>(fn: () => T): ReactiveEffect<T> {
  if (isEffect(fn)) {
    fn = fn.raw
  }

  const effect = createReactiveEffect(fn)
  effect()
  return effect
}

function createReactiveEffect<T = any>(fn: () => T): ReactiveEffect<T> {
  const effect = function() {
    return run(effect, fn)
  } as ReactiveEffect
  effect._isEffect = true
  effect.raw = fn
  effect.deps = []
  return effect
}

function run(effect: ReactiveEffect, fn: () => void): unknown {
  // avoid recursively calling itself
  if (!effectStack.includes(effect)) {
    cleanup(effect)
    try {
      effectStack.push(effect)
      activeEffect = effect
      // when executing this.fn()
      // set() && get() handler of Proxy will be triggered
      // and deps will be automatically collected
      return fn()
    } finally {
      effectStack.pop()
      activeEffect = effectStack[effectStack.length - 1]
    }
  }
}

function cleanup(effect: ReactiveEffect) {
  const { deps } = effect
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect)
    }
    deps.length = 0
  }
}

export function track(target: object, key: unknown) {
  if (activeEffect) {
    let depsMap = targetMap.get(target)
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(key)
    if (!dep) {
      depsMap.set(key, (dep = createDep()))
    }
    if (!dep.has(activeEffect)) {
      dep.add(activeEffect)
      activeEffect.deps.push(dep)
    }
  }
}

export function trigger(target: object, key: unknown) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    // never been tracked
    return
  }
  const effects = depsMap.get(key)
  if (effects) {
    [...effects].forEach(effect => effect())
  }
}
