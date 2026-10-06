import type { Params, UIMatch } from 'react-router'

/** Header'dagi yo'l ko'rsatkichining bitta bo'lagi: "TypeScript › Classes › Abstract Classes". */
export interface Crumb {
  label: string
  to?: string
}

/** Route `handle` — har bir sahifa header'da o'z nomini ko'rsatadi (loader ma'lumoti va URL parametrlaridan). */
export interface RouteHandle {
  crumbs: (loaderData: unknown, params: Params) => Crumb[]
}

export function crumbsHandle<Data = undefined>(crumbs: (data: Data | undefined, params: Params) => Crumb[]): RouteHandle {
  return { crumbs: (loaderData, params) => crumbs(loaderData as Data | undefined, params) }
}

export function collectCrumbs(matches: UIMatch[]): Crumb[] {
  return matches.flatMap((match) => (match.handle as RouteHandle | undefined)?.crumbs(match.loaderData, match.params) ?? [])
}
