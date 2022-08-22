export default function getShogunConfig() {
  const publicRuntimeConfig = {
    releaseVersion: process.env.RELEASE_VERSION || '',
    storeDomain: process.env.STORE_DOMAIN || '',
    storeId: process.env.SITE_ID || '',
    storeName: process.env.STORE_NAME || '',
    storePlatform: process.env.PLATFORM || '',
    storePlatformApiType: process.env.PLATFORM_API_TYPE || '',
    storePlatformDomain: process.env.PLATFORM_DOMAIN || '',
    storePlatformPublicDomain: process.env.PLATFORM_PUBLIC_DOMAIN || '',
    storeSharedCheckoutDomains: process.env.SHARED_CHECKOUT_DOMAINS
      ? process.env.SHARED_CHECKOUT_DOMAINS.split(' ')
      : [],
  }
  const serverRuntimeConfig = {}

  return { publicRuntimeConfig, serverRuntimeConfig }
}
