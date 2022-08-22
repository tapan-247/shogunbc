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
import { useMultiStyleConfig } from '@chakra-ui/react'
import { useCartActions, useInventory } from 'frontend-checkout'
import { useGoogleTagManagerActions } from '@frontend-sdk/google-tag-manager'
import { useIsMounted, useNormalizedCheckoutProduct, usePlatform } from 'Components/Hooks'
import {
  denormalizeCartRemoveId,
  denormalizeCartUpdateItem,
  formatMoney,
  getMaxPurchaseQuantity,
} from 'Components/Utils'
import Flex from 'Components/Flex'
import Grid from 'Components/Grid'
import GridItem from 'Components/GridItem'
import Heading from 'Components/Heading'
import Icon from 'Components/Icon'
import IconButton from 'Components/IconButton'
import Image from 'Components/Image'
import Link from 'Components/Link'
import NumberInput from 'Components/NumberInput'
import Text from 'Components/Text'

const PRODUCT_MAX_QUANTITY = 150
const PRODUCT_MIN_QUANTITY = 1

/**
 * @typedef { import('lib/types').CheckoutProduct } CheckoutProduct
 * @typedef {{
 *  product: CheckoutProduct
 *  inDrawer?: boolean
 * }} CartItemProps
 *
 * @param { CartItemProps } props
 */
const CartItem = ({ product: checkoutProduct, inDrawer }) => {
  const product = useNormalizedCheckoutProduct(checkoutProduct)

  if (!product) throw new Error(`Expected product but got ${product}.`)

  const { title, subtitle, price, quantity, imageUrl, slug, id: productId, variantId } = product
  const productUrl = slug ? `/products/${slug}` : '#'

  const { trackRemoveFromCartEvent } = useGoogleTagManagerActions()
  const [platform] = usePlatform()
  const isMounted = useIsMounted()
  const { removeItems, updateItems, getProductMinOrder, getProductMaxOrder } = useCartActions()

  const [soldOut, setSoldOut] = React.useState(false)
  const [quantityState, setQuantityState] = React.useState(() => ({
    min: PRODUCT_MIN_QUANTITY,
    max: PRODUCT_MAX_QUANTITY,
    quantity: quantity || 1,
  }))

  const { products, status } = useInventory({ ids: [productId] })
  const { products: variants, status: variantStatus } = useInventory({
    ids: [variantId],
    productType: 'ProductVariant',
  })

  React.useEffect(() => {
    if (!isMounted.current || status === 'loading' || variantStatus === 'loading') return

    const getMinMaxOrder = async () => {
      const { availableForSale: productAvailable, quantity: productInventory } =
        products[productId] || {}
      const { availableForSale: variantAvailable, quantity: variantInventory } =
        variants[variantId] || {}

      const inventory = variantInventory || productInventory
      const availability = variantAvailable || productAvailable

      const minOrder = await getProductMinOrder({ id: productId })
      const maxVariantOrder = await getProductMaxOrder({ id: variantId, type: 'ProductVariant' })
      const maxProductOrder = await getProductMaxOrder({ id: productId })

      const max = getMaxPurchaseQuantity(inventory, maxVariantOrder, maxProductOrder)

      setSoldOut(availability ? (max ? max === 0 : false) : true)

      setQuantityState(prevState => ({
        ...prevState,
        min: minOrder || PRODUCT_MIN_QUANTITY,
        max: max || PRODUCT_MAX_QUANTITY,
      }))
    }

    getMinMaxOrder()
  }, [
    getProductMaxOrder,
    getProductMinOrder,
    isMounted,
    products,
    productId,
    variantId,
    status,
    variantStatus,
    variants,
  ])

  React.useEffect(() => {
    setQuantityState(prevState => ({ ...prevState, quantity }))
  }, [quantity])

  /**
   * @param {string} _
   * @param {number} quantityAsNumber
   */
  const onChangeItemQuantity = React.useCallback(
    (_, quantityAsNumber) => {
      if (quantityState.quantity === quantityAsNumber) return

      const item = denormalizeCartUpdateItem({
        product,
        quantity: quantityAsNumber,
        platform,
      })

      setQuantityState(prevState => ({ ...prevState, quantity: quantityAsNumber }))

      if (item) updateItems(item)
    },
    [quantityState, platform, product, updateItems],
  )

  const onClickRemoveItem = () => {
    const removeId = denormalizeCartRemoveId({
      product,
      platform,
    })

    if (!removeId) return

    removeItems(removeId)
    trackRemoveFromCartEvent([product])
  }

  const styles = useMultiStyleConfig('CartItem', { inDrawer, soldOut })

  return (
    <Grid
      sx={styles.grid}
      templateAreas={{
        base: "'thumbnail name remove-button' 'thumbnail price price'",
        md: inDrawer ? undefined : "'thumbnail name price remove-button'",
      }}
      templateColumns={{
        base: '5rem 1fr 2rem',
        md: '7.5rem 6fr 3fr 1fr',
      }}
    >
      <GridItem gridArea="thumbnail">
        <Link href={productUrl}>
          <Image src={imageUrl} alt="" htmlWidth="180" htmlHeight="120" />
        </Link>
      </GridItem>

      <GridItem gridArea="name">
        <Link href={productUrl}>
          <Heading as="h3" size="sm" sx={styles.heading}>
            {title}
          </Heading>
          {subtitle && <Text sx={styles.textSubtitle}>{subtitle}</Text>}
        </Link>
        {soldOut && <Text sx={styles.textSoldOut}>Sold Out</Text>}
      </GridItem>

      <GridItem gridArea="price" sx={styles.gridItem}>
        <Flex sx={styles.flex}>
          <Text sx={styles.textPrice}>{formatMoney({ money: price })}</Text>
          <NumberInput
            value={quantityState.quantity}
            isDisabled={!!soldOut}
            max={quantityState.max}
            min={quantityState.min}
            onChange={onChangeItemQuantity}
            containerProps={{
              maxW: 80,
              minW: 28,
              mb: 2,
              ml: 10,
            }}
            inputProps={{
              'aria-label': 'Product quantity',
              size: 'xs',
            }}
            buttonProps={{
              size: 'xs',
              height: 'full',
            }}
          />
          <Text sx={styles.textTotalPrice}>{formatMoney({ money: Number(price) * quantity })}</Text>
        </Flex>
      </GridItem>

      <GridItem gridArea="remove-button" sx={styles.gridItemLast}>
        <IconButton
          icon={<Icon icon="CloseIcon" />}
          aria-label={`Remove ${title} from cart`}
          sx={styles.iconButton}
          onClick={onClickRemoveItem}
        />
      </GridItem>
    </Grid>
  )
}

export default CartItem
