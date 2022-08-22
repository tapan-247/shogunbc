import * as React from 'react'
export { default } from 'next/router'
export { RouterContext } from 'next/dist/shared/lib/router-context'

import { useRouter as useNextRouter } from 'next/router'

const isBrowser = typeof window !== 'undefined'

/**
 * @typedef {import('url').Url | string} Url
 * @typedef {import('querystring').ParsedUrlQuery} ParsedUrlQuery
 * @typedef {{
 *  shallow?: boolean
 *  locale?: string | false
 *  scroll?: boolean
 * }} TransitionOptions
 *
 * @returns {{
 *  reload: () => void,
 *  query: ParsedUrlQuery,
 *  replace: (url: Url, as?: Url, options?: TransitionOptions) => Promise<boolean>, back: () => void, location: {search: unknown, hash: string, pathname: string}, push: (url: Url, as?: Url, options?: TransitionOptions) => Promise<boolean>,
 *  events: import('next/dist/shared/lib/mitt').MittEmitter<unknown>,
 *  pathname: string
 * }}
 */
export function useRouter() {
  const router = useNextRouter()

  const search = React.useMemo(() => {
    const queryKeys = Object.keys(router.query)
    if (queryKeys.length === 0) return ''
    return '?' + queryKeys.map(key => `${key}=${router.query[key]}`).join('&')
  }, [router.query])

  /**
   * @typedef {{
   *  pathname: string
   *  search: string
   *  hash: string
   *  state?: string
   * }} Location
   * @type { [Location, React.Dispatch<React.SetStateAction<Location>> ] }
   */
  const [location, setLocation] = React.useState({
    pathname: router.pathname,
    search,
    hash: '',
  })

  React.useEffect(() => {
    if (isBrowser) setLocation(/** @type {Location} */ window.location)
  }, [])

  return {
    location,
    pathname: router.pathname,
    query: router.query,
    push: router.push,
    replace: router.replace,
    reload: router.reload,
    back: router.back,
    events: router.events,
  }
}
