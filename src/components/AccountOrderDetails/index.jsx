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
import Container from 'Components/Container'
import Grid from 'Components/Grid'
import Text from 'Components/Text'
import { formatDate, formatMoney } from 'Components/Utils'
import OrderProduct from 'Components/OrderProduct'
import Divider from 'Components/Divider'
import HStack from 'Components/HStack'
import VStack from 'Components/VStack'

const PRICE_PLACEHOLDER = { amount: '0.00', currencyCode: 'USD' }

/**
 * @typedef { import("lib/types").Order } Order
 *
 * @param {{ order: Order }} props
 */
const AccountOrderDetails = ({ order }) => {
  const {
    name = 'n/a',
    financialStatus = 'n/a',
    fulfillmentStatus = 'n/a',
    processedAt = new Date().toISOString(),
  } = order || {}

  let { subtotalPrice, totalShippingPrice, totalPrice } = order || {}

  subtotalPrice = subtotalPrice || PRICE_PLACEHOLDER
  totalShippingPrice = totalShippingPrice || PRICE_PLACEHOLDER
  totalPrice = totalPrice || PRICE_PLACEHOLDER

  return (
    <Container>
      <HStack justifyContent="space-between" background="brand.100" p="2" mb="4">
        <Text fontSize="lg" fontWeight="semibold">
          Order {name}
        </Text>

        <VStack spacing="0">
          <Text as="time" dateTime={processedAt} fontWeight="semibold" whiteSpace="nowrap">
            {formatDate({ date: processedAt, display: 'date' })}
          </Text>
          <Text as="time" dateTime={processedAt} fontSize="sm" color="gray.600" whiteSpace="nowrap">
            {formatDate({ date: processedAt, display: 'time' })}
          </Text>
        </VStack>
      </HStack>

      <HStack mb="2">
        <Text mr="1">Payment status:</Text>
        <Text fontWeight="semibold">{financialStatus}</Text>
      </HStack>

      <HStack mb="8">
        <Text mr="1">Fulfillment Status:</Text>
        <Text fontWeight="semibold">{fulfillmentStatus}</Text>
      </HStack>

      {order.products.map((product, i) => {
        return (
          <React.Fragment key={i}>
            <OrderProduct product={product} />
            <Divider my="4" borderBottomWidth="1px" />
          </React.Fragment>
        )
      })}

      <Grid mb={12} templateColumns="1fr auto" justifyItems="end" gap="2">
        <Text>Subtotal:</Text>
        <Text fontWeight="semibold">
          {formatMoney({
            money: subtotalPrice.amount,
            options: { currency: subtotalPrice.currencyCode },
          })}
        </Text>

        <Text>Shipping:</Text>
        <Text fontWeight="semibold">
          {formatMoney({
            money: totalShippingPrice.amount,
            options: { currency: totalShippingPrice.currencyCode },
          })}
        </Text>

        <Text>Total:</Text>
        <Text fontWeight="semibold">
          {formatMoney({
            money: totalPrice.amount,
            options: { currency: totalPrice.currencyCode },
          })}
        </Text>
      </Grid>
    </Container>
  )
}

export default AccountOrderDetails
