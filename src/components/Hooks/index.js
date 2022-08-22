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
import { isNormalizedCustomer, isNormalizedProduct, uniqueId } from 'Components/Utils'
import frontendConfig from 'frontend-config'
import {
  getCodeByCountry,
  GRAPHQL_API_TYPE,
  MANAGEMENT_API_TYPE,
  REST_API_TYPE,
} from 'Components/Data'

const feConfig = frontendConfig()

export const publicRuntimeConfig = feConfig.publicRuntimeConfig
export const serverRuntimeConfig = feConfig.serverRuntimeConfig

/**@param {string | number} price */
export const useNormalizedCartPrice = price => {
  const [platform, apiType] = usePlatform()

  if (platform === 'shopify' && apiType === 'rest') {
    return (Number(price) / 100).toFixed(2)
  }

  return price
}

/**
 * @typedef { import("lib/types").Platform } Platform
 * @typedef { import('lib/types').ApiType } ApiType
 */
export function usePlatform() {
  const { storePlatform, storePlatformApiType } = publicRuntimeConfig

  if (storePlatform !== 'shopify' && storePlatform !== 'big_commerce') {
    throw new Error(`Unsupported platform ${storePlatform}`)
  }

  if (
    storePlatformApiType !== GRAPHQL_API_TYPE &&
    storePlatformApiType !== REST_API_TYPE &&
    storePlatformApiType !== MANAGEMENT_API_TYPE
  ) {
    throw new Error(`Unsupported API type ${storePlatformApiType}`)
  }

  if (
    storePlatform === 'big_commerce' &&
    ![GRAPHQL_API_TYPE, MANAGEMENT_API_TYPE].includes(storePlatformApiType)
  ) {
    throw new Error(`Unsupported API type for BigCommerce ${storePlatformApiType}`)
  }

  /** @type { React.MutableRefObject<[Platform, ApiType]> } */
  const platform = React.useRef([storePlatform, storePlatformApiType])

  return platform.current
}

export function useIsMounted() {
  const isMounted = React.useRef(false)

  React.useLayoutEffect(() => {
    isMounted.current = true

    return () => {
      isMounted.current = false
    }
  }, [])

  return isMounted
}

export function useIsFirstRender() {
  const isFirstRender = React.useRef(true)

  React.useEffect(() => {
    setTimeout(() => {
      isFirstRender.current = false
    }, 0)
  }, [])

  return isFirstRender
}

/**
 * @param { import('lib/types').SearchResult[] | Product[] } products
 * @returns { Product[] | [] }
 * */
export const useNormalizedSearchResults = products => {
  const [platform] = usePlatform()

  return React.useMemo(() => {
    if (!products) return []

    /** @type {Product[]} */
    // @ts-ignore
    const normalizedProducts = products

    if (normalizedProducts.every(isNormalizedProduct)) return normalizedProducts

    if (platform === 'shopify') {
      /**@type {import('lib/types').ShopifySearchResult[]} */
      // @ts-ignore
      const shopifyProducts = products

      /** @type {Product[]} */
      const normalizedProducts = shopifyProducts.map(shopifyProduct => ({
        id: shopifyProduct.externalId,
        name: shopifyProduct.name,
        slug: `/${shopifyProduct.slug}/`,
        description: shopifyProduct.descriptionHtml || shopifyProduct.description,
        media: shopifyProduct.media.map(({ _id, details }) => ({ id: _id, ...details })),
        variants: shopifyProduct.variants.map(({ storefrontId, name, price, sku }) => ({
          storefrontId,
          name,
          price,
          sku,
        })),
        options: [],
        thumbnail: shopifyProduct.thumbnail,
        metaTitle: '',
        metaDescription: '',
        searchResult: shopifyProduct._highlightResult
          ? {
              name: shopifyProduct._highlightResult.name,
              description: shopifyProduct._highlightResult.description,
            }
          : undefined,
        _originalPlatform: 'shopify',
      }))

      return normalizedProducts
    }

    if (platform === 'big_commerce') {
      /** @type {import('lib/types').BigCommerceSearchResult[]} */
      // @ts-ignore
      const bigCommerceProducts = products

      /** @type {Product[]} */
      const normalizedProducts = bigCommerceProducts.map(bigCommerceProduct => ({
        id: bigCommerceProduct.id,
        name: bigCommerceProduct.name,
        slug: `${bigCommerceProduct.path.slice(9)}/`,
        description: '',
        variants: [
          {
            storefrontId: '',
            name: bigCommerceProduct.name,
            sku: bigCommerceProduct.sku,
            price: bigCommerceProduct.price,
          },
        ],
        media: bigCommerceProduct.images.map(({ _id, media }) => ({
          id: _id,
          ...media,
        })),
        options: [],
        metaTitle: '',
        metaDescription: '',
        searchResult: bigCommerceProduct._highlightResult
          ? {
              name: bigCommerceProduct._highlightResult.name,
              description: bigCommerceProduct._highlightResult.description,
            }
          : undefined,
        _originalPlatform: 'big_commerce',
      }))

      return normalizedProducts
    }

    throw new Error('Unknown Product type. Only Shopify and BigCommerce platforms are supported')
  }, [platform, products])
}

/**
 * @typedef { import("lib/types").Product } Product
 * @typedef { import("lib/types").ShopifyProduct } ShopifyProduct
 * @typedef { import("lib/types").BigCommerceProduct } BigCommerceProduct
 * @typedef { import("lib/types").CmsProduct } CmsProduct
 *
 * @param { CmsProduct | Product | null | undefined } product
 */
export function useNormalizedProduct(product) {
  const [platform] = usePlatform()

  return React.useMemo(() => {
    if (!product) return null

    if (isNormalizedProduct(product)) return product

    if (platform === 'shopify') {
      /** @type { ShopifyProduct } */
      // @ts-ignore
      const shopifyProduct = product

      const variantsOptionId = uniqueId(shopifyProduct.name)

      const shopifyVariants = shopifyProduct.variants.map(({ storefrontId, name, price, sku }) => {
        return {
          storefrontId,
          name,
          price,
          sku,
          optionValues: [{ optionId: variantsOptionId, value: String(storefrontId), text: name }],
        }
      })

      /** @type { Product } */
      const normalizedProduct = {
        id: shopifyProduct.externalId,
        name: shopifyProduct.name,
        slug: `/${shopifyProduct.slug}/`,
        description: shopifyProduct.descriptionHtml || shopifyProduct.description,
        media: shopifyProduct.media.map(({ _id, details }) => ({ id: _id, ...details })),
        variants: shopifyVariants,
        options: [
          {
            id: variantsOptionId,
            displayName: 'Variant',
            defaultValue: String(shopifyVariants[0].storefrontId),
            optionValues: shopifyVariants.map(({ name, storefrontId }) => ({
              text: name,
              value: String(storefrontId),
            })),
            required: true,
          },
        ],
        inventoryTracking: 'variant',
        thumbnail: shopifyProduct.thumbnail,
        metaTitle: shopifyProduct.metaTitle,
        metaDescription: shopifyProduct.metaDescription,
        searchResult: shopifyProduct._highlightResult
          ? {
              name: shopifyProduct._highlightResult.name,
              description: shopifyProduct._highlightResult.description,
            }
          : undefined,
        _originalPlatform: 'shopify',
      }

      return normalizedProduct
    }

    if (platform === 'big_commerce') {
      /** @type { BigCommerceProduct } */
      // @ts-ignore
      const bigCommerceProduct = product

      const variantOptions = bigCommerceProduct.options
        ? bigCommerceProduct.options.map(option => ({
            ...option,
            required: true,
          }))
        : []

      const modifierOptions = bigCommerceProduct.modifiers || []

      const bigCommerceOptions = [...variantOptions, ...modifierOptions].map(
        ({ optionValues, required = false, id, displayName }) => {
          const defaultOption = optionValues.find(option => option.isDefault === true)

          return {
            id: String(id),
            displayName,
            required,
            defaultValue: defaultOption && String(defaultOption.id),
            optionValues: optionValues.map(({ label = '', id }) => ({
              text: label,
              value: String(id),
            })),
          }
        },
      )

      /** @type { Product } */
      const normalizedProduct = {
        id: bigCommerceProduct.id,
        name: bigCommerceProduct.name,
        slug: bigCommerceProduct.url,
        description: bigCommerceProduct.description,
        price: bigCommerceProduct.price,
        media: bigCommerceProduct.images.map(({ _id, media }) => ({
          id: _id,
          ...media,
        })),
        variants: bigCommerceProduct.variants.map(({ id, price, sku, optionValues }) => ({
          storefrontId: id,
          name: sku,
          price,
          sku,
          optionValues:
            optionValues &&
            optionValues.map(({ id, label, optionId }) => ({
              text: label,
              value: String(id),
              optionId: String(optionId),
            })),
        })),
        options: bigCommerceOptions,
        inventoryTracking: bigCommerceProduct.inventoryTracking,
        metaTitle: bigCommerceProduct.page_title,
        metaDescription: bigCommerceProduct.meta_description,
        searchResult: bigCommerceProduct._highlightResult
          ? {
              name: bigCommerceProduct._highlightResult.name,
              description: bigCommerceProduct._highlightResult.description,
            }
          : undefined,
        _originalPlatform: 'big_commerce',
      }

      return normalizedProduct
    }

    throw new Error('Unknown Product type. Only Shopify and BigCommerce platforms are supported')
  }, [platform, product])
}

/**
 * @typedef { import("lib/types").CmsCollection } CmsCollection
 * @typedef { import("lib/types").ShopifyCollection } ShopifyCollection
 * @typedef { import("lib/types").BigCommerceCategory } BigCommerceCategory
 * @typedef { import("lib/types").Collection } Collection
 *
 * @param { CmsCollection | null | undefined } cmsCollection
 * @returns { Collection | null }
 */
export function useNormalizedCollection(cmsCollection) {
  const [platform] = usePlatform()

  if (!cmsCollection) return null

  /** @type { Partial<Collection> } */
  const normalizedCollection = {
    name: '',
    slug: '',
    description: '',
    image: undefined,
    products: [],
  }

  if (platform === 'shopify') {
    /** @type { ShopifyCollection } */
    // @ts-ignore
    const shopifyCollection = cmsCollection

    return {
      ...normalizedCollection,
      name: shopifyCollection.name,
      slug: shopifyCollection.slug,
      description: shopifyCollection.descriptionHtml || shopifyCollection.description,
      image: shopifyCollection.image,
      products: shopifyCollection.products,
    }
  }

  if (platform === 'big_commerce') {
    /** @type { BigCommerceCategory } */
    // @ts-ignore
    const bigCommerceCollection = cmsCollection

    return {
      ...normalizedCollection,
      name: bigCommerceCollection.name,
      slug: `/${bigCommerceCollection.url}/`,
      description: bigCommerceCollection.description,
      image: bigCommerceCollection.image,
      products: bigCommerceCollection.products,
    }
  }

  throw new Error(
    'Unknown Collection/Category type. Only Shopify and BigCommerce platforms are supported.',
  )
}

/**
 * @typedef { import("lib/types").CheckoutProduct } CheckoutProduct
 * @typedef { import("lib/types").CheckoutShopifyProduct } CheckoutShopifyProduct
 * @typedef { import("lib/types").CheckoutBigCommerceProduct } CheckoutBigCommerceProduct
 * @typedef { import("lib/types").NormalizedCheckoutProduct } NormalizedCheckoutProduct
 *
 * @param { CheckoutProduct | null | undefined } checkoutProduct
 * @returns { NormalizedCheckoutProduct | null }
 */
export function useNormalizedCheckoutProduct(checkoutProduct) {
  const [platform, apiType] = usePlatform()

  if (!checkoutProduct) return null

  const initialParams = {
    lineItemId: '',
    subtitle: '',
    price: '',
    variantId: '',
    imageUrl: '',
    slug: '',
  }

  if (platform === 'shopify') {
    /** @type { CheckoutShopifyProduct } */
    // @ts-ignore
    const shopifyCheckoutProduct = checkoutProduct

    /** @type { Partial<NormalizedCheckoutProduct> } */
    const productVariant =
      apiType === GRAPHQL_API_TYPE && shopifyCheckoutProduct.variant
        ? {
            subtitle: shopifyCheckoutProduct.variant.title,
            price: shopifyCheckoutProduct.variant.price,
            variantId: shopifyCheckoutProduct.variant.id,
            imageUrl:
              shopifyCheckoutProduct.variant.image && shopifyCheckoutProduct.variant.image.src,
            slug:
              shopifyCheckoutProduct.variant.product &&
              shopifyCheckoutProduct.variant.product.handle,
          }
        : {
            subtitle: shopifyCheckoutProduct.title,
            price: shopifyCheckoutProduct.price && (shopifyCheckoutProduct.price / 100).toFixed(2),
            variantId: shopifyCheckoutProduct.variant_id,
            imageUrl: shopifyCheckoutProduct.image,
            slug: shopifyCheckoutProduct.handle,
          }

    return {
      ...initialParams,
      ...productVariant,
      id: shopifyCheckoutProduct.id,
      title: shopifyCheckoutProduct.title,
      quantity: shopifyCheckoutProduct.quantity,
    }
  }

  if (platform === 'big_commerce') {
    /** @type { CheckoutBigCommerceProduct } */
    // @ts-ignore
    const bigCommerceCheckoutProduct = checkoutProduct

    return {
      ...initialParams,
      id: bigCommerceCheckoutProduct.id,
      lineItemId: bigCommerceCheckoutProduct.lineItemId,
      title: bigCommerceCheckoutProduct.name,
      subtitle: bigCommerceCheckoutProduct.brand,
      price: bigCommerceCheckoutProduct.listPrice,
      quantity: bigCommerceCheckoutProduct.quantity,
      variantId: bigCommerceCheckoutProduct.variantId,
      imageUrl: bigCommerceCheckoutProduct.imageUrl,
      modifiers: bigCommerceCheckoutProduct.optionSelections,
    }
  }

  throw new Error(
    'Unknown CheckoutProduct type. Only Shopify and BigCommerce platforms are supported.',
  )
}

/**
 * @typedef { import("lib/types").PlatformCustomer } PlatformCustomer
 * @typedef { import("lib/types").ShopifyCustomer } ShopifyCustomer
 * @typedef { import("lib/types").BigCommerceCustomer } BigCommerceCustomer
 * @typedef { import("lib/types").PlatformAddress } PlatformAddress
 * @typedef { import("lib/types").ShopifyAddress } ShopifyAddress
 * @typedef { import("lib/types").BigCommerceAddress } BigCommerceAddress
 * @typedef { import("lib/types").PlatformOrder } PlatformOrder
 * @typedef { import("lib/types").ShopifyOrder } ShopifyOrder
 * @typedef { import("lib/types").BigCommerceOrder } BigCommerceOrder
 * @typedef { import("lib/types").Customer } Customer
 * @typedef { import("lib/types").Order } Order
 * @typedef { import("lib/types").Address } Address
 * @typedef { import("lib/types").OrderProduct } OrderProduct
 *
 * @param { PlatformCustomer | Customer } customer
 */
export function useNormalizedCustomer(customer) {
  const [platform] = usePlatform()

  return React.useMemo(() => {
    if (isNormalizedCustomer(customer)) return customer

    if (!customer.isLoggedIn) {
      /** @type { Customer } */
      const normalizedCustomer = {
        isLoggedIn: customer.isLoggedIn,
        status: customer.status,
        _originalPlatform: 'shopify',
      }

      return normalizedCustomer
    }

    if (platform === 'shopify') {
      /** @type { ShopifyCustomer } */
      // @ts-ignore
      const shopifyCustomer = customer

      /** @type { ShopifyOrder[] } */
      // @ts-ignore
      const shopifyCustomerOrders = shopifyCustomer.orders

      /** @type { ShopifyAddress[] } */
      // @ts-ignore
      const shopifyCustomerAddresses = shopifyCustomer.addresses

      /**
       * @param { ShopifyAddress } address
       * @returns { Address }
       */
      const normalizeAddress = address => {
        if (
          address.address1 === undefined ||
          address.country === undefined ||
          address.city === undefined ||
          address.zip === undefined
        ) {
          throw new Error(`Can't normalize Shopify address: some of the fields are missing`)
        }

        return {
          id: address.id,
          address1: address.address1,
          address2: address.address2,
          city: address.city,
          company: address.company,
          country: address.country,
          countryCode: getCodeByCountry(address.country),
          firstName: address.firstName,
          lastName: address.lastName,
          phone: address.phone,
          province: address.province || 'n/a',
          zip: address.zip,
        }
      }

      /**
       * @param { ShopifyOrder } order
       * @returns { Order }
       */
      const normalizeOrder = order => {
        /** @type { Order } */
        const normalizedOrder = {
          id: order.id,
          name: order.name,
          processedAt: order.processedAt,
          fulfillmentStatus: order.fulfillmentStatus,
          totalPrice: order.totalPriceV2,
          products: order.lineItems.edges.map(({ node: product }) => {
            const { variant } = product
            const { image: variantImage } = variant

            return {
              title: product.title,
              quantity: product.quantity,
              originalTotalPrice: product.originalTotalPrice,
              discountedTotalPrice: product.discountedTotalPrice,
              variant: {
                id: variant.id,
                title: variant.title,
                image: {
                  id: variantImage.id,
                  name: 'n/a',
                  src: variantImage.originalSrc,
                  transformedSrc: variantImage.transformedSrc,
                  alt: variantImage.altText,
                  width: variantImage.width,
                  height: variantImage.height,
                },
              },
            }
          }),
        }

        if (order.financialStatus !== null) {
          normalizedOrder.financialStatus = order.financialStatus
        }

        if (order.subtotalPriceV2 !== null) {
          normalizedOrder.subtotalPrice = order.subtotalPriceV2
        }

        if (order.totalShippingPriceV2 !== null) {
          normalizedOrder.totalShippingPrice = order.totalShippingPriceV2
        }

        return normalizedOrder
      }

      /** @type { Customer } */
      const normalizedCustomer = {
        isLoggedIn: shopifyCustomer.isLoggedIn,
        status: shopifyCustomer.status,
        _originalPlatform: 'shopify',
      }

      if (shopifyCustomer.id !== null) {
        normalizedCustomer.id = shopifyCustomer.id
      }

      if (shopifyCustomer.firstName !== null) {
        normalizedCustomer.firstName = shopifyCustomer.firstName
      }

      if (shopifyCustomer.lastName !== null) {
        normalizedCustomer.lastName = shopifyCustomer.lastName
      }

      if (shopifyCustomerAddresses !== null) {
        const defaultAddress = shopifyCustomerAddresses.find(address => address.isDefault === true)

        if (defaultAddress) {
          normalizedCustomer.defaultAddress = normalizeAddress(defaultAddress)
        }
      }

      if (shopifyCustomer.email !== null) {
        normalizedCustomer.email = shopifyCustomer.email
      }

      if (shopifyCustomer.phone !== null) {
        normalizedCustomer.phone = shopifyCustomer.phone
      }

      if (shopifyCustomerAddresses !== null) {
        normalizedCustomer.addresses = shopifyCustomerAddresses.map(normalizeAddress)
      }

      if (shopifyCustomerOrders !== null) {
        normalizedCustomer.orders = shopifyCustomerOrders.map(normalizeOrder)
      }

      return normalizedCustomer
    }

    if (platform === 'big_commerce') {
      /** @type { BigCommerceCustomer } */
      // @ts-ignore
      const bigCommerceCustomer = customer

      /** @type { BigCommerceOrder[] } */
      // @ts-ignore
      const bigCommerceCustomerOrders = bigCommerceCustomer.orders

      /** @type { BigCommerceAddress[] } */
      // @ts-ignore
      const bigCommerceCustomerAddresses = bigCommerceCustomer.addresses

      /**
       * @param { BigCommerceAddress } address
       * @returns { Address }
       */
      const normalizeAddress = address => {
        return {
          id: address.id,
          address1: address.address1,
          address2: address.address2,
          city: address.city,
          company: address.company,
          country: address.country,
          countryCode: address.countryCode,
          firstName: address.firstName,
          lastName: address.lastName,
          phone: address.phone,
          province: address.state,
          zip: address.postalCode,
        }
      }

      /**
       * @param { BigCommerceOrder } order
       * @returns { Order }
       */
      const normalizeOrder = order => {
        const { defaultCurrencyCode, currencyCode = defaultCurrencyCode } = order

        /** @type { Order } */
        const normalizedOrder = {
          id: order.id.toString(),
          name: `#${order.id}`,
          processedAt: order.dateCreated,
          fulfillmentStatus: order.status,
          totalPrice: { amount: order.totalIncTax, currencyCode },
          products: order.products.map(product => {
            const { appliedDiscounts = [], productOptions = [] } = product

            const totalDiscount = appliedDiscounts.reduce(
              (accumulator, { amount }) => accumulator + Number(amount),
              0,
            )

            /** @type { OrderProduct } */
            const normalizedProduct = {
              title: product.name,
              quantity: product.quantity,
              originalTotalPrice: { amount: product.totalIncTax, currencyCode },
              discountedTotalPrice: {
                amount: String(Number(product.totalIncTax) - totalDiscount),
                currencyCode,
              },
            }

            const variantTitle = productOptions
              .map(
                ({ display_name_customer, display_value_customer }) =>
                  `${display_name_customer}: ${display_value_customer}`,
              )
              .join(', ')

            if (variantTitle.length > 0) {
              normalizedProduct.variant = {
                id: 'n/a',
                title: variantTitle,
              }
            }

            return normalizedProduct
          }),
        }

        if (order.paymentStatus !== null) {
          normalizedOrder.financialStatus = order.paymentStatus
        }

        if (order.subtotalIncTax !== null) {
          normalizedOrder.subtotalPrice = { amount: order.subtotalIncTax, currencyCode }
        }

        if (order.shippingCostIncTax !== null) {
          normalizedOrder.totalShippingPrice = { amount: order.shippingCostIncTax, currencyCode }
        }

        return normalizedOrder
      }

      /** @type { Customer } */
      const normalizedCustomer = {
        isLoggedIn: bigCommerceCustomer.isLoggedIn,
        status: bigCommerceCustomer.status,
        _originalPlatform: 'big_commerce',
      }

      if (bigCommerceCustomer.id !== null) {
        normalizedCustomer.id = bigCommerceCustomer.id
      }

      if (bigCommerceCustomer.firstName !== null) {
        normalizedCustomer.firstName = bigCommerceCustomer.firstName
      }

      if (bigCommerceCustomer.lastName !== null) {
        normalizedCustomer.lastName = bigCommerceCustomer.lastName
      }

      if (bigCommerceCustomerAddresses !== null && bigCommerceCustomerAddresses.length > 0) {
        normalizedCustomer.defaultAddress = normalizeAddress(bigCommerceCustomerAddresses[0])
      }

      if (bigCommerceCustomer.email !== null) {
        normalizedCustomer.email = bigCommerceCustomer.email
      }

      if (bigCommerceCustomer.phone !== null) {
        normalizedCustomer.phone = bigCommerceCustomer.phone
      }

      if (bigCommerceCustomerAddresses !== null) {
        normalizedCustomer.addresses = bigCommerceCustomerAddresses.map(normalizeAddress)
      }

      if (bigCommerceCustomerOrders !== null) {
        normalizedCustomer.orders = bigCommerceCustomerOrders.map(normalizeOrder)
      }

      return normalizedCustomer
    }

    throw new Error('Unknown customer type. Only Shopify and BigCommerce platforms are supported')
  }, [platform, customer])
}

export default () => null
