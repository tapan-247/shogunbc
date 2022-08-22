/* eslint-disable no-console */
import * as React from 'react'
import { useCustomerActions, useCustomerState } from 'frontend-customer'
import { SupportedPlatform } from 'frontend-checkout/dist/types'
import { ArgsStoryFn, StoryContext } from '@storybook/addons'

import { useIsMounted } from 'Components/Hooks'
import { customerEmails } from '../mocks'
import { DecoratorFunction } from '../types'
import { getStorybookPlatform } from '../utils'

type CustomerDecoratorProps = {
  StoryFn: ArgsStoryFn<JSX.Element>
  context: StoryContext
}

export const CustomerDecorator: React.FC<CustomerDecoratorProps> = ({ StoryFn, context }) => {
  const isMounted = useIsMounted()
  const { login, getCustomer, logout } = useCustomerActions()
  const { isLoggedIn: isCustomerLoggedIn } = useCustomerState()

  const { loggedIn, longFields } = context.args
  const [platform] = getStorybookPlatform(context)
  const email = useCustomerEmails(platform, longFields)
  const [isReady, setIsReady] = React.useState(false)

  React.useEffect(() => {
    const loginUser = async (email: string) => {
      const credentials = { email, password: 'whatever' }

      const { errors } = await login(credentials)

      if (errors) {
        console.groupCollapsed('CustomerDecorator failed :(')

        if (errors) {
          errors.forEach(error => console.error(error.message, { credentials, error }))
        } else {
          console.error(`Got login result errors of type ${errors} and value =`, {
            credentials,
            errors: errors,
          })
        }

        console.groupEnd()
      }

      if (isMounted.current) {
        setIsReady(true)
      }
    }

    const fetchUser = async () => {
      await getCustomer()

      if (isMounted.current) {
        setIsReady(true)
      }
    }

    if (!loggedIn) {
      if (!isCustomerLoggedIn) {
        fetchUser()
      } else {
        logout()
      }
    } else if (email) {
      loginUser(email)
    }

    return () => {
      setIsReady(false)
    }
  }, [email, isMounted, login, getCustomer, logout, loggedIn, isCustomerLoggedIn])

  return isReady ? (
    <React.Fragment>
      <StoryFn />
    </React.Fragment>
  ) : null
}

const useCustomerEmails = (platform: SupportedPlatform, longFields = false) => {
  const platformEmails = customerEmails[platform]

  return longFields ? platformEmails.longText : platformEmails.normalText
}

export const getCustomerDecorator = (): DecoratorFunction<JSX.Element>[] => [
  (story, storyContext) => <CustomerDecorator StoryFn={story} context={storyContext} />,
]
