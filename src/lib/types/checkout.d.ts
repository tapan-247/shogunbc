import { LineItem } from 'frontend-checkout/dist/types'

import { BigCommerceModifiers } from '.'

export type CheckoutProduct = LineItem

export interface NormalizedCheckoutProduct {
  id: string | number
  lineItemId: string
  title: string
  subtitle: string
  price: string | number
  quantity: number
  variantId: string | number
  imageUrl: string
  slug: string
  modifiers?: BigCommerceModifiers[]
}

export interface CheckoutShopifyProduct {
  id: string | number
  variant_id: string | number
  price: number
  image: string
  handle: string
  quantity: number
  title: string
  variant?: {
    id: string | number
    image: {
      src: string
    }
    price: string
    product?: {
      handle: string
    }
    title: string
  } | null
}

export interface CheckoutBigCommerceProduct {
  id: string
  lineItemId: string
  brand: string
  name: string
  imageUrl: string
  listPrice: number
  quantity: number
  variantId: number
  optionSelections?: BigCommerceModifiers[]
}
