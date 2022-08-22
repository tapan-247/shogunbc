import { graphql, rest } from 'msw'

import { uniqueId } from '../../src/components/Utils'
import { customers } from '../../src/lib/mocks'

const NETWORK_DELAY = 1000
const BIGCOMMERCE_ACCESS_TOKEN_NAME = 'BIG-COMMERCE-TOKEN'
const BIGCOMMERCE_API_TOKEN_NAME = 'XSRF-TOKEN'

const errors = {
  INVALID: {
    code: 'INVALID',
    field: null,
    message: 'Input value is invalid.',
  },

  TAKEN: {
    code: 'TAKEN',
    field: null,
    message: 'Email has already been taken',
  },

  TOO_SHORT: {
    code: 'TOO_SHORT',
    field: null,
    message: 'Password is too short (minimum is 5 characters)',
  },

  UNIDENTIFIED_CUSTOMER: {
    code: 'UNIDENTIFIED_CUSTOMER',
    field: null,
    message: 'Unidentified customer',
  },

  TOKEN_NOT_FOUND: {
    code: 'TOKEN_NOT_FOUND',
    field: null,
    message: 'Access token does not exist',
  },
}

export const customer = [
  // Login (Shopify)
  rest.post('/account/login', async (req, res, ctx) => {
    return res(ctx.status(302))
  }),

  // Login (BigCommerce)
  rest.post('/login.php', async (req, res, ctx) => {
    const query = req.url.searchParams
    const action = query.get('action')

    if (action !== 'check_login') {
      return res(ctx.status(302))
    }

    const { login_email: email } = req.body
    const accessToken = Buffer.from(email, 'utf8').toString('base64')
    const expires = new Date()

    expires.setFullYear(expires.getFullYear() + 1)

    return res(ctx.status(302), ctx.cookie(BIGCOMMERCE_ACCESS_TOKEN_NAME, accessToken, { expires }))
  }),

  rest.head('/login.php', async (req, res, ctx) => {
    const expires = new Date()

    expires.setFullYear(expires.getFullYear() + 1)

    return res(ctx.status(302), ctx.cookie(BIGCOMMERCE_API_TOKEN_NAME, uniqueId(), { expires }))
  }),

  // Logout (Shopify)
  rest.get('/account/logout', async (req, res, ctx) => {
    return res(ctx.status(302))
  }),

  // Logout (BigCommerce)
  graphql.mutation('Logout', async (req, res, ctx) => {
    const expires = new Date()

    expires.setFullYear(expires.getFullYear() - 1)

    return res(
      ctx.data({
        logout: { result: 'success' },
      }),
      ctx.cookie(BIGCOMMERCE_ACCESS_TOKEN_NAME, '', { expires }),
    )
  }),

  // Register (Shopify)
  graphql.mutation('CustomerCreate', async (req, res, ctx) => {
    await imitateNetworkDelay()

    const { customerCreateInput } = req.variables
    const { email } = customerCreateInput
    const { graphql: customer } = customers[email] || {}

    if (customer && customer.email === email) {
      return res(ctx.errors([errors['TAKEN']]))
    }

    return res(ctx.data({ customer }))
  }),

  // Register (BigCommerce)
  rest.post('/v3/customers', async (req, res, ctx) => {
    await imitateNetworkDelay()

    return res(ctx.status(200))
  }),

  // Reset password (Shopify)
  graphql.mutation('CustomerResetByUrl', async (req, res, ctx) => {
    await imitateNetworkDelay()

    const { password } = req.variables

    if (password.length < 6) {
      return res(ctx.errors([errors['TOO_SHORT']]))
    }

    return res(ctx.data({}))
  }),

  // Recover password (Shopify)
  graphql.mutation('CustomerRecover', async (req, res, ctx) => {
    await imitateNetworkDelay()

    const { email } = req.variables
    const { graphql: customer } = customers[email] || {}

    if (!customer) {
      return res(
        ctx.data({
          customerRecover: {
            email,
            customerUserErrors: [errors['INVALID']],
          },
        }),
      )
    }

    return res(
      ctx.data({
        customerRecover: {
          email,
        },
      }),
    )
  }),

  // Create customer access token (Shopify)
  graphql.mutation('CustomerAccessTokenCreate', async (req, res, ctx) => {
    const {
      input: { email },
    } = req.variables
    const { graphql: customer } = customers[email] || {}

    if (!customer) {
      return res(
        ctx.data({
          customerAccessTokenCreate: {
            customerAccessToken: null,
            customerUserErrors: [errors['UNIDENTIFIED_CUSTOMER']],
          },
        }),
      )
    }

    const accessToken = Buffer.from(email, 'utf8').toString('base64')
    const expiresAt = new Date()

    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    return res(
      ctx.data({
        customerAccessTokenCreate: {
          customerAccessToken: {
            accessToken,
            expiresAt: expiresAt.toISOString(),
          },
        },
      }),
    )
  }),

  // Renew customer access token (Shopify)
  graphql.mutation('CustomerAccessTokenRenew', async (req, res, ctx) => {
    const { customerAccessToken } = req.variables
    const expiresAt = new Date()

    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    return res(
      ctx.data({
        customerAccessTokenRenew: {
          customerAccessToken: {
            accessToken: customerAccessToken,
            expiresAt: expiresAt.toISOString(),
          },
        },
      }),
    )
  }),

  // Delete customer access token (Shopify)
  graphql.mutation('CustomerAccessTokenDelete', async (req, res, ctx) => {
    const { customerAccessToken } = req.variables

    return res(
      ctx.data({
        customerAccessTokenDelete: {
          deletedAccessToken: customerAccessToken,
          deletedCustomerAccessTokenId: 'gid://shopify/CustomerAccessToken/whatever',
          userErrors: [],
        },
      }),
    )
  }),

  // Get orders (Shopify)
  graphql.query('GetOrders', async (req, res, ctx) => {
    const { customerAccessToken } = req.variables
    const email = Buffer.from(customerAccessToken, 'base64').toString('utf8')
    const { graphql: customer } = customers[email] || {}

    if (!customer) {
      return res(ctx.errors([errors['UNIDENTIFIED_CUSTOMER']]))
    }

    return res(
      ctx.data({
        customer: {
          orders: customer.orders,
        },
      }),
    )
  }),

  // Get orders (BigCommerce)
  rest.get('/v2/orders', async (req, res, ctx) => {
    const { [BIGCOMMERCE_ACCESS_TOKEN_NAME]: bigcommerceCustomerAccessToken } = req.cookies
    const email = Buffer.from(bigcommerceCustomerAccessToken, 'base64').toString('utf8')
    const { rest: customer } = customers[email] || {}

    if (!customer) {
      return res(ctx.status(500, errors['UNIDENTIFIED_CUSTOMER'].message))
    }

    const { orders = [] } = customer

    return res(ctx.json(orders))
  }),

  // Get addresses (Shopify)
  graphql.query('GetAddresses', async (req, res, ctx) => {
    await imitateNetworkDelay()

    const { customerAccessToken } = req.variables
    const email = Buffer.from(customerAccessToken, 'base64').toString('utf8')
    const { graphql: customer } = customers[email] || {}

    if (!customer) {
      return res(ctx.errors([errors['UNIDENTIFIED_CUSTOMER']]))
    }

    return res(
      ctx.data({
        customer: {
          addresses: customer.addresses,
          defaultAddress: customer.defaultAddress,
        },
      }),
    )
  }),

  // Create address (Shopify)
  graphql.mutation('CustomerAddressCreate', async (req, res, ctx) => {
    await imitateNetworkDelay()

    return res(ctx.data({}))
  }),

  // Update address (Shopify)
  graphql.mutation('CustomerAddressUpdate', async (req, res, ctx) => {
    await imitateNetworkDelay()

    return res(ctx.data({}))
  }),

  // Delete address (Shopify)
  graphql.mutation('CustomerAddressDelete', async (req, res, ctx) => {
    await imitateNetworkDelay()

    return res(ctx.data({}))
  }),

  // Get addresses (BigCommerce)
  rest.get('/v3/customers/addresses', async (req, res, ctx) => {
    await imitateNetworkDelay()

    const { [BIGCOMMERCE_ACCESS_TOKEN_NAME]: bigcommerceCustomerAccessToken } = req.cookies
    const email = Buffer.from(bigcommerceCustomerAccessToken, 'base64').toString('utf8')
    const { rest: customer } = customers[email] || {}

    if (!customer) {
      return res(ctx.errors([errors['UNIDENTIFIED_CUSTOMER']]))
    }

    const { addresses = [] } = customer

    return res(
      ctx.json({
        data: addresses,
        meta: {
          pagination: {
            count: addresses.length,
            current_page: 1,
            per_page: 50,
            total: addresses.length,
            total_pages: 1,
          },
        },
      }),
    )
  }),

  // Create address (BigCommerce)
  rest.post('/v3/customers/addresses', async (req, res, ctx) => {
    await imitateNetworkDelay()

    return res(ctx.status(200))
  }),

  // Update address (BigCommerce)
  rest.put('/v3/customers/addresses', async (req, res, ctx) => {
    await imitateNetworkDelay()

    return res(ctx.status(200))
  }),

  // Delete address (BigCommerce)
  rest.delete('/v3/customers/addresses', async (req, res, ctx) => {
    await imitateNetworkDelay()

    return res(ctx.status(200))
  }),

  // Get customer (Shopify, BigCommerce)
  graphql.query('GetCustomer', async (req, res, ctx) => {
    const { customerAccessToken: shopifyCustomerAccessToken } = req.variables

    let accessToken

    if (shopifyCustomerAccessToken !== undefined && shopifyCustomerAccessToken.length > 0) {
      accessToken = shopifyCustomerAccessToken
    } else {
      const { [BIGCOMMERCE_ACCESS_TOKEN_NAME]: bigcommerceCustomerAccessToken } = req.cookies

      if (
        bigcommerceCustomerAccessToken !== undefined &&
        bigcommerceCustomerAccessToken.length > 0
      ) {
        accessToken = bigcommerceCustomerAccessToken
      }
    }

    if (accessToken === undefined) {
      return res(ctx.data({}))
    }

    const email = Buffer.from(accessToken, 'base64').toString('utf8')
    const { graphql: customer } = customers[email] || {}

    if (!customer) {
      return res(ctx.errors([errors['UNIDENTIFIED_CUSTOMER']]))
    }

    const { orders, addresses, ...mainFields } = customer

    return res(ctx.data({ customer: mainFields }))
  }),

  // Update customer (BigCommerce)
  rest.put('/v3/customers', async (req, res, ctx) => {
    await imitateNetworkDelay()

    return res(ctx.status(200))
  }),
]

// utils
async function imitateNetworkDelay() {
  await new Promise(r => setTimeout(r, NETWORK_DELAY))
}
