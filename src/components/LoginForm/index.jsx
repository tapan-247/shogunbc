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

import { useIsMounted } from 'Components/Hooks'
import Container from 'Components/Container'
import Divider from 'Components/Divider'
import Flex from 'Components/Flex'
import Input from 'Components/Input'
import Button from 'Components/Button'
import Link from 'Components/Link'
import Text from 'Components/Text'
import FormLabel from 'Components/FormLabel'
import FormControl from 'Components/FormControl'
import { ACCOUNT_URL, ACCOUNT_REGISTER_URL, ACCOUNT_RECOVER_PASSWORD_URL } from 'Components/Data'

/**
 * @typedef {{
 *  redirectUrl: string
 * }} LoginFormProps
 *
 * @param { LoginFormProps } props
 */
const LoginForm = ({ redirectUrl }) => {
  /**
   * @typedef { import("frontend-customer/dist/customer-sdk/platforms/big_commerce/rest/types/api").BigCommerceApiError } BigCommerceApiError
   * @typedef { import("frontend-customer/dist/customer-sdk/platforms/shopify/storefront-api/types/api").CustomerUserError } CustomerUserError
   * @typedef { ( BigCommerceApiError[] | CustomerUserError[] | null | undefined ) } FrontendErrors
   * @type { [FrontendErrors, React.Dispatch<React.SetStateAction<FrontendErrors>> ] }
   */
  const [loginErrors, setLoginErrors] = React.useState()
  const [loginFields, setLoginFields] = React.useState({ email: '', password: '' })
  const [loginInProgress, setLoginInProgress] = React.useState(false)

  const { login } = useCustomerActions()
  const router = useRouter()
  const isMounted = useIsMounted()

  /** @type { { checkout_url?: string } } */
  const { checkout_url: queryCheckoutUrl } = router.query

  /** @type { React.FormEventHandler<HTMLDivElement> } */
  const handleSubmit = async event => {
    event.preventDefault()

    setLoginErrors(null)
    setLoginInProgress(true)

    const { errors } = await login(loginFields)

    if (errors) {
      if (!isMounted.current) return

      setLoginInProgress(false)
      setLoginErrors(errors)

      // eslint-disable-next-line no-console
      console.error('Something went wrong', errors)

      return
    }

    router.push(queryCheckoutUrl || redirectUrl || ACCOUNT_URL)
  }

  const disableLoginButton =
    loginFields.email === '' || loginFields.password === '' || loginInProgress

  return (
    <Container as="form" onSubmit={handleSubmit} w={{ base: 'full', md: 'md' }}>
      <Container display="block" mb={5} as={FormControl} id="login-email">
        <FormLabel>Email</FormLabel>
        <Input
          placeholder="email@example.com"
          type="email"
          value={loginFields.email}
          onChange={(/** @type { React.ChangeEvent<HTMLInputElement> } */ event) =>
            setLoginFields(prevLoginFields => ({ ...prevLoginFields, email: event.target.value }))
          }
          isInvalid={Array.isArray(loginErrors) && loginErrors.length > 0}
          isRequired
        />
      </Container>

      <Container display="block" mb={5} as={FormControl} id="login-password">
        <FormLabel>Password</FormLabel>
        <Input
          placeholder="Enter your password"
          type="password"
          value={loginFields.password}
          onChange={(/** @type { React.ChangeEvent<HTMLInputElement> } */ event) =>
            setLoginFields(prevLoginFields => ({
              ...prevLoginFields,
              password: event.target.value,
            }))
          }
          isInvalid={Array.isArray(loginErrors) && loginErrors.length > 0}
          isRequired
        />
      </Container>

      <Flex
        flexDirection={{ base: 'column', md: 'row' }}
        alignItems={{ md: 'center' }}
        justifyContent="space-between"
        mb={5}
      >
        <Button
          isLoading={loginInProgress}
          loadingText="Submitting"
          type="submit"
          width={{ base: '100%', md: 48 }}
          maxWidth="100%"
          mb={{ base: 5, md: 0 }}
          mr="5"
          disabled={disableLoginButton}
        >
          Login
        </Button>
        <Link href={ACCOUNT_RECOVER_PASSWORD_URL}>Forgot password?</Link>
      </Flex>

      {loginErrors && (
        <Container mb={5}>
          {loginErrors.map(
            (
              /** @type { BigCommerceApiError | CustomerUserError } */ error,
              /** @type {number} */ index,
            ) => (
              <Text as="strong" key={`error-message-${index}`} color="red.600">
                {error.message}
              </Text>
            ),
          )}
        </Container>
      )}

      <Divider mb={5} />

      <Text>
        Don't have an account?&nbsp;
        <Link href={ACCOUNT_REGISTER_URL}>Register</Link>
      </Text>
    </Container>
  )
}

export default LoginForm
