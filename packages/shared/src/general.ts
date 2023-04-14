export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object'

const { hasOwnProperty } = Object.prototype
export const hasOwn = (
  val: object,
  key: string | symbol
): key is keyof typeof val => hasOwnProperty.call(val, key)

export const isArray = Array.isArray

export const extend = Object.assign

const onRE = /^on[^a-z]/
export const isOn = (key: string) => onRE.test(key)

export const hasChanged = (value: any, oldValue: any): boolean =>
  !Object.is(value, oldValue)
  
export const def = (obj: object, key: string | symbol, value: any) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    value
  })
}
