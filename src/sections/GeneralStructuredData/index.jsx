import React from 'react'
import Head from 'frontend-head'
import frontendConfig from 'frontend-config'

const { publicRuntimeConfig } = frontendConfig()
const LOGO_IMAGE_URL = 'https://f.shgcdn.com/4f1c2c48-c495-40f7-830b-ccaa81ddf204/'

const GeneralStructuredData = () => (
  <Head>
    <script type="application/ld+json">{`
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "url": "https://${publicRuntimeConfig.storeDomain}",
        "logo": "${LOGO_IMAGE_URL}"
      }
    `}</script>
  </Head>
)

export default GeneralStructuredData
