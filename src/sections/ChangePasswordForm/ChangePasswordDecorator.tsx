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

import { ACCOUNT_CHANGE_PASSWORD_URL } from 'Components/Data'
import { CustomerDecorator, QueryDecorator } from '../../lib/decorators'
import { DecoratorFunction } from '../../lib/types'
import { getStorybookPlatform } from '../../lib/utils'

export const getChangePasswordDecorator = (): DecoratorFunction<JSX.Element>[] => [
  (Story, storyContext) => {
    const [platform] = getStorybookPlatform(storyContext)
    const queryParam = platform === 'shopify' ? 'resetUrl' : 'reset'

    const query = {
      query: { [queryParam]: encodeURIComponent(`https://dummy.com/reset`) },
    }

    return <QueryDecorator input={query} path={ACCOUNT_CHANGE_PASSWORD_URL} Story={Story} />
  },
  (Story, storyContext) => {
    const [platform] = getStorybookPlatform(storyContext)
    const args = platform === 'big_commerce' ? { loggedIn: true } : {}

    return <CustomerDecorator StoryFn={Story} context={{ ...storyContext, args }} />
  },
]
