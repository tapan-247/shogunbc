/**
 *
 * MIT License
 *
 * Copyright 2021 Shogun, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import * as React from 'react'
import { useRouter } from 'frontend-router'
import { withQuery } from '@storybook/addon-queryparams'
import { ArgsStoryFn } from '@storybook/addons'

import { DecoratorFunction } from '../types'

interface QueryDecoratorInput {
  query: Record<string, string>
}
interface QueryDecoratorParams {
  input: QueryDecoratorInput
  path: string
  Story: ArgsStoryFn<JSX.Element>
}

export const QueryDecorator: React.FC<QueryDecoratorParams> = ({ input, path, Story }) => {
  const params = Object.entries(input?.query || {})
  const { push, query } = useRouter()
  const routerPopulated = React.useRef(false)

  React.useEffect(() => {
    if (
      params.every(
        ([key, value]) => query[key] === value || query[key] === decodeURIComponent(value),
      )
    ) {
      routerPopulated.current = true
    } else {
      const routeWithQuery = params.reduce(
        (query, [key, value], index) =>
          index > 0 ? `${query}&${key}=${value}` : `${query}${key}=${value}`,
        `${path}?`,
      )

      push(routeWithQuery)
    }
  }, [query, params, path, push])

  React.useEffect(() => {
    if (routerPopulated.current) {
      return () => {
        if (path === '/search') {
          push('/')

          return
        }
        push(path)
      }
    }
  }, [push, path])

  return <React.Fragment>{routerPopulated.current && Story()}</React.Fragment>
}

export const getQueryDecorators = (
  input: QueryDecoratorInput,
  path: string,
): DecoratorFunction<JSX.Element>[] => [
  withQuery(input),
  Story => <QueryDecorator input={input} path={path} Story={Story} />,
]
