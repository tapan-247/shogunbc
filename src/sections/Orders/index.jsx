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
import { useCustomer } from 'frontend-customer'
import Container from 'Components/Container'
import { useRouter } from 'frontend-router'
import Heading from 'Components/Heading'
import AuthGuard from 'Components/AuthGuard'
import Breadcrumb from 'Components/Breadcrumb'
import AccountOrderDetails from 'Components/AccountOrderDetails'
import AccountOrderHistory from 'Components/AccountOrderHistory'
import { useNormalizedCustomer } from 'Components/Hooks'
import { ACCOUNT_URL, ACCOUNT_LOGIN_URL, ACCOUNT_ORDERS_URL } from 'Components/Data'

/**
 * @typedef { import("frontend-customer/dist/customer-sdk/platforms/shopify/storefront-api/types/api").Order } Order
 * @typedef { import("frontend-customer/dist/customer-sdk/platforms/big_commerce/rest/types/sdk").BigCommerceSdkOrder } BigCommerceSdkOrder
 */

const AccountOrders = () => {
  const router = useRouter()

  /** @type { { "order-id"?: string } } */
  const { 'order-id': orderId } = router.query

  const [customerState, { getAllOrders }] = useCustomer()
  const { isLoggedIn, orders } = useNormalizedCustomer(customerState)

  const order = React.useMemo(
    () => (orders && orderId ? orders.find(order => order.id === orderId) : undefined),
    [orders, orderId],
  )

  const breadcrumbItems = React.useMemo(() => {
    /** @type {import("Components/Breadcrumb").BreadcrumbItem[]} */
    const items = [
      { label: 'Account', url: ACCOUNT_URL },
      { label: 'Orders', url: ACCOUNT_ORDERS_URL, isCurrentPage: order === undefined },
    ]

    if (order) {
      items.push({ label: order.name, url: '', isCurrentPage: true })
    }

    return items
  }, [order])

  React.useEffect(() => {
    if (isLoggedIn && !orders) {
      getAllOrders()
    }
  }, [isLoggedIn, orders, getAllOrders])

  return (
    <Container as="section" variant="section-wrapper">
      <Breadcrumb mb={6} items={breadcrumbItems} />

      <Heading as="h1" mb={16}>
        {order ? 'Order details' : 'Orders'}
      </Heading>

      <AuthGuard allowedAuthStatus="authenticated" redirectUrl={ACCOUNT_LOGIN_URL}>
        {order ? <AccountOrderDetails order={order} /> : <AccountOrderHistory orders={orders} />}
      </AuthGuard>
    </Container>
  )
}

export default AccountOrders
