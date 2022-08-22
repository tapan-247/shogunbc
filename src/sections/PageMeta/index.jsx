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
import React from 'react'
import Head from 'frontend-head'

/**
 * @typedef {{
 *  title: string
 *  description: string
 *  url: string
 *  type: string
 *  image: import('lib/types').Media
 * }} PageMetaProps
 * @param { PageMetaProps } props
 */
const PageMeta = ({ title, description, url, type, image }) => {
  return (
    <Head>
      {title && (
        <React.Fragment>
          <title>{title}</title>
          <meta property="og:title" content={title} />
        </React.Fragment>
      )}
      {description && (
        <React.Fragment>
          <meta name="description" content={description} />
          <meta property="og:description" content={description} />
        </React.Fragment>
      )}
      {url && (
        <React.Fragment>
          <link rel="canonical" href={url} key="canonicalURL" />
          <meta property="og:url" content={url} />
        </React.Fragment>
      )}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {image && <meta property="og:image" content={image.src} />}
      <meta property="og:type" content={type || 'website'} />
    </Head>
  )
}

export default PageMeta
