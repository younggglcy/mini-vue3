import type { Component, Data } from './component'

// temporarily any
export interface App<HostElement = any> {}

export type CreateAppFunction<HostElement> = (
  rootComponent: Component,
  rootProps?: Data | null
) => App<HostElement>
