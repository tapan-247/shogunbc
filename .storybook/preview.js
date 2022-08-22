import * as React from 'react'
import { addDecorator, addParameters } from '@storybook/react'
import { ChakraProvider } from '@chakra-ui/react'
import lazyLoadingPolyfill from 'frontend-ui/dist/lazyLoadingPolyfill'
import { StoreProvider } from '../src/lib/built-in/store/context'
import { theme } from '../src/components/Theme'
import { RouterContext } from 'frontend-router'
import { withFrontendHead } from './decorators/withFrontendHead'
import { Router } from './router'
import { customer as customerHandlers, cart as cartHandlers } from './handlers'
import { setupWorker } from 'msw'
import { PlatformChangeDecorator } from '../src/lib/decorators'

const worker = setupWorker(...customerHandlers, ...cartHandlers)

worker.start({
  serviceWorker: {
    url: process.env.STORYBOOK_MSW_URL || '/mockServiceWorker.js',
  },
})

lazyLoadingPolyfill()

addParameters({
  globalTypes: {
    platform: {
      name: 'Platform',
      description: 'platform',
      defaultValue: 'shopify_graphql',
      toolbar: {
        icon: 'category',
        items: [
          { title: 'Shopify (Rest)', value: 'shopify_rest' },
          { title: 'Shopify (Graphql)', value: 'shopify_graphql' },
          { title: 'Big Commerce', value: 'big_commerce' },
        ],
      },
    },
  },
  backgrounds: {
    default: 'light',
    values: [
      { name: 'light', value: '#ffffff' },
      { name: 'dark', value: '#191818' },
      { name: 'alt', value: '#E7E9EA' },
      { name: 'accent', value: '#F38732' },
    ],
  },
  options: {
    storySort: {
      method: 'alphabetical',
      order: ['Docs', 'Sections', 'Components', 'UI Primitives'],
    },
  },
  controls: { expanded: true },
  layout: 'fullscreen',
})

addDecorator(StoryFn => (
  <RouterContext.Provider value={Router.router}>
    <StoreProvider>
      <ChakraProvider theme={theme}>
        <div id="frontend-root">
          <StoryFn />
        </div>
      </ChakraProvider>
    </StoreProvider>
  </RouterContext.Provider>
))

addDecorator(PlatformChangeDecorator)
addDecorator(withFrontendHead)
