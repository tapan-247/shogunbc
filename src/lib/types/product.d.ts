import { Media, Platform } from '.'

export type CmsProduct = ShopifyProduct | BigCommerceProduct

/** Shogun product (normalized data) */
export interface Product {
  id?: number
  slug: string
  name: string
  description: string
  price?: number
  media: ProductMediaItem[]
  thumbnail?: ProductThumbnail
  variants: ProductVariant[]
  options: ProductOption[]
  metaTitle: string
  metaDescription: string
  searchResult?: HighlightResult<Product>
  _originalPlatform: Platform
  inventoryTracking?: 'product' | 'variant' | 'none'
}

export interface ProductMediaItem extends Media {
  id: string
  name: string
}

export interface ProductThumbnail extends Media {
  mimeType: string
  size: number
}

export interface ProductVariant<API_TYPE = 'graphql' | 'rest'> {
  storefrontId: API_TYPE extends 'graphql' ? string : number
  name: string
  price?: number | string
  sku?: string
  optionValues?: VariantOptionValue[]
}

export interface ProductOption {
  id: string
  displayName: string
  optionValues: ProductOptionValue[]
  required: boolean
  defaultValue?: ProductOptionValue['value']
}

export interface ProductOptionValue {
  text: string
  value: string
}

export interface VariantOptionValue extends ProductOptionValue {
  optionId: string
}

/** Shopify product */
export interface ShopifyProduct {
  externalId?: number
  name: string
  slug: string
  description: string
  descriptionHtml: string
  media: ShopifyMediaItem[]
  thumbnail?: ShopifyThumbnail
  variants: ShopifyVariant[]
  metaTitle: string
  metaDescription: string
  _highlightResult?: HighlightResult<ShopifyProduct>
}

export interface ShopifyMediaItem {
  _id: string
  details: Media
}

export interface ShopifyThumbnail extends Media {
  _type: string
  mimeType: string
  storageID: string
  size: number
}

type ShopifyVariant = {
  storefrontId: string
  name: string
  price: number | string
  sku?: string
  externalId: number
}

/** BigCommerce product */
export interface BigCommerceProduct {
  id: number
  _id: string
  name: string
  price?: number
  url: string
  description: string
  images: BigCommerceImage[]
  variants: BigCommerceVariant[]
  modifiers?: BigCommerceOption[]
  options?: BigCommerceOption[]
  page_title: string
  meta_description: string
  _highlightResult?: HighlightResult<BigCommerceProduct>
  inventoryTracking?: 'product' | 'variant' | 'none'
}

export interface BigCommerceImage {
  _id: string
  id: number
  media: Media
}

export interface BigCommerceVariant {
  _id: string
  id: number
  price?: number
  sku: string
  optionValues?: BigCommerceOptionValue[]
}

export interface BigCommerceOption {
  displayName: string
  id: number
  required?: boolean
  optionValues: BigCommerceOptionValue[]
}

export interface BigCommerceOptionValue {
  id: number
  isDefault?: boolean
  label: string
  optionId?: number
}

/** Search */
export type HighlightResult<T extends Record<string, any>> = {
  [key in keyof Omit<T, '_highlightResult'>]?: {
    fullyHighlighted: boolean
    matchLevel: 'none' | 'partial' | 'full'
    matchedWords: string[]
    value: string
  }
}
export interface ShopifySearchResult extends ShopifyProduct {
  maxPrice: number
  minPrice: number
  objectId: string
  path: string
  type: string
  tags: string[]
}

export interface BigCommerceSearchResult {
  id: number
  images: BigCommerceImage[]
  name: string
  objectID: string
  path: string
  price: number
  sku: string
  _highlightResult: HighlightResult<BigCommerceProduct>
}

export type SearchResult = ShopifySearchResult | BigCommerceSearchResult
