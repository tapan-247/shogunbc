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
import { useCustomerActions } from 'frontend-customer'
import { useRouter } from 'frontend-router'
import Button from 'Components/Button'
import Container from 'Components/Container'
import Divider from 'Components/Divider'
import Grid from 'Components/Grid'
import Heading from 'Components/Heading'
import Input from 'Components/Input'
import Link from 'Components/Link'
import Text from 'Components/Text'
import AuthGuard from 'Components/AuthGuard'
import { useIsMounted, usePlatform } from 'Components/Hooks'
import {
  denormalizeRegisterData,
  normalizeRegisterResult,
  validateRegisterData,
} from 'Components/Utils'
import {
  SHOPIFY_REGISTER_REQUIRED_FIELDS,
  BIG_COMMERCE_REGISTER_REQUIRED_FIELDS,
  ACCOUNT_URL,
  ACCOUNT_LOGIN_URL,
} from 'Components/Data'
import AddressFields from 'Components/AddressFields'
import FormLabel from 'Components/FormLabel'
import FormControl from 'Components/FormControl'

const platformRequiredFields = {
  shopify: SHOPIFY_REGISTER_REQUIRED_FIELDS,
  big_commerce: BIG_COMMERCE_REGISTER_REQUIRED_FIELDS,
}

/**
 * @typedef { import('lib/types').RegisterDataKey }  RegisterDataKey
 */

const RegisterForm = () => {
  const [platform] = usePlatform()
  const requiredFields = platformRequiredFields[platform]

  const { register } = useCustomerActions()
  const router = useRouter()
  const isMounted = useIsMounted()

  const [isLoading, setIsLoading] = React.useState(false)

  /** @type { Error[] } */
  const initialRegisterErrors = []
  const [registerErrors, setRegisterErrors] = React.useState(initialRegisterErrors)

  /** @type { import("lib/types").RegisterData }  */
  const initialRegisterData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    countryCode: '',
    province: '',
    city: '',
    zip: '',
    address1: '',
    address2: '',
  }
  const [registerData, setRegisterData] = React.useState(initialRegisterData)

  const fieldsDisabled = isLoading

  const submitDisabled = React.useMemo(
    () => fieldsDisabled || !validateRegisterData(platform, registerData),
    [platform, registerData, fieldsDisabled],
  )

  const onFieldChange = React.useCallback(
    /** @type {{(key: RegisterDataKey, event: {target: { value: string }}): void }} */
    (key, { target: { value } }) =>
      setRegisterData(prevData => ({
        ...prevData,
        [key]: value,
      })),
    [setRegisterData],
  )

  /** @type { React.FormEventHandler<HTMLDivElement> } */
  const handleSubmit = async event => {
    event.preventDefault()

    setIsLoading(true)
    setRegisterErrors([])

    /** @type { Error[] | undefined } */
    let newRegisterErrors

    try {
      const platformRegisterData = denormalizeRegisterData(platform, registerData)
      const result = await register(platformRegisterData)
      const { errors } = normalizeRegisterResult(result)

      newRegisterErrors = errors
    } catch (/** @type { any } */ error) {
      newRegisterErrors = [error]
    } finally {
      if (!isMounted.current) return

      setIsLoading(false)

      if (!newRegisterErrors || newRegisterErrors.length === 0) {
        router.push(ACCOUNT_LOGIN_URL)
      } else {
        setRegisterErrors(newRegisterErrors)
      }
    }
  }

  return (
    <Container as="section" variant="section-wrapper-centered">
      <Heading as="h1" mb={6}>
        Register
      </Heading>

      <AuthGuard allowedAuthStatus="unauthenticated" redirectUrl={ACCOUNT_URL}>
        <Grid as="form" w={{ base: 'full', md: 'md' }} onSubmit={handleSubmit} rowGap={5}>
          <Container as={FormControl} id="register-first-name">
            <FormLabel>
              First name{' '}
              {!requiredFields.includes('firstName') && (
                <Text as="span" color="gray.400" fontSize="xs">
                  (optional)
                </Text>
              )}
            </FormLabel>
            <Input
              value={registerData.firstName}
              disabled={fieldsDisabled}
              onChange={e => onFieldChange('firstName', e)}
            />
          </Container>

          <Container as={FormControl} id="register-last-name">
            <FormLabel>
              Last name{' '}
              {!requiredFields.includes('firstName') && (
                <Text as="span" color="gray.400" fontSize="xs">
                  (optional)
                </Text>
              )}
            </FormLabel>
            <Input
              value={registerData.lastName}
              disabled={fieldsDisabled}
              onChange={e => onFieldChange('lastName', e)}
            />
          </Container>

          <Container as={FormControl} id="register-email">
            <FormLabel>Email</FormLabel>
            <Input
              placeholder="email@example.com"
              type="email"
              disabled={fieldsDisabled}
              value={registerData.email}
              onChange={e => onFieldChange('email', e)}
              isInvalid={registerErrors.length > 0}
              isRequired
            />
          </Container>

          <Container as={FormControl} id="register-password">
            <FormLabel>Password</FormLabel>
            <Input
              placeholder="Enter your password"
              type="password"
              disabled={fieldsDisabled}
              value={registerData.password}
              onChange={e => onFieldChange('password', e)}
              isInvalid={registerErrors.length > 0}
              isRequired
            />
          </Container>

          {platform === 'big_commerce' && (
            <React.Fragment>
              <Divider my="6" />
              <AddressFields
                addressData={registerData}
                isDisabled={fieldsDisabled}
                onFieldChange={onFieldChange}
              />
            </React.Fragment>
          )}

          <Container>
            <Button
              disabled={submitDisabled}
              isLoading={isLoading}
              loadingText="Submitting"
              type="submit"
              width={{ base: '100%', md: 48 }}
            >
              Register
            </Button>
          </Container>

          {registerErrors.length > 0 && (
            <Container>
              {registerErrors.map(({ message }, index) => (
                <Text key={`error-message-${index}`} color="red.600">
                  {message}
                </Text>
              ))}
            </Container>
          )}

          <Divider />

          <Text>
            Already have an account?{' '}
            <Link href={ACCOUNT_LOGIN_URL} color="black" ml="2" textDecoration="underline">
              Login
            </Link>
          </Text>
        </Grid>
      </AuthGuard>
    </Container>
  )
}

export default RegisterForm
