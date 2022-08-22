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
import React from 'react'
import { useCustomerActions, useCustomerState } from 'frontend-customer'
import { useRouter } from 'frontend-router'
import { useIsMounted, useNormalizedCustomer, usePlatform } from 'Components/Hooks'
import AuthGuard from 'Components/AuthGuard'
import Breadcrumb from 'Components/Breadcrumb'
import Button from 'Components/Button'
import Container from 'Components/Container'
import Grid from 'Components/Grid'
import Heading from 'Components/Heading'
import HStack from 'Components/HStack'
import Link from 'Components/Link'
import Text from 'Components/Text'
import {
  denormalizeCreateAddressInput,
  denormalizeUpdateAddressInput,
  denormalizeDeleteAddressInput,
} from 'Components/Utils'
import AddressFields from 'Components/AddressFields'
import { ACCOUNT_URL, ACCOUNT_LOGIN_URL } from 'Components/Data'

const AccountAddress = () => {
  const { getAllAddresses, createAddress, updateAddress, deleteAddress } = useCustomerActions()
  const customerState = useCustomerState()
  const customer = useNormalizedCustomer(customerState)
  const isMounted = useIsMounted()
  const router = useRouter()
  const [platform] = usePlatform()

  /** @type { { id?: string } } */
  const { id: addressId } = router.query
  const { addresses, status } = customer

  /**
   * @typedef { import("lib/types").AddressData } AddressData
   * @typedef { import("lib/types").AddressDataKey } AddressDataKey
   *
   * @type { AddressData }
   */
  const initialAddressData = {
    firstName: '',
    lastName: '',
    countryCode: '',
    province: '',
    city: '',
    zip: '',
    address1: '',
    address2: '',
    company: '',
    country: '',
    phone: '',
  }
  const [addressData, setAddressData] = React.useState(initialAddressData)

  const [isInitialAddressDataLoading, setIsInitialAddressDataLoading] = React.useState(
    addressId !== undefined,
  )
  const [isSaving, setIsSaving] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const isDisabled = isInitialAddressDataLoading || isSaving || isDeleting

  /**
   * @typedef { import("frontend-customer/dist/customer-sdk/platforms/big_commerce/rest/types/api").BigCommerceApiError } BigCommerceApiError
   * @typedef { import("frontend-customer/dist/customer-sdk/platforms/shopify/storefront-api/types/api").CustomerUserError } CustomerUserError
   * @typedef { import('frontend-customer/dist/customer-sdk/platforms/shopify/storefront-api/types/sdk').SdkError } SdkError
   * @typedef { BigCommerceApiError[] | CustomerUserError[] | SdkError[] | Error[] | null | undefined } FormErrors
   * @type { [FormErrors, React.Dispatch<React.SetStateAction<FormErrors>>] }
   */
  const [formErrors, setFormErrors] = React.useState()

  React.useEffect(() => {
    if (addressId) {
      getAllAddresses()
    }
  }, [addressId, getAllAddresses])

  React.useEffect(() => {
    if (status === 'loading') {
      const mounted = isMounted.current

      return () => {
        if (mounted) setIsInitialAddressDataLoading(false)
      }
    }
  }, [status, isMounted])

  React.useEffect(() => {
    if (isInitialAddressDataLoading) {
      const mounted = isMounted.current

      return () => {
        if (!addresses) return

        const address = addresses.find(address => address.id === addressId)

        if (!address) return

        const { id, ...data } = address

        if (mounted) setAddressData(data)
      }
    }
  }, [isInitialAddressDataLoading, addressId, addresses, isMounted])

  const onFieldChange = React.useCallback(
    /** @type {{(key: AddressDataKey, event: {target: { value: string }}): void }} */
    (key, { target: { value } }) => {
      setAddressData(prevData => ({
        ...prevData,
        [key]: value,
      }))
    },
    [],
  )

  /** @type { React.FormEventHandler<HTMLDivElement> } */
  const handleSubmit = async event => {
    event.preventDefault()

    setIsSaving(true)
    setFormErrors(null)

    /** @type { FormErrors } */
    let newFormErrors

    if (addressId === undefined) {
      const createAddressInput = denormalizeCreateAddressInput(platform, addressData)

      try {
        const result = await createAddress(createAddressInput)

        newFormErrors = result && result.errors
      } catch (/** @type { any } */ error) {
        newFormErrors = [error]
      }
    } else {
      const updateAddressInput = denormalizeUpdateAddressInput(platform, addressData, addressId)

      try {
        const result = await updateAddress(updateAddressInput)

        newFormErrors = result && result.errors
      } catch (/** @type { any } */ error) {
        newFormErrors = [error]
      }
    }

    if (!isMounted.current) return

    setIsSaving(false)

    if (newFormErrors && newFormErrors.length > 0) {
      setFormErrors(newFormErrors)
    } else {
      router.push(ACCOUNT_URL)
    }
  }

  const handleDelete = async () => {
    if (addressId === undefined) {
      throw new Error('Expected addressId but got undefined')
    }

    setIsDeleting(true)
    setFormErrors(null)

    /** @type { FormErrors } */
    let newFormErrors

    try {
      const deleteAddressInput = denormalizeDeleteAddressInput(platform, addressId)

      // @ts-ignore
      const { errors } = await deleteAddress(deleteAddressInput)

      newFormErrors = errors
    } catch (/** @type { any } */ error) {
      newFormErrors = [error]
    } finally {
      if (!isMounted.current) return

      setIsDeleting(false)

      if (newFormErrors && newFormErrors.length > 0) {
        setFormErrors(newFormErrors)
      } else {
        router.push(ACCOUNT_URL)
      }
    }
  }

  return (
    <Container as="section" variant="section-wrapper">
      <HStack justify="space-between" mb={6}>
        <Breadcrumb
          items={[
            { label: 'Account', url: ACCOUNT_URL },
            { label: addressId ? 'Address' : 'Create address', url: '#', isCurrentPage: true },
          ]}
        />
        {addressId && (
          <Button
            variant="outline"
            size="sm"
            isDisabled={isDisabled}
            isLoading={isDeleting}
            loadingText="Deleting..."
            onClick={handleDelete}
          >
            Delete
          </Button>
        )}
      </HStack>

      <Heading as="h1" mb={6}>
        {addressId ? 'Edit address' : 'Create address'}
      </Heading>

      <AuthGuard allowedAuthStatus="authenticated" redirectUrl={ACCOUNT_LOGIN_URL}>
        <Grid as="form" onSubmit={handleSubmit} rowGap={5}>
          <AddressFields
            addressData={addressData}
            isDisabled={isDisabled}
            all
            densed
            onFieldChange={onFieldChange}
          />

          {formErrors && (
            <Container>
              {formErrors.map(({ message }, index) => (
                <Text key={index} color="red.600">
                  {message}
                </Text>
              ))}
            </Container>
          )}

          <HStack justify="space-between" my="8">
            <Link href={ACCOUNT_URL}>Cancel</Link>
            <Button
              isDisabled={isDisabled}
              isLoading={isSaving}
              loadingText="Saving..."
              type="submit"
              width="48"
            >
              Save
            </Button>
          </HStack>
        </Grid>
      </AuthGuard>
    </Container>
  )
}

export default AccountAddress
