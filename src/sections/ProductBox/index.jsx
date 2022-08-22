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
import { useGoogleTagManagerActions } from '@frontend-sdk/google-tag-manager'
import { useInventory, useCartActions } from 'frontend-checkout'

import { useNormalizedProduct } from 'Components/Hooks'
import AddToCartButton from 'Components/AddToCartButton'
import Carousel from 'Components/Carousel'
import Container from 'Components/Container'
import Divider from 'Components/Divider'
import Flex from 'Components/Flex'
import FormControl from 'Components/FormControl'
import FormLabel from 'Components/FormLabel'
import Heading from 'Components/Heading'
import Icon from 'Components/Icon'
import List from 'Components/List'
import ListItem from 'Components/ListItem'
import NumberInput from 'Components/NumberInput'
import Select from 'Components/Select'
import Text from 'Components/Text'
import { getMaxPurchaseQuantity } from 'Components/Utils'

/**
 * @typedef { import("lib/types").CmsProduct } CmsProduct
 * @typedef {{
 *   product?: CmsProduct
 * }} ProductBoxProps
 *
 * @param { ProductBoxProps } props
 */
const ProductBox = ({ product: cmsProduct }) => {
  const product = useNormalizedProduct(cmsProduct)
  const { name, variants, media, description = '', options } = product || {}

  const { trackProductDetailViewEvent } = useGoogleTagManagerActions()

  React.useEffect(() => {
    if (!cmsProduct) return

    trackProductDetailViewEvent([cmsProduct])
  }, [cmsProduct, trackProductDetailViewEvent])

  const { currentVariant, currentOptions, handleOptionChange } = useVariants(variants, options)

  const { quantity, handleProductQuantity } = useProductQuantity(product, currentVariant)

  if (!product) return null

  const price = (currentVariant && currentVariant.price) || (product && product.price)

  return (
    <Container constrainContent as="section" variant="section-wrapper">
      <Flex flexDirection={{ base: 'column', lg: 'row' }} pt={10}>
        <Container w={{ base: '100%', lg: '65%' }}>
          <Carousel media={media} />
        </Container>

        <Container w={{ base: '100%', lg: '35%' }}>
          <Heading as="h1" size="lg" mb="3">
            {name}
          </Heading>

          <Text as="strong" display="block" fontSize="lg" mb="3">
            ${price}
          </Text>

          <Container
            mb={{ base: '5', md: '8' }}
            dangerouslySetInnerHTML={{ __html: description }}
          />

          <Divider />

          {options &&
            options.map(({ id, displayName, optionValues, required, defaultValue }) => {
              return optionValues.length > 1 ? (
                <FormControl
                  mt={4}
                  key={`${displayName}-${id}`}
                  id={`${displayName}-${id}`}
                  isRequired={required}
                >
                  <FormLabel textTransform="capitalize">{displayName}</FormLabel>
                  <Select
                    options={optionValues}
                    onChange={event => handleOptionChange(id)(event)}
                    placeholder={`Select ${displayName}`}
                    defaultValue={defaultValue}
                  />
                </FormControl>
              ) : null
            })}

          <Container mt={4} as={FormControl} id="product-quantity">
            <FormLabel>Quantity</FormLabel>
            <NumberInput
              min={quantity.min}
              max={quantity.max}
              value={quantity.quantity}
              inputProps={{ 'aria-label': 'Product quantity' }}
              onChange={handleProductQuantity}
            />
          </Container>

          <Container mt={{ base: '5', md: '8' }} mb={{ base: '5', md: '10' }}>
            <AddToCartButton
              product={product}
              productVariant={currentVariant}
              quantity={quantity.quantity}
              options={currentOptions}
              availability={quantity.availability}
              isLoading={quantity.status === 'loading'}
            />
          </Container>

          <Container variant="solid">
            <List>
              <ListItem mb={3}>
                <Icon icon="ArrowRightIcon" mr="2" /> Free shipping + returns
              </ListItem>
              <ListItem mb={3}>
                <Icon icon="CheckIcon" mr="2" /> Extended warranty
              </ListItem>
              <ListItem>
                <Icon icon="QuestionOutlineIcon" mr="2" /> We’re here for you 24/7
              </ListItem>
            </List>
          </Container>
        </Container>
      </Flex>
    </Container>
  )
}

/**
 * @typedef { import('lib/types').ProductVariant } ProductVariant
 * @typedef { import('lib/types').ProductOption } ProductOption
 * @typedef { import('lib/types').ProductOptionValue } ProductOptionValue
 *
 * @typedef { Record<string, {value: string | undefined, required: boolean}> } OptionState
 *
 * @param { ProductVariant[] | undefined } variants
 * @param { ProductOption[] | undefined } options
 *
 * @returns {{
 *  currentVariant: ProductVariant | undefined,
 *  handleOptionChange: ((id: string)=> (event: React.ChangeEvent<HTMLSelectElement>)=> void)
 *  currentOptions: OptionState | undefined
 * }}
 */
function useVariants(variants, options) {
  /** @type { [ProductVariant | undefined, React.Dispatch<React.SetStateAction<ProductVariant | undefined>>] } */
  const [currentVariant, setCurrentVariant] = React.useState(variants && variants[0])

  /** @type { [OptionState | undefined, React.Dispatch<React.SetStateAction<OptionState | undefined>>] } */
  const [currentOptions, setCurrentOptions] = React.useState(
    () =>
      options &&
      options.reduce((/** @type {OptionState} */ state, option) => {
        state[option.id] = {
          value:
            option.optionValues.length === 1 ? option.optionValues[0].value : option.defaultValue,
          required: option.required,
        }

        return state
      }, {}),
  )

  React.useEffect(() => {
    if (!currentOptions || !variants) return

    const newVariant = variants.find(({ optionValues = [] }) =>
      optionValues.every(
        ({ optionId, value }) =>
          currentOptions.hasOwnProperty(optionId) && currentOptions[optionId].value === value,
      ),
    )

    setCurrentVariant(newVariant)
  }, [currentOptions, variants])

  /** @type {((id: number | string)=> (event: React.ChangeEvent<HTMLSelectElement>)=> void)} */
  const handleOptionChange = React.useCallback(
    id => event => {
      setCurrentOptions(previousOptions => {
        if (previousOptions) {
          const newOptions = { ...previousOptions }

          newOptions[id].value = event.target.value || undefined

          return newOptions
        }

        return previousOptions
      })
    },
    [],
  )

  return {
    currentVariant,
    handleOptionChange,
    currentOptions,
  }
}

/**
 * @typedef { {quantity: number,min: number, max: number, availability: boolean, status: string} } QuantityState
 * @typedef { (_:never, quantity: number) => void } ProductInputHandler
 *
 * @param { import('lib/types').Product | null } product
 * @param { import('lib/types').ProductVariant | undefined  } currentVariant
 *
 * @returns { {quantity: QuantityState, handleProductQuantity: ProductInputHandler} }
 */
const useProductQuantity = (product, currentVariant) => {
  const { getProductMinOrder, getProductMaxOrder } = useCartActions()
  const MIN_QUANTITY = 1
  const MAX_QUANTITY = 10

  const [inventoryState, setInventoryState] = React.useState(() => ({
    quantity: MIN_QUANTITY,
    product: { min: MIN_QUANTITY, max: MAX_QUANTITY, availability: true, status: 'loading' },
    variants:
      (product &&
        product.variants &&
        product.variants.map(variant => ({
          id: variant.storefrontId,
          min: MIN_QUANTITY,
          max: MAX_QUANTITY,
          availability: true,
          status: 'loading',
        }))) ||
      [],
  }))

  const { productData, variantData } = React.useMemo(() => {
    if (!product) return { productData: undefined, variantData: undefined }

    /**@type { {ids: (string | number)[], productType: 'Product'} } */
    const productData = { ids: product.id ? [product.id] : [], productType: 'Product' }

    const variantIds = product.variants ? product.variants.map(variant => variant.storefrontId) : []

    /**@type { {ids: (string | number)[], productType: 'ProductVariant'} } */
    const variantData = { ids: variantIds, productType: 'ProductVariant' }

    return { productData, variantData }
  }, [product])

  const { products: productInventory, status: productStatus } = useInventory(
    productData ? productData : { ids: [] },
  )
  const { products: variantInventory, status: variantStatus } = useInventory(
    variantData ? variantData : { ids: [] },
  )

  React.useEffect(() => {
    if (productStatus === 'loading' || variantStatus === 'loading') return

    const getMinMaxQuantity = async (
      /** @type {number | string} */ id,
      /** @type {'ProductVariant' | 'Product'} */ type,
      /** @type { import('lib/types').Product['inventoryTracking']} */ inventoryTracking,
    ) => {
      const minQuantity = await getProductMinOrder({ id, type })

      const maxQuantity = await getProductMaxOrder({ id, type })

      const inventoryObject = type === 'Product' ? productInventory : variantInventory
      const status = type === 'Product' ? productStatus : variantStatus

      const { availableForSale, quantity: inventory } = inventoryObject[id] || {}

      const availability = () => {
        if (availableForSale) {
          if (inventoryTracking === 'variant' && type === 'ProductVariant') {
            if (inventory !== null) {
              return inventory > 0
            }

            return false
          }
          if (inventoryTracking === 'product' && type === 'Product') {
            if (inventory !== null) {
              return inventory > 0
            }

            return false
          }

          return !inventoryTracking || inventoryTracking === 'none'
        }

        return false
      }

      setInventoryState(prevState => {
        if (type === 'Product') {
          return {
            ...prevState,
            product: {
              status,
              min: minQuantity || MIN_QUANTITY,
              max: getMaxPurchaseQuantity(inventory, maxQuantity) || MAX_QUANTITY,
              availability: availability(),
            },
          }
        }

        return {
          ...prevState,
          variants: [
            ...prevState.variants.filter(variant => variant.id !== id),
            {
              id,
              status,
              min: minQuantity || MIN_QUANTITY,
              max:
                getMaxPurchaseQuantity(inventory, maxQuantity, prevState.product.max) ||
                MAX_QUANTITY,
              availability: availability(),
            },
          ],
        }
      })
    }

    if (product && productData && productData.ids[0]) {
      getMinMaxQuantity(productData.ids[0], 'Product', product.inventoryTracking)
    }
    if (product && variantData) {
      Promise.all(
        variantData.ids.map(id =>
          getMinMaxQuantity(id, variantData.productType, product.inventoryTracking),
        ),
      )
    }
  }, [
    productInventory,
    variantInventory,
    productData,
    variantData,
    productStatus,
    variantStatus,
    getProductMinOrder,
    getProductMaxOrder,
    product,
  ])

  /**
   * @param { never } _
   * @param { number } quantityAsNumber
   */
  const handleProductQuantity = React.useCallback(
    (_, quantityAsNumber) => {
      if (quantityAsNumber === inventoryState.quantity) return

      setInventoryState(prevState => ({ ...prevState, quantity: quantityAsNumber }))
    },
    [inventoryState],
  )

  /** @type {QuantityState} */
  const quantityState = React.useMemo(() => {
    const baseState = {
      min: MIN_QUANTITY,
      max: MAX_QUANTITY,
      availability: true,
      status: 'loaded',
    }

    if (product) {
      if (product.inventoryTracking === 'product') {
        return {
          quantity: inventoryState.quantity,
          ...inventoryState.product,
        }
      }

      if (product.inventoryTracking === 'variant' && currentVariant) {
        const variantQuantity =
          inventoryState.variants.find(({ id }) => id === currentVariant.storefrontId) || baseState

        return {
          quantity: inventoryState.quantity,
          ...variantQuantity,
        }
      }
    }

    return {
      quantity: inventoryState.quantity,
      ...baseState,
    }
  }, [product, inventoryState, currentVariant])

  return { quantity: quantityState, handleProductQuantity }
}

export default ProductBox
