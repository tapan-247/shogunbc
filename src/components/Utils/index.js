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

import {
  BIG_COMMERCE_REGISTER_REQUIRED_FIELDS,
  SHOPIFY_REGISTER_REQUIRED_FIELDS,
} from 'Components/Data'

/**
 * @template T
 * @param {T | 'undefined'} [value]
 * @param {T} [defaultValue]
 * @returns {T | undefined}
 */
export function normalizePropValue(value, defaultValue) {
  return value === undefined || value === 'undefined' ? defaultValue : value
}

/**
 * @typedef { import("lib/types").RegisterData } RegisterData
 *
 * @param { string } platform
 * @param { RegisterData } registerData
 * @return { boolean }
 */
export function validateRegisterData(platform, registerData) {
  if (platform === 'shopify') {
    for (const key of SHOPIFY_REGISTER_REQUIRED_FIELDS) {
      const value = registerData[key]

      if (value === undefined || value.length === 0) {
        return false
      }
    }
  }

  if (platform === 'big_commerce') {
    for (const key of BIG_COMMERCE_REGISTER_REQUIRED_FIELDS) {
      const value = registerData[key]

      if (value === undefined || value.length === 0) {
        return false
      }
    }
  }

  return true
}

/**
 * @param { string } platform
 * @param { RegisterData } registerData
 * @return { import("lib/types").PlatformRegisterData }
 */
export function denormalizeRegisterData(platform, registerData) {
  if (!validateRegisterData(platform, registerData)) {
    throw new Error(
      `Can't denormalize register form data for ${platform}. Some of the required properties are missing`,
    )
  }

  if (platform === 'shopify') {
    return {
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      email: registerData.email,
      password: registerData.password,
    }
  }

  if (platform === 'big_commerce') {
    return {
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      email: registerData.email,
      password: registerData.password,
      countryCode: registerData.countryCode,
      state: registerData.province,
      city: registerData.city,
      postalCode: registerData.zip,
      address1: registerData.address1,
      address2: registerData.address2,
    }
  }

  throw new Error(`Can't denormalize register data: unknown platform "${platform}"`)
}

/**
 * @typedef { import("lib/types").PlatformRegisterResult | undefined } PlatformRegisterResult
 * @typedef { import("lib/types").RegisterResult } RegisterResult
 *
 * @param { PlatformRegisterResult } registerResult
 * @returns { RegisterResult }
 */
export function normalizeRegisterResult(registerResult) {
  const errors = registerResult && registerResult.errors

  /** @type { RegisterResult } */
  const normalizedResult = {}

  if (Array.isArray(errors)) {
    if (errors.length > 0) {
      normalizedResult.errors = errors.map(({ message = 'n/a' }) => ({
        name: 'Register Error',
        message,
      }))
    }
  } else if (typeof errors === 'object' && errors !== null) {
    const errorEntries = Object.entries(errors)

    if (errorEntries.length > 0) {
      normalizedResult.errors = errorEntries.map(([key, message]) => ({
        name: `Register Error (${key})`,
        message,
      }))
    }
  }

  return normalizedResult
}

/**
 * @typedef { import("lib/types").Platform } Platform
 * @typedef { import("lib/types").PlatformAddress } PlatformAddress
 * @typedef { import("lib/types").ShopifyAddress } ShopifyAddress
 * @typedef { import("lib/types").BigCommerceAddress } BigCommerceAddress
 * @typedef { import("lib/types").Address } Address
 *
 * @param { Platform } platform
 * @param { Omit<Address, 'id'> } address
 */
function denormalizeAddressInput(platform, address) {
  if (platform === 'shopify') {
    /** @type {Omit<ShopifyAddress, 'id'>} */
    const shopifyAddressInput = {
      address1: address.address1,
      address2: address.address2,
      city: address.city,
      company: address.company,
      country: address.country,
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone,
      province: address.province,
      zip: address.zip,
    }

    return shopifyAddressInput
  }

  if (platform === 'big_commerce') {
    if (
      address.address1 === undefined ||
      address.city === undefined ||
      address.firstName === undefined ||
      address.lastName === undefined ||
      address.province === undefined ||
      address.zip === undefined ||
      address.countryCode === undefined
    ) {
      throw new Error(
        `Can't denormalize address input for BigCommerce: some of the required fields are missing`,
      )
    }

    /** @type {Omit<BigCommerceAddress, 'id'>} */
    const bigCommerceAddressInput = {
      address1: address.address1,
      address2: address.address2,
      city: address.city,
      company: address.company,
      countryCode: address.countryCode,
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone,
      state: address.province,
      postalCode: address.zip,
    }

    return bigCommerceAddressInput
  }

  throw new Error(`Can't denormalize address: unknown platform "${platform}"`)
}

/**
 * @param { Platform } platform
 * @param { Omit<Address, 'id'> } address
 */
export function denormalizeCreateAddressInput(platform, address) {
  return denormalizeAddressInput(platform, address)
}

/**
 * @typedef { import("lib/types").ShopifyUpdateAddressProps } ShopifyUpdateAddressProps
 * @typedef { import("lib/types").BigCommerceUpdateAddressProps } BigCommerceUpdateAddressProps
 *
 * @param { Platform } platform
 * @param { Omit<Address, 'id'> } address
 * @param { string } addressId
 */
export function denormalizeUpdateAddressInput(platform, address, addressId) {
  if (platform === 'shopify') {
    /** @type { ShopifyUpdateAddressProps } */
    const updateAddressInput = {
      id: String(addressId),
      address: denormalizeAddressInput(platform, address),
    }

    return updateAddressInput
  }

  if (platform === 'big_commerce') {
    /** @type { BigCommerceUpdateAddressProps } */
    const updateAddressInput = {
      id: Number(addressId),
      address: denormalizeAddressInput(platform, address),
    }

    return updateAddressInput
  }

  throw new Error(`Can't denormalize update address input: unknown platform "${platform}"`)
}

/**
 * @param { Platform } platform
 * @param { string } addressId
 */
export function denormalizeDeleteAddressInput(platform, addressId) {
  if (platform === 'shopify') return String(addressId)
  if (platform === 'big_commerce') return Number(addressId)

  throw new Error(`Can't denormalize delete address input: unknown platform "${platform}"`)
}

/**
 * @param {{
 *  product: Product | NormalizedCheckoutProduct
 *  productVariant?: import("lib/types").ProductVariant
 *  platform: Platform
 * }} props
 * @returns { import("frontend-checkout/dist/types").ItemId }
 */
export function denormalizeCartActionsId({ product, productVariant, platform }) {
  let productId, productVariantId

  if (isNormalizedProduct(product)) {
    productId = product && product.id
    productVariantId = productVariant && productVariant.storefrontId
  } else {
    productId = product && product.id
    productVariantId = product && product.variantId
  }

  const itemId = {
    big_commerce: productId || productVariantId,
    shopify: productVariantId || productId,
  }[platform]

  return itemId || ''
}

/**
 * @param {{
 *  product: import("lib/types").NormalizedCheckoutProduct
 *  platform: import("lib/types").Platform
 * }} props
 * @returns { import("frontend-checkout/dist/types").ItemId }
 */
export function denormalizeCartRemoveId({ product, platform }) {
  const { id, lineItemId } = product

  const removeId = {
    big_commerce: lineItemId,
    shopify: id,
  }[platform]

  return removeId || ''
}

/**
 * @param {{
 *  product: import("lib/types").NormalizedCheckoutProduct
 *  quantity: number
 *  platform: import("lib/types").Platform
 * }} props
 * @returns { import("frontend-checkout/dist/types").Item | undefined }
 */
export function denormalizeCartUpdateItem({ product, quantity, platform }) {
  const { id, lineItemId, variantId, modifiers: optionSelections = [] } = product

  const item = {
    big_commerce: { id: id || variantId, lineItemId, quantity, optionSelections },
    shopify: { id, quantity },
  }[platform]

  return item
}

/**
 * @typedef {Record< string, {value: string | undefined, required: boolean}>} Options
 * @param {import('lib/types').Product } product
 * @param {Options | undefined} options
 */
export const denormalizeOptions = (product, options) => {
  if (!options || !product || product._originalPlatform === 'shopify') return undefined

  return Object.entries(options)
    .filter(([_, { value }]) => value !== undefined)
    .map(([key, { value }]) => ({
      optionId: Number(key),
      optionValue: Number(value),
    }))
}

/**
 * @param {string} str
 * @param {RegExp} regexp
 * @returns {string[]}
 */
export function getMatchesFromString(str, regexp) {
  /** @type {string[]} */
  const results = []

  let result = regexp.exec(str)

  while (result) {
    results.push(result[1])
    result = regexp.exec(str)
  }

  return results
}

/**
 * @param {React.ReactNode[]} parts
 * @param {string} placeholder
 * @param {React.ReactNode} replacement
 * @returns {React.ReactNode[]}
 */
export function getArrayNodesReplaced(parts, placeholder, replacement) {
  /**
   * @param {React.ReactNode[]} accumulator
   * @param {React.ReactNode} currentValue
   * @param {number} currentIndex
   * @param {React.ReactNode[]} array
   * @returns {React.ReactNode[]}
   */
  const reducer = (accumulator, currentValue, currentIndex, array) => {
    accumulator.push(currentValue)

    if (currentIndex < array.length - 1) {
      accumulator = accumulator.concat(replacement)
    }

    return accumulator
  }

  /** @type {React.ReactNode[]} */
  let newResult = []

  for (const part of parts) {
    if (typeof part === 'string') {
      const subparts = part.split(placeholder).reduce(reducer, [])

      newResult = newResult.concat(subparts)
    } else {
      newResult = newResult.concat(part)
    }
  }

  return newResult
}

/**
 * @typedef {{
 *  money: string | number
 *  locales?: string | string[]
 *  options?: Intl.NumberFormatOptions
 * }} Payload
 *
 * @param {Payload} payload
 * @returns {string}
 */
export function formatMoney({ money, locales, options }) {
  if (typeof money === 'string') {
    money = Number(money)
  }

  const formatter = new Intl.NumberFormat(locales, {
    style: 'currency',
    currency: 'USD',
    ...options,
  })

  return formatter.format(money)
}

/**
 * @typedef {{
 *  date: Date | string
 *  display?: 'datetime' | 'date' | 'time'
 *  locales?: string | string[]
 *  options?: Intl.DateTimeFormatOptions
 * }} FormatDatePayload
 *
 * @param {FormatDatePayload} payload
 * @returns {string}
 */
export function formatDate({ date, display = 'datetime', locales, options }) {
  if (typeof date === 'string') {
    date = new Date(date)
  }

  switch (display) {
    case 'date':
      return date.toLocaleDateString(locales, options)

    case 'time':
      return date.toLocaleTimeString(locales, options)

    default:
      return date.toLocaleString(locales, options)
  }
}

/**
 * Type guards ⤋⤋⤋
 *
 * Customer state (accounts)
 *
 * @typedef { import("lib/types").PlatformCustomer } PlatformCustomer
 * @typedef { import("lib/types").Customer } Customer
 *
 * @param { PlatformCustomer | Customer } customer
 * @returns { customer is Customer }
 */
export function isNormalizedCustomer(customer) {
  return customer && customer.hasOwnProperty('_originalPlatform')
}

/**
 * Products & Collections
 *
 * @typedef { import("lib/types").CmsProduct } cmsProduct
 * @typedef { import("lib/types").Product } Product
 * @typedef { import("lib/types").NormalizedCheckoutProduct } NormalizedCheckoutProduct
 *
 * @param { cmsProduct | Product | NormalizedCheckoutProduct } product
 * @returns { product is Product }
 */
export function isNormalizedProduct(product) {
  return product && product.hasOwnProperty('_originalPlatform')
}

/**
 * @param { string | number } [base]
 * @returns { string }
 */
export const uniqueId = base => {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2)

  return base ? `${base}_${id}` : id
}

/**
 * @param  {number | null}  inventory,
 * @param {number | undefined}  maxQuantity,
 * @param { number | undefined}  [productMax],
 */
export const getMaxPurchaseQuantity = (inventory, maxQuantity, productMax) => {
  const max = inventory
    ? maxQuantity
      ? inventory < maxQuantity
        ? inventory
        : maxQuantity
      : inventory
    : maxQuantity

  if (productMax) {
    return max ? (max > productMax ? productMax : max) : productMax
  }

  return max
}

export default () => null
