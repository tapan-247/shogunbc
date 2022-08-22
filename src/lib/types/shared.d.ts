import { ArgsStoryFn, StoryContext } from '@storybook/addons'
import { SupportedPlatform, PlatformApiType } from 'frontend-checkout/dist/types'

export type PropsOf<C> = React.ComponentPropsWithRef<C>

export interface Media {
  name: string
  src: string
  alt?: string
  width: number
  height: number
}

export interface MoneyInfo {
  amount: string
  currencyCode: string
}

export type Platform = SupportedPlatform
export type ApiType = PlatformApiType

export interface NormalizeHook<FROM, TO> {
  (model: FROM): TO
  (model: null | undefined): null
}

export type DecoratorFunction<StoryFnReturnType = unknown> = (
  fn: ArgsStoryFn<StoryFnReturnType>,
  c: StoryContext,
) => ReturnType<ArgsStoryFn<StoryFnReturnType>>
