import { graphql, rest } from 'msw'
import {
  shopifyCart,
  bigCommerceCart,
  bigCommerceCheckout,
  shopifyInventory,
  shopifyGraphqlInventory,
  bigCommcerceInventory,
  shopifyRestCart,
  bigCommerceVariantInventory,
} from '../../src/lib/mocks'

export const cart = [
  rest.post('/v3/carts*', async (_, res, ctx) => {
    return res(ctx.json(bigCommerceCart))
  }),

  rest.put('/v3/carts*', async (_, res, ctx) => {
    return res(ctx.json(bigCommerceCart))
  }),

  rest.get('/v3/checkouts*', async (_, res, ctx) => {
    return res(ctx.json(bigCommerceCheckout))
  }),

  rest.get('/v3/catalog/products*', async (_, res, ctx) => {
    return res(ctx.json(bigCommcerceInventory))
  }),

  graphql.query('getProductIdByVariantId', (_, res, ctx) => {
    return res(ctx.data(bigCommerceVariantInventory))
  }),

  // Shopify Inventory
  rest.get('/data/productInventory.json', async (_, res, ctx) => {
    return res(ctx.json(shopifyInventory))
  }),
  rest.get('/cart.js', (_, res, ctx) => {
    return res(ctx.json(shopifyRestCart))
  }),
  graphql.query('getProductInventoryData', async (_, res, ctx) => {
    return res(ctx.data(shopifyGraphqlInventory))
  }),

  // Checkout
  graphql.query('Checkout', async (_, res, ctx) => {
    return res(ctx.data({ node: shopifyCart.checkout }))
  }),

  // CreateCheckout
  graphql.mutation('CreateCheckout', async (_, res, ctx) => {
    return res(ctx.data({ checkoutCreate: shopifyCart }))
  }),

  // AddCheckoutLineItems
  graphql.mutation('AddCheckoutLineItems', async (_, res, ctx) => {
    return res(ctx.data({ checkoutLineItemsAdd: shopifyCart }))
  }),

  // RemoveCheckoutLineItems
  graphql.mutation('RemoveCheckoutLineItems', async (_, res, ctx) => {
    return res(ctx.data({ checkoutLineItemsRemove: shopifyCart }))
  }),

  // UpdateCheckoutLineItems
  graphql.mutation('UpdateCheckoutLineItems', async (_, res, ctx) => {
    return res(ctx.data({ checkoutLineItemsUpdate: shopifyCart }))
  }),
]
