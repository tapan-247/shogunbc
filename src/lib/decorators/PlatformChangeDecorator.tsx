import * as React from 'react'
import { CartProvider } from 'frontend-checkout'
import { CustomerProvider } from 'frontend-customer'
import { PlatformApiType, StoreConfig, SupportedPlatform } from 'frontend-checkout/dist/types'
import { CustomerProviderConfig } from 'frontend-customer/dist/customer-sdk/types'
import { StoryContext } from '@storybook/addons'

import { publicRuntimeConfig } from 'Components/Hooks'
import { uniqueId } from 'Components/Utils'
import { getStorybookPlatform } from '../utils'

import { DecoratorFunction } from 'lib/types'

type ConfigFactory = (context: StoryContext) => {
  storeConfig: StoreConfig
  customerConfig: CustomerProviderConfig
  platform: SupportedPlatform
  platformApi: PlatformApiType
}

export const useConfigFactory: ConfigFactory = context => {
  const config = React.useMemo(() => {
    const [platform, platformApi] = getStorybookPlatform(context)

    return {
      storeConfig: {
        storeId: '',
        storeName: '',
        storeDomain: '',
        storePlatformDomain: '',
        platformApiType: platformApi,
        storeToken: '',
        inventory: '',
      },
      platform,
      platformApi,
      customerConfig: {
        storeId: '',
        platform: platform,
        platformApiType: platformApi,
        platformConfig: {
          storeToken: '',
          storeDomain: '',
          storePlatformDomain: '',
        },
      },
    }
  }, [context])

  return config
}

export const PlatformChangeDecorator: DecoratorFunction<JSX.Element> = (StoryFn, context) => {
  const config = useConfigFactory(context)

  const platformUpdatedKey = React.useMemo(() => {
    return config && uniqueId()
  }, [config])

  const { platform, platformApi, customerConfig, storeConfig } = config

  publicRuntimeConfig.storePlatform = platform
  publicRuntimeConfig.storePlatformApiType = platformApi

  return (
    <CartProvider key={platformUpdatedKey} platform={platform} storeConfig={storeConfig}>
      <CustomerProvider config={customerConfig}>
        <StoryFn />
      </CustomerProvider>
    </CartProvider>
  )
}
