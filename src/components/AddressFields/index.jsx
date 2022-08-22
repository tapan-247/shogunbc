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
import Input from 'Components/Input'
import { COUNTRIES, useStates } from 'Components/Data'
import Select from 'Components/Select'
import HStack from 'Components/HStack'
import FormControl from 'Components/FormControl'
import FormLabel from 'Components/FormLabel'

/**
 * @typedef { import('Components/Select').SelectOption }  SelectOption
 * @typedef { import('lib/types').AddressData }  AddressData
 * @typedef { import('lib/types').AddressDataKey }  AddressDataKey
 *
 * @typedef {{
 *  addressData: AddressData
 *  isDisabled?: boolean
 *  all?: boolean
 *  densed?: boolean
 *  onFieldChange: (key: AddressDataKey, event: {target: { value: string }}) => void
 * }} AddressFieldsProps
 */

/** @param { AddressFieldsProps } props */
const FirstName = ({ addressData, isDisabled, densed, onFieldChange }) => (
  <Container w={densed ? '50%' : undefined} as={FormControl} id="address-first-name">
    <FormLabel>First name</FormLabel>
    <Input
      value={addressData.firstName}
      isDisabled={isDisabled}
      onChange={e => onFieldChange('firstName', e)}
    />
  </Container>
)

/** @param { AddressFieldsProps } props */
const LastName = ({ addressData, isDisabled, densed, onFieldChange }) => (
  <Container w={densed ? '50%' : undefined} as={FormControl} id="address-last-name">
    <FormLabel>Last name</FormLabel>
    <Input
      value={addressData.lastName}
      isDisabled={isDisabled}
      onChange={e => onFieldChange('lastName', e)}
    />
  </Container>
)

/** @param { AddressFieldsProps } props */
const Company = ({ addressData, isDisabled, onFieldChange }) => (
  <Container as={FormControl} id="address-company">
    <FormLabel>Company</FormLabel>
    <Input
      value={addressData.company}
      isDisabled={isDisabled}
      onChange={e => onFieldChange('company', e)}
    />
  </Container>
)

/** @param { AddressFieldsProps } props */
const Phone = ({ addressData, isDisabled, onFieldChange }) => (
  <Container as={FormControl} id="address-phone">
    <FormLabel>Phone</FormLabel>
    <Input
      value={addressData.phone}
      isDisabled={isDisabled}
      onChange={e => onFieldChange('phone', e)}
    />
  </Container>
)

/** @param { AddressFieldsProps } props */
const Country = ({ addressData, isDisabled, densed, onFieldChange }) => {
  const countryOptions = React.useMemo(() => {
    /** @type { SelectOption[] } */
    const options = [{ text: 'Choose country', value: '' }]

    for (const [code, country] of Object.entries(COUNTRIES)) {
      options.push({ text: country, value: code })
    }

    return options
  }, [])

  return (
    <Container as={FormControl} id="address-country" w={densed ? '50%' : undefined}>
      <FormLabel>Country</FormLabel>
      <Select
        options={countryOptions}
        isDisabled={isDisabled}
        value={addressData.countryCode}
        onChange={e => {
          const {
            target: { value },
          } = e

          const country = COUNTRIES[value]

          onFieldChange('countryCode', e)
          onFieldChange('country', { target: { value: country } })
        }}
      />
    </Container>
  )
}

/** @param { AddressFieldsProps } props */
const State = ({ addressData, isDisabled, densed, onFieldChange }) => {
  const { countryCode, province: state } = addressData
  const states = useStates(countryCode)

  /** @type { SelectOption[] } */
  const stateOptions = React.useMemo(
    () => [
      { text: 'Choose state', value: '' },
      ...states.map(state => ({ text: state, value: state })),
    ],
    [states],
  )

  React.useEffect(() => {
    if (stateOptions.length === 1) {
      onFieldChange('province', {
        target: {
          value: 'n/a',
        },
      })
    } else if (!stateOptions.find(({ value }) => value === state)) {
      onFieldChange('province', {
        target: {
          value: '',
        },
      })
    }
  }, [state, stateOptions, onFieldChange])

  if (stateOptions.length === 1) return null

  return (
    <Container as={FormControl} id="address-state" w={densed ? '50%' : undefined}>
      <FormLabel>State</FormLabel>
      <Select
        options={stateOptions}
        isDisabled={isDisabled}
        value={state}
        onChange={e => onFieldChange('province', e)}
      />
    </Container>
  )
}

/** @param { AddressFieldsProps } props */
const City = ({ addressData, isDisabled, densed, onFieldChange }) => (
  <Container as={FormControl} id="address-city" w={densed ? '50%' : undefined}>
    <FormLabel>City</FormLabel>
    <Input
      value={addressData.city}
      isDisabled={isDisabled}
      onChange={e => onFieldChange('city', e)}
    />
  </Container>
)

/** @param { AddressFieldsProps } props */
const Zip = ({ addressData, isDisabled, densed, onFieldChange }) => (
  <Container as={FormControl} id="address-zip" w={densed ? '50%' : undefined}>
    <FormLabel>Zip</FormLabel>
    <Input
      value={addressData.zip}
      isDisabled={isDisabled}
      onChange={e => onFieldChange('zip', e)}
    />
  </Container>
)

/** @param { AddressFieldsProps } props */
const Address1 = ({ addressData, isDisabled, onFieldChange }) => (
  <Container as={FormControl} id="address-line-1">
    <FormLabel>Address</FormLabel>
    <Input
      value={addressData.address1}
      isDisabled={isDisabled}
      onChange={e => onFieldChange('address1', e)}
    />
  </Container>
)

/** @param { AddressFieldsProps } props */
const Address2 = ({ addressData, isDisabled, onFieldChange }) => (
  <Container as={FormControl} id="address-line-2">
    <FormLabel>
      Apartment, suite, etc.{' '}
      <Container as="span" color="gray.400" fontSize="xs">
        (optional)
      </Container>
    </FormLabel>
    <Input
      value={addressData.address2}
      isDisabled={isDisabled}
      onChange={e => onFieldChange('address2', e)}
    />
  </Container>
)

/** @param { AddressFieldsProps } props */
const AddressFields = props => {
  const { all, densed } = props

  return (
    <React.Fragment>
      {all &&
        (densed ? (
          <HStack>
            <FirstName {...props} />
            <LastName {...props} />
          </HStack>
        ) : (
          <React.Fragment>
            <FirstName {...props} />
            <LastName {...props} />
          </React.Fragment>
        ))}

      {all && <Company {...props} />}

      {all && <Phone {...props} />}

      {densed ? (
        <HStack>
          <Country {...props} />
          <State {...props} />
        </HStack>
      ) : (
        <React.Fragment>
          <Country {...props} />
          <State {...props} />
        </React.Fragment>
      )}

      {densed ? (
        <HStack>
          <City {...props} />
          <Zip {...props} />
        </HStack>
      ) : (
        <React.Fragment>
          <City {...props} />
          <Zip {...props} />
        </React.Fragment>
      )}

      <Address1 {...props} />
      <Address2 {...props} />
    </React.Fragment>
  )
}

export default AddressFields
