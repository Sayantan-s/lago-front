import { object, number, boolean, NumberSchema } from 'yup'
import _get from 'lodash/get'

import {
  FeesPerInvoice,
  CreditNoteFeeErrorEnum,
  FromFee,
  GroupedFee,
} from '~/components/creditNote/types'
import { deserializeAmount } from '~/core/serializers/serializeAmount'
import { CurrencyEnum } from '~/generated/graphql'

export const simpleFeeSchema = (maxAmount: number, currency: CurrencyEnum) =>
  object().shape({
    checked: boolean(),
    value: number()
      .default(0)
      .when('checked', (checked: boolean, schema: NumberSchema) => {
        return !!checked
          ? number()
              .min(0.0000000000000001, CreditNoteFeeErrorEnum.minZero)
              .max(deserializeAmount(maxAmount, currency), CreditNoteFeeErrorEnum.overMax)
              .required('')
          : schema
      }),
  })

export const generateFeesSchema = (formikInitialFees: FeesPerInvoice, currency: CurrencyEnum) =>
  object().shape(
    Object.keys(formikInitialFees || {}).reduce((accSub, subKey) => {
      const subChilds = formikInitialFees[subKey]?.fees

      accSub = {
        ...accSub,
        [subKey]: object().shape({
          fees: object().shape(
            Object.keys(subChilds).reduce((feeGroupAcc, feeGroupKey) => {
              const child = subChilds[feeGroupKey] as FromFee

              if (typeof child.checked === 'boolean') {
                return {
                  ...feeGroupAcc,
                  [feeGroupKey]: simpleFeeSchema(
                    _get(
                      formikInitialFees || {},
                      `${subKey}.fees.${feeGroupKey}.maxAmount`
                    ) as unknown as number,
                    currency
                  ),
                }
              }
              const grouped = (child as unknown as GroupedFee)?.grouped

              return {
                ...feeGroupAcc,
                [feeGroupKey]: object().shape({
                  grouped: object().shape(
                    Object.keys(grouped).reduce((feeAcc, feeKey) => {
                      return {
                        ...feeAcc,
                        [feeKey]: simpleFeeSchema(
                          _get(
                            formikInitialFees || {},
                            `${subKey}.fees.${feeGroupKey}.grouped.${feeKey}.maxAmount`
                          ) as unknown as number,
                          currency
                        ),
                      }
                    }, {})
                  ),
                }),
              }
            }, {})
          ),
        }),
      }
      return accSub
    }, {})
  )
