import { StoryContext } from '@storybook/addons'
import { PlatformApiType, SupportedPlatform } from 'frontend-checkout/dist/types'

type GetStorybookPlatform = (context: StoryContext) => [SupportedPlatform, PlatformApiType]

export const getStorybookPlatform: GetStorybookPlatform = context => {
  const platform = context?.globals?.platform || ''

  const platformApi =
    platform === 'shopify_rest' ? 'rest' : platform === 'shopify_graphql' ? 'graphql' : 'management'

  const supportedPlatform = platform.includes('shopify') ? 'shopify' : 'big_commerce'

  return [supportedPlatform, platformApi]
}
