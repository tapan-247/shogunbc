import { Order as ShopifySdkOrder } from 'frontend-customer/dist/customer-sdk/platforms/shopify/storefront-api/types/api'
import { RegisterInput } from 'frontend-customer/dist/customer-sdk/types'
import {
  ShopifySdkAddress,
  ShopifyCustomerStateProps as ShopifySdkCustomerStateProps,
  ShopifySdkRegisterProps,
  ShopifySdkGetCustomerPayload,
  ShopifySdkUpdateAddressProps,
} from 'frontend-customer/dist/customer-sdk/platforms/shopify/storefront-api/types/sdk'
import { CustomerState } from 'frontend-customer/dist/customer-hooks'
import { Customer as StorefrontCustomer } from 'frontend-customer/dist/customer-sdk/types'
import {
  BigCommerceSdkOrder,
  BigCommerceSdkAddress,
  BigCommerceSdkCustomerProps,
  BigCommerceSdkRegisterProps,
  BigCommerceSdkGetCustomerPayload,
  BigCommerceSdkUpdateAddressProps,
} from 'frontend-customer/dist/customer-sdk/platforms/big_commerce/rest/types/sdk'
import { Media, Platform, MoneyInfo } from '.'

export type PlatformCustomer = ShopifyCustomer | BigCommerceCustomer
export type PlatformRegisterData = RegisterInput<
  ShopifySdkRegisterProps | BigCommerceSdkRegisterProps
>

export type PlatformOrder = ShopifyOrder | BigCommerceOrder
export type PlatformAddress = ShopifyAddress | BigCommerceAddress

export type ShopifyCustomer = StorefrontCustomer<ShopifySdkCustomerStateProps> & {
  isLoggedIn: boolean
  status: CustomerState['status']
}
export type ShopifyOrder = ShopifySdkOrder
export type ShopifyAddress = ShopifySdkAddress

export type BigCommerceCustomer = StorefrontCustomer<BigCommerceSdkCustomerProps> & {
  isLoggedIn: boolean
  status: CustomerState['status']
}
export type BigCommerceOrder = BigCommerceSdkOrder
export type BigCommerceAddress = BigCommerceSdkAddress

export type PlatformRegisterResult =
  | ShopifySdkGetCustomerPayload
  | BigCommerceSdkGetCustomerPayload
  | { errors?: Record<string, string> }

export type ShopifyUpdateAddressProps = ShopifySdkUpdateAddressProps
export type BigCommerceUpdateAddressProps = BigCommerceSdkUpdateAddressProps

/** Shogun registration data (normalized data) */
export type RegisterData = AddressData & {
  email: string
  password: string
}

export type RegisterDataKey = keyof RegisterData

/** Shogun registration response (normalized data) */
export type RegisterResult = {
  errors?: Error[]
}

/** Shogun customer state (normalized data) */
export interface Customer {
  id?: string | number
  firstName?: string
  lastName?: string
  displayName?: string
  email?: string
  phone?: string
  isLoggedIn: boolean
  status: CustomerState['status']
  defaultAddress?: Address
  addresses?: Address[]
  orders?: Order[]
  _originalPlatform: Platform
}

/** Shogun address (normalized data) */
export type Address = {
  id: string
  address1: string
  address2?: string
  city: string
  company?: string
  country?: string
  countryCode: string
  firstName?: string
  lastName?: string
  phone?: string
  province: string
  zip: string
}

export type AddressData = Omit<Address, 'id'>
export type AddressDataKey = keyof AddressData

/** Shogun order (normalized data) */
export interface Order {
  id: string
  name: string
  financialStatus?: string
  processedAt: string
  fulfillmentStatus: string
  subtotalPrice?: MoneyInfo
  totalShippingPrice?: MoneyInfo
  totalPrice: MoneyInfo
  products: OrderProduct[]
}

export interface OrderProduct {
  title: string
  quantity: number
  originalTotalPrice: MoneyInfo
  discountedTotalPrice: MoneyInfo
  variant?: OrderProductVariant
}

export interface OrderProductVariant {
  id: string | number
  title: string
  image?: Media & {
    id: string | number
    transformedSrc: string
  }
}
