import * as React from 'react'
import Head from 'frontend-head'
import { useCartActions } from 'frontend-checkout'
import { useRouter } from 'frontend-router'
import {
  publicRuntimeConfig,
  useIsMounted,
  useNormalizedProduct,
  usePlatform,
} from 'Components/Hooks'
import { denormalizeCartActionsId } from 'Components/Utils'

/**
 * @typedef { import("lib/types").CmsProduct } CmsProduct
 * @typedef {{
 *  product: CmsProduct
 * }} ProductStructuredDataProps
 *
 * @param { ProductStructuredDataProps } props
 */
const ProductStructuredData = ({ product: cmsProduct }) => {
  const router = useRouter()
  const isMounted = useIsMounted()
  const [platform] = usePlatform()

  const product = useNormalizedProduct(cmsProduct)

  const { isProductAvailableForSale } = useCartActions()
  const [availableForSale, setAvailableForSale] = React.useState(true)

  React.useEffect(() => {
    if (!product) return

    const itemId = denormalizeCartActionsId({
      product,
      productVariant: product.variants[0],
      platform,
    })

    async function setIsProductAvailableForSale() {
      const available = await isProductAvailableForSale({ id: itemId })

      if (!isMounted.current) return

      setAvailableForSale(available)
    }

    setIsProductAvailableForSale()
  }, [isProductAvailableForSale, isMounted, product, platform])

  if (!product) return null

  const { id, name, thumbnail, variants, description, metaTitle, metaDescription } = product
  const variant = variants && variants.length > 0 ? variants[0] : undefined

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: metaTitle || name,
    description: metaDescription || description.replace(/(<([^>]+)>)/gi, ''),
    image: thumbnail ? thumbnail.src : undefined,
    sku: variant ? variant.sku : undefined,
    mpn: id,
    brand: {
      '@type': 'Organization',
      name: 'Shogun Starter Kit',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: variant ? variant.price : undefined,
      availability: availableForSale ? 'InStock' : 'OutOfStock',
      url: `https://${publicRuntimeConfig.storeDomain}${router.pathname}`,
      seller: {
        '@type': 'Organization',
        name: 'Shogun Starter Kit',
      },
    },
  }

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
    </Head>
  )
}

export default ProductStructuredData
