import { useEffect, useMemo } from 'react'
import { gql } from '@apollo/client'
import { useParams, useNavigate } from 'react-router-dom'

import {
  useUpdateAddOnMutation,
  useCreateAddOnMutation,
  useGetSingleAddOnQuery,
  EditAddOnFragment,
  AddOnItemFragmentDoc,
  CreateAddOnInput,
  UpdateAddOnInput,
  LagoApiError,
} from '~/generated/graphql'
import { ERROR_404_ROUTE, ADD_ONS_ROUTE } from '~/core/router'
import { addToast, hasDefinedGQLError } from '~/core/apolloClient'
import { serializeAmount } from '~/core/serializers/serializeAmount'

export enum FORM_ERRORS_ENUM {
  existingCode = 'existingCode',
}

gql`
  fragment EditAddOn on AddOn {
    id
    name
    code
    description
    amountCents
    amountCurrency
    appliedAddOnsCount
  }

  query getSingleAddOn($id: ID!) {
    addOn(id: $id) {
      ...EditAddOn
    }
  }

  mutation createAddOn($input: CreateAddOnInput!) {
    createAddOn(input: $input) {
      id
    }
  }

  mutation updateAddOn($input: UpdateAddOnInput!) {
    updateAddOn(input: $input) {
      ...AddOnItem
    }
  }

  ${AddOnItemFragmentDoc}
`

type UseCreateEditAddOnReturn = {
  loading: boolean
  isEdition: boolean
  addOn?: EditAddOnFragment
  errorCode?: string
  onSave: (value: CreateAddOnInput | UpdateAddOnInput) => Promise<void>
}

const formatCouponInput = (values: CreateAddOnInput | UpdateAddOnInput) => {
  const { amountCents, amountCurrency, ...others } = values

  return {
    amountCents: serializeAmount(Number(amountCents), amountCurrency),
    amountCurrency,
    ...others,
  }
}

export const useCreateEditAddOn: () => UseCreateEditAddOnReturn = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { data, loading, error } = useGetSingleAddOnQuery({
    context: { silentError: LagoApiError.NotFound },
    variables: { id: id as string },
    skip: !id,
  })
  const [create, { error: createError }] = useCreateAddOnMutation({
    context: { silentError: LagoApiError.UnprocessableEntity },
    onCompleted({ createAddOn }) {
      if (!!createAddOn) {
        addToast({
          severity: 'success',
          translateKey: 'text_633336532bdf72cb62dc0692',
        })
        navigate(ADD_ONS_ROUTE)
      }
    },
  })
  const [update, { error: updateError }] = useUpdateAddOnMutation({
    context: { silentError: LagoApiError.UnprocessableEntity },
    onCompleted({ updateAddOn }) {
      if (!!updateAddOn) {
        addToast({
          severity: 'success',
          translateKey: 'text_629728388c4d2300e2d3818a',
        })
        navigate(ADD_ONS_ROUTE)
      }
    },
  })

  useEffect(() => {
    if (hasDefinedGQLError('NotFound', error, 'addOn')) {
      navigate(ERROR_404_ROUTE)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  const errorCode = useMemo(() => {
    if (hasDefinedGQLError('ValueAlreadyExist', createError || updateError)) {
      return FORM_ERRORS_ENUM.existingCode
    }

    return undefined
  }, [createError, updateError])

  return useMemo(
    () => ({
      loading,
      isEdition: !!id,
      errorCode,
      addOn: !data?.addOn ? undefined : data?.addOn,
      onSave: !!id
        ? async (values) => {
            await update({
              variables: {
                input: {
                  id,
                  ...formatCouponInput(values),
                },
              },
            })
          }
        : async (values) => {
            await create({
              variables: {
                input: formatCouponInput(values),
              },
            })
          },
    }),
    [id, data, loading, errorCode, create, update]
  )
}
